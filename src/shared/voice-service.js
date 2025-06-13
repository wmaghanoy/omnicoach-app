class VoiceService {
    constructor() {
      this.synthesis = window.speechSynthesis;
      this.recognition = null;
      this.isListening = false;
      this.alwaysListening = false;
      this.personality = 'Coach';
      this.transcriptCallback = null;
      this.responseCallback = null;
      this.chatHistory = [];
      this.chatLogCallback = null;
      
      // Initialize logging if in Electron
      this.logger = null;
      if (typeof window !== 'undefined' && window.require) {
        try {
          this.logger = window.require('../shared/logger');
          this.logger.info('VoiceService initialized');
        } catch (error) {
          console.warn('Could not initialize logger:', error);
        }
      }
      
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
          
          // Call transcript callback with interim results
          if (this.transcriptCallback) {
            this.transcriptCallback(interimTranscript || finalTranscript, !!finalTranscript);
          }
          
          // Process final result
          if (finalTranscript) {
            console.log("Final transcript:", finalTranscript);
            const trimmedText = finalTranscript.trim();
            
            // Add user message to chat history
            this.addMessageToHistory('user', trimmedText);
            
            this.processVoiceCommand(trimmedText);
          }
        };
        
        this.recognition.onerror = (e) => {
          console.error("Speech recognition error:", e.error);
          this.isListening = false;
        };
        
        this.recognition.onend = () => {
          console.log("Voice recognition ended");
          this.isListening = false;
          
          // Restart if always listening is enabled
          if (this.alwaysListening) {
            setTimeout(() => this.startListening().catch(console.error), 1000);
          }
        };
      }
    }

    async processVoiceCommand(text) {
      console.log(`🎤 Processing voice command: "${text}" with personality: ${this.personality}`);
      this.logger?.voice('Processing voice command', { text, personality: this.personality });
      
      try {
        // Check if we're in Electron environment
        if (typeof window === 'undefined' || !window.require) {
          console.error('❌ Not in Electron environment - window.require not available');
          throw new Error('Electron IPC not available');
        }
        
        console.log('📋 Getting user context...');
        const userContext = await this.getUserContext();
        console.log('✅ User context retrieved:', Object.keys(userContext));
        
        console.log('🤖 Generating AI response...');
        const aiResponse = await this.generateAIResponse(text, userContext);
        console.log('✅ AI response generated:', aiResponse?.substring(0, 100) + '...');
        
        // Add AI response to chat history
        this.addMessageToHistory('ai', aiResponse, this.personality);
        
        // Call response callback and speak
        if (this.responseCallback) {
          this.responseCallback(aiResponse);
        }
        this.speak(aiResponse);
        
      } catch (error) {
        console.error('❌ Error processing voice command:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          electronAvailable: !!window.electron,
          invokeAvailable: !!window.electron?.invoke
        });
        
        const fallbackResponse = `I'm having trouble processing that right now. Error: ${error.message}`;
        
        // Add error response to chat history
        this.addMessageToHistory('ai', fallbackResponse, this.personality);
        
        if (this.responseCallback) {
          this.responseCallback(fallbackResponse);
        }
        this.speak(fallbackResponse);
      }
    }

    async getUserContext() {
      // Get user data via Electron IPC if available
      try {
        if (typeof window !== 'undefined' && window.require) {
          const { ipcRenderer } = window.require('electron');
          
          console.log('📊 Fetching user data via direct IPC...');
          const [tasks, goals, habits] = await Promise.all([
            ipcRenderer.invoke('tasks:getAll').catch((e) => { console.warn('Tasks fetch failed:', e); return []; }),
            ipcRenderer.invoke('goals:getAll').catch((e) => { console.warn('Goals fetch failed:', e); return []; }),
            ipcRenderer.invoke('habits:getAll').catch((e) => { console.warn('Habits fetch failed:', e); return []; })
          ]);
          
          console.log('📊 User data fetched:', { 
            tasksCount: tasks.length, 
            goalsCount: goals.length, 
            habitsCount: habits.length 
          });
          
          return { tasks, goals, habits };
        } else {
          console.warn('❌ window.require not available');
          return {};
        }
      } catch (error) {
        console.warn('❌ Could not fetch user context:', error);
        return {};
      }
    }

    async generateAIResponse(prompt, context) {
      // Use LLM service if available via IPC
      try {
        if (typeof window !== 'undefined' && window.require) {
          const { ipcRenderer } = window.require('electron');
          
          console.log('🔄 Calling LLM via direct IPC with:', {
            prompt: prompt.substring(0, 50) + '...',
            contextKeys: Object.keys(context),
            personality: this.personality
          });
          
          const response = await ipcRenderer.invoke('llm:generateResponse', 
            prompt, 
            context, 
            {
              personality: this.personality,
              requestType: 'voice_command'
            }
          );
          
          console.log('🔄 Raw IPC response received:', response);
        } else {
          throw new Error('Electron IPC not available - window.require not found');
        }
        
        console.log('🤖 LLM response received:', {
          type: typeof response,
          isNull: response === null,
          hasResponse: !!response?.response,
          isString: typeof response === 'string',
          success: !!response?.success,
          preview: (response?.response || response)?.substring(0, 100) + '...',
          fullResponse: response
        });
        
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
      const apiKey = localStorage.getItem("elevenlabs_api_key");
      const voiceId = localStorage.getItem("elevenlabs_voice_id") || "21m00Tcm4TlvDq8ikWAM"; // Default voice ID
      const useElevenLabs = localStorage.getItem("useElevenLabs") === 'true';
      
      // Check if ElevenLabs should be used and API key is available
      if (useElevenLabs && apiKey && apiKey !== "your-api-key" && apiKey.trim() !== "") {
        console.log(`Attempting ElevenLabs speech synthesis with voice ID: ${voiceId}...`);
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
            audio.play();
            console.log("✅ ElevenLabs speech synthesis successful");
            return;
          } else {
            const errorText = await response.text();
            console.error("ElevenLabs API error:", response.status, errorText);
            throw new Error(`ElevenLabs API failed: ${response.status}`);
          }
        } catch (error) {
          console.error("❌ ElevenLabs error, falling back to browser speech:", error.message);
        }
      } else {
        if (useElevenLabs && !apiKey) {
          console.log("🔑 ElevenLabs enabled but no API key found. Using browser speech synthesis.");
        } else {
          console.log("🔊 Using browser speech synthesis (ElevenLabs disabled or not configured)");
        }
      }
      
      // Fallback to browser speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = (localStorage.getItem("voiceVolume") || 80) / 100;
      this.synthesis.speak(utterance);
    }

    async startListening() {
      if (this.recognition && !this.isListening) {
        try {
          console.log("🎤 Starting to listen...");
          console.log("🎤 Recognition object:", !!this.recognition);
          console.log("🎤 Currently listening:", this.isListening);
          
          // First, check if we can access the microphone
          try {
            console.log("🎤 Requesting microphone access...");
            
            // Check if mediaDevices is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
              throw new Error("MediaDevices API not supported in this environment");
            }
            
            // List available audio input devices
            try {
              const devices = await navigator.mediaDevices.enumerateDevices();
              const audioInputs = devices.filter(device => device.kind === 'audioinput');
              console.log("🎤 Available audio input devices:", audioInputs.length);
              audioInputs.forEach((device, index) => {
                console.log(`🎤 Device ${index + 1}: ${device.label || 'Unknown device'} (${device.deviceId})`);
              });
              
              if (audioInputs.length === 0) {
                throw new Error("No microphone devices found. This might be because you're running in WSL or a virtual environment without audio device access.");
              }
            } catch (enumError) {
              console.warn("🎤 Could not enumerate devices:", enumError);
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("🎤 Microphone access granted!");
            
            // Stop the stream since we just needed to check permission
            stream.getTracks().forEach(track => track.stop());
            
            // Now start speech recognition
            this.recognition.start();
          } catch (micError) {
            console.error("🎤 Microphone access denied:", micError);
            
            // Provide helpful error messages based on the error
            let errorMessage = `Microphone access denied: ${micError.message}`;
            
            if (micError.message.includes("Requested device not found")) {
              errorMessage += "\n\n🔧 Possible solutions:\n" +
                "1. If you're using WSL, try running the app on Windows directly\n" +
                "2. Check if your microphone is connected and working\n" +
                "3. Try using a different browser\n" +
                "4. Check system audio settings";
            }
            
            throw new Error(errorMessage);
          }
        } catch (error) {
          console.error("🎤 Error starting voice recognition:", error);
          console.error("🎤 Error details:", {
            name: error.name,
            message: error.message,
            hasRecognition: !!this.recognition,
            isListening: this.isListening
          });
        }
      } else {
        console.warn("🎤 Cannot start listening:", {
          hasRecognition: !!this.recognition,
          isListening: this.isListening
        });
      }
    }

    stopListening() {
      if (this.recognition && this.isListening) {
        console.log("Stopping voice recognition...");
        this.recognition.stop();
        this.isListening = false;
      }
    }

    setPersonality(personality) {
      this.personality = personality || 'Coach';
      console.log("Voice personality set to:", this.personality);
    }

    setCallbacks(transcriptCallback, responseCallback) {
      this.transcriptCallback = transcriptCallback;
      this.responseCallback = responseCallback;
      console.log("Voice callbacks set");
    }

    setEnabled(enabled) {
      if (!enabled && this.isListening) {
        this.stopListening();
      }
      console.log("Voice service enabled:", enabled);
    }

    setAlwaysListening(alwaysListening) {
      this.alwaysListening = alwaysListening;
      console.log("Always listening set to:", alwaysListening);
      
      if (alwaysListening && !this.isListening) {
        this.startListening().catch(console.error);
      } else if (!alwaysListening && this.isListening) {
        this.stopListening();
      }
    }

    isSupported() {
      return !!(window.webkitSpeechRecognition || window.SpeechRecognition);
    }

    // Chat history management
    addMessageToHistory(type, text, personality = null, confidence = null) {
      const message = {
        type, // 'user' or 'ai'
        text,
        timestamp: Date.now(),
        personality: personality || this.personality,
        confidence
      };
      
      this.chatHistory.push(message);
      console.log(`💬 Added ${type} message to chat history:`, text.substring(0, 50) + '...', {
        totalMessages: this.chatHistory.length,
        hasCallback: !!this.chatLogCallback,
        message
      });
      
      // Notify chat log component
      if (this.chatLogCallback) {
        console.log('💬 Calling chat log callback with', this.chatHistory.length, 'messages');
        this.chatLogCallback([...this.chatHistory]); // Create new array to trigger React update
      } else {
        console.warn('💬 No chat log callback set!');
      }
      
      // Keep only last 100 messages to prevent memory issues
      if (this.chatHistory.length > 100) {
        this.chatHistory = this.chatHistory.slice(-100);
      }
    }

    setChatLogCallback(callback) {
      this.chatLogCallback = callback;
      console.log('💬 Chat log callback set:', typeof callback, {
        currentHistoryLength: this.chatHistory.length,
        callbackIsFunction: typeof callback === 'function'
      });
      
      // Immediately send existing history
      if (callback && this.chatHistory.length > 0) {
        console.log('💬 Sending existing chat history to callback');
        callback([...this.chatHistory]);
      }
    }

    getChatHistory() {
      return this.chatHistory;
    }

    clearChatHistory() {
      this.chatHistory = [];
      console.log('Chat history cleared');
      
      if (this.chatLogCallback) {
        this.chatLogCallback(this.chatHistory);
      }
    }

    exportChatHistory() {
      return this.chatHistory.map(msg => ({
        ...msg,
        formattedTime: new Date(msg.timestamp).toLocaleString()
      }));
    }
  }

  const voiceService = new VoiceService();
  export default voiceService;
