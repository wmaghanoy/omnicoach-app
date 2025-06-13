class ElevenLabsService {
    constructor() {
      this.isInitialized = false;
      this.apiKey = null;
      this.voiceId = null;
    }

    async initialize(apiKey, voiceId = null) {
      console.log("ElevenLabs initializing...");
      this.apiKey = apiKey;
      this.voiceId = voiceId || "21m00Tcm4TlvDq8ikWAM"; // Default voice ID
      this.isInitialized = !!apiKey;
      return this.isInitialized;
    }

    async speak(text, personality = null) {
      if (!this.isInitialized || !this.apiKey) {
        console.log("ElevenLabs not initialized or no API key");
        return { success: false, fallback: true };
      }

      console.log(`ElevenLabs speak called with voice ID: ${this.voiceId}`);
      
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`, {
          method: "POST",
          headers: {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": this.apiKey
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
          await audio.play();
          console.log("✅ ElevenLabs speech synthesis successful");
          return { success: true, fallback: false };
        } else {
          const errorText = await response.text();
          console.error("ElevenLabs API error:", response.status, errorText);
          return { success: false, fallback: true, error: `API error: ${response.status}` };
        }
      } catch (error) {
        console.error("ElevenLabs error:", error);
        return { success: false, fallback: true, error: error.message };
      }
    }

    updateVoiceId(voiceId) {
      this.voiceId = voiceId || "21m00Tcm4TlvDq8ikWAM";
      console.log(`ElevenLabs voice ID updated to: ${this.voiceId}`);
    }

    isAvailable() {
      return this.isInitialized;
    }
  }

  const elevenLabsService = new ElevenLabsService();
  export default elevenLabsService;
