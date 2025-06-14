class VoiceService {
    constructor() {
      this.recognition = null;
      this.isListening = false;
      this.alwaysListening = false;
      this.personality = 'Coach';
      this.transcriptCallback = null;
      this.responseCallback = null;
      this.chatHistory = [];
      this.chatLogCallback = null;
      
      this.initSpeechRecognition();
    }

    initSpeechRecognition() {
      console.log('🎤 Initializing speech recognition...');
      console.log('🎤 webkitSpeechRecognition available:', !!window.webkitSpeechRecognition);
      console.log('🎤 SpeechRecognition available:', !!window.SpeechRecognition);
      
      if (window.webkitSpeechRecognition || window.SpeechRecognition) {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        console.log('🎤 Speech recognition configured successfully');
        
        // Set up event handlers
        this.recognition.onstart = () => {
          console.log("🎤 Voice recognition started successfully");
          this.isListening = true;
        };
        
        this.recognition.onresult = (e) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const transcript = e.results[i][0].transcript;
            if (e.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (this.transcriptCallback) {
            this.transcriptCallback(finalTranscript, interimTranscript);
          }
          
          if (finalTranscript.trim()) {
            console.log("🗣️ Final transcript:", finalTranscript);
            this.processVoiceCommand(finalTranscript.trim());
          }
        };
        
        // Handle network errors with retry mechanism
        let retryCount = 0;
        const maxRetries = 3;
        
        this.recognition.onerror = (event) => {
          console.log('Speech recognition error:', event.error);
          console.log('Error event details:', event);
          
          if (event.error === 'network') {
            retryCount++;
            if (retryCount <= maxRetries) {
              console.log(`🌐 Network error detected (${retryCount}/${maxRetries}) - this is common in Electron. Attempting retry...`);
              setTimeout(() => {
                console.log(`🔄 Retry ${retryCount}/${maxRetries} for speech recognition...`);
                if (this.recognition && this.isListening) {
                  this.recognition.start();
                }
              }, 1000 * retryCount);
            } else {
              console.log('❌ Max retries reached for network error. Speech recognition may not work in this environment.');
              this.isListening = false;
            }
          } else if (event.error === 'not-allowed') {
            console.error('🎤 Microphone access denied');
            this.isListening = false;
          } else {
            console.error('🎤 Speech recognition error:', event.error);
            this.isListening = false;
          }
        };
        
        this.recognition.onend = () => {
          console.log("Voice recognition ended");
          this.isListening = false;
          
          // Auto-restart if always listening is enabled
          if (this.alwaysListening && this.recognition) {
            setTimeout(() => {
              this.startListening();
            }, 1000);
          }
        };
        
      } else {
        console.warn("🎤 Speech recognition not available in this browser");
      }
    }

    async processVoiceCommand(transcript) {
      console.log("🎙️ Processing voice command:", transcript);
      
      // Check for wake word if always listening
      if (this.alwaysListening) {
        const wakeWord = await this.getWakeWord();
        if (!transcript.toLowerCase().includes(wakeWord.toLowerCase())) {
          console.log(`🛌 Wake word "${wakeWord}" not detected in: "${transcript}"`);
          return;
        }
        
        // Remove wake word from transcript
        const wakeWordRegex = new RegExp(wakeWord, 'gi');
        transcript = transcript.replace(wakeWordRegex, '').trim();
        console.log(`🎯 Wake word detected! Processing: "${transcript}"`);
      }
      
      if (!transcript) return;

      // Add to chat history
      this.chatHistory.push({
        role: 'user',
        content: transcript,
        timestamp: new Date().toISOString()
      });

      // Update chat log
      if (this.chatLogCallback) {
        this.chatLogCallback([...this.chatHistory]);
      }

      try {
        // Get LLM response
        console.log("🤖 Getting LLM response...");
        const response = await this.getLLMResponse(transcript);
        
        // Add to chat history
        this.chatHistory.push({
          role: 'assistant', 
          content: response,
          timestamp: new Date().toISOString()
        });

        // Update chat log
        if (this.chatLogCallback) {
          this.chatLogCallback([...this.chatHistory]);
        }

        // Speak response using ElevenLabs
        console.log("🔊 Speaking response with ElevenLabs...");
        await this.speak(response);
        
        if (this.responseCallback) {
          this.responseCallback(response);
        }
        
      } catch (error) {
        console.error("❌ Error processing voice command:", error);
        const errorResponse = "I'm sorry, I encountered an error processing your request.";
        await this.speak(errorResponse);
        
        if (this.responseCallback) {
          this.responseCallback(errorResponse);
        }
      }
    }

    async getWakeWord() {
      try {
        const { default: apiClient } = await import('./api-client.js');
        return await apiClient.getSetting('wakeWord') || 'Hey Coach';
      } catch (error) {
        console.error('Failed to get wake word:', error);
        return 'Hey Coach';
      }
    }

    async getLLMResponse(userMessage) {
      try {
        console.log("🤖 Calling LLM service with message:", userMessage);
        
        // Use API client for LLM calls to avoid Node.js imports
        const { default: apiClient } = await import('./api-client.js');
        
        // Get the response
        const response = await apiClient.generateLLMResponse(
          userMessage,
          {
            chatHistory: this.chatHistory,
            personality: this.personality
          },
          {
            personality: this.personality,
            requestType: 'voice_interaction'
          }
        );
        
        console.log("✅ LLM response received:", response);
        
        // Handle null response
        if (response === null || response === undefined) {
          throw new Error('LLM service returned null/undefined response');
        }
        
        // Handle response format
        if (response.response) {
          return response.response;
        } else if (typeof response === 'string') {
          return response;
        } else if (response.success === false) {
          throw new Error(response.error || 'LLM service failed');
        } else {
          throw new Error('Unexpected response format from LLM service');
        }
      } catch (error) {
        console.error('❌ LLM service error:', error);
        throw error;
      }
    }

    async speak(text) {
      console.log("🔊 ElevenLabs TTS starting...");
      
      // Get ElevenLabs settings via API client
      let apiKey, voiceId, useElevenLabs;
      
      try {
        const { default: apiClient } = await import('./api-client.js');
        apiKey = await apiClient.getSetting('elevenLabsApiKey');
        voiceId = await apiClient.getSetting('elevenLabsVoiceId') || "21m00Tcm4TlvDq8ikWAM";
        useElevenLabs = await apiClient.getSetting('useElevenLabs') === 'true';
      } catch (error) {
        console.error('❌ Failed to get ElevenLabs settings:', error);
        throw new Error('ElevenLabs settings not available');
      }
      
      // Check if ElevenLabs is configured
      if (!useElevenLabs) {
        console.log('🔊 ElevenLabs is disabled. Using browser text-to-speech fallback.');
        // Fallback to browser TTS
        return this.speakWithBrowserTTS(text);
      }
      
      if (!apiKey || apiKey.trim() === "") {
        throw new Error('ElevenLabs API key not configured. Please add it in Settings.');
      }
      
      console.log(`🎵 Using ElevenLabs voice ID: ${voiceId}`);
      
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: "POST",
          headers: {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": apiKey
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        });
        
        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          // Get volume setting
          let volume = 0.8; // default
          try {
            const { default: apiClient } = await import('./api-client.js');
            const volumeSetting = await apiClient.getSetting('voiceVolume');
            volume = (parseInt(volumeSetting) || 80) / 100;
          } catch (error) {
            console.error('Failed to get volume setting:', error);
          }
          
          audio.volume = volume;
          await audio.play();
          console.log("✅ ElevenLabs speech synthesis successful");
          
          // Clean up the URL after playback
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
          };
          
        } else {
          const errorText = await response.text();
          console.error("❌ ElevenLabs API error:", response.status, errorText);
          throw new Error(`ElevenLabs API failed: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.error("❌ ElevenLabs error:", error);
        throw error;
      }
    }

    async speakWithBrowserTTS(text) {
      console.log('🔊 Using browser text-to-speech:', text);
      
      if (!window.speechSynthesis) {
        throw new Error('Browser text-to-speech not supported');
      }
      
      return new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configure utterance
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        // Get voice volume setting
        this.getVoiceVolume().then(volume => {
          utterance.volume = volume;
        }).catch(() => {
          utterance.volume = 0.8; // fallback
        });
        
        utterance.onend = () => {
          console.log('✅ Browser TTS completed');
          resolve();
        };
        
        utterance.onerror = (error) => {
          console.error('❌ Browser TTS error:', error);
          reject(new Error(`Browser TTS failed: ${error.error}`));
        };
        
        window.speechSynthesis.speak(utterance);
      });
    }

    async getVoiceVolume() {
      try {
        const { default: apiClient } = await import('./api-client.js');
        const volumeSetting = await apiClient.getSetting('voiceVolume');
        return (parseInt(volumeSetting) || 80) / 100;
      } catch (error) {
        console.error('Failed to get voice volume:', error);
        return 0.8;
      }
    }

    async startListening() {
      if (this.recognition && !this.isListening) {
        try {
          console.log("🎤 Starting to listen...");
          
          // Check microphone access
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
              console.log("🎤 Requesting microphone access...");
              
              const devices = await navigator.mediaDevices.enumerateDevices();
              const audioInputs = devices.filter(device => device.kind === 'audioinput');
              console.log("🎤 Available audio input devices:", audioInputs.length);
              audioInputs.forEach((device, index) => {
                console.log(`🎤 Device ${index + 1}: ${device.label} (${device.deviceId})`);
              });
              
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              console.log("🎤 Microphone access granted!");
              
              // Stop the stream as we just needed permission
              stream.getTracks().forEach(track => track.stop());
              
            } catch (micError) {
              console.error("🎤 Microphone access denied:", micError);
              throw new Error(`Microphone access denied: ${micError.message}`);
            }
          }
          
          // Start speech recognition
          this.recognition.start();
          
        } catch (error) {
          console.error("🎤 Error starting voice recognition:", error);
          console.error("🎤 Error details:", {
            name: error.name,
            message: error.message,
            hasRecognition: !!this.recognition,
            isListening: this.isListening
          });
          throw error;
        }
      }
    }

    stopListening() {
      if (this.recognition && this.isListening) {
        console.log("🛑 Stopping voice recognition...");
        this.recognition.stop();
        this.isListening = false;
      }
    }

    setTranscriptCallback(callback) {
      this.transcriptCallback = callback;
    }

    setResponseCallback(callback) {
      this.responseCallback = callback;
    }

    setChatLogCallback(callback) {
      this.chatLogCallback = callback;
    }

    setPersonality(personality) {
      this.personality = personality;
      console.log(`🎭 Voice personality set to: ${personality}`);
    }

    async setAlwaysListening(enabled) {
      this.alwaysListening = enabled;
      console.log(`👂 Always listening mode: ${enabled ? 'enabled' : 'disabled'}`);
      
      if (enabled && !this.isListening) {
        try {
          await this.startListening();
        } catch (error) {
          console.error("Failed to start always listening:", error);
        }
      } else if (!enabled && this.isListening) {
        this.stopListening();
      }
    }

    clearChatHistory() {
      this.chatHistory = [];
      console.log("🗑️ Chat history cleared");
      
      if (this.chatLogCallback) {
        this.chatLogCallback([]);
      }
    }

    getChatHistory() {
      return [...this.chatHistory];
    }
  }

  const voiceService = new VoiceService();
  export default voiceService;