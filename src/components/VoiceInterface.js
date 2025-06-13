import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  User,
  MessageCircle
} from 'lucide-react';
import voiceService from '../shared/voice-service';

const VoiceInterface = ({ personality, onPersonalityChange, onShowChatLog }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [alwaysListening, setAlwaysListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');

  const personalities = [
    { id: 'coach', name: 'Coach', description: 'Supportive productivity coach' },
    { id: 'picard', name: 'Jean-Luc Picard', description: 'Wise starship captain' },
    { id: 'therapist', name: 'Therapist', description: 'Calm mental health support' },
  ];

  // Initialize voice service on component mount
  useEffect(() => {
    console.log('🎤 VoiceInterface: Initializing voice service');
    
    // Set up callbacks for voice service
    voiceService.setCallbacks(
      (transcript, isFinal) => {
        setCurrentTranscript(transcript);
        if (isFinal) {
          setTimeout(() => setCurrentTranscript(''), 3000); // Clear after 3 seconds
        }
      },
      (response) => {
        setLastResponse(response);
        setIsSpeaking(true);
        setTimeout(() => setIsSpeaking(false), response.length * 50); // Estimate speaking time
      }
    );

    // Set personality
    voiceService.setPersonality(personality);

    // Check if voice is supported
    if (!voiceService.isSupported()) {
      console.warn('🎤 Voice recognition not supported in this browser');
      setIsEnabled(false);
    }

    // Sync listening state
    const checkListeningState = () => {
      setIsListening(voiceService.isListening);
    };
    const interval = setInterval(checkListeningState, 1000);
    
    return () => {
      voiceService.stopListening();
      clearInterval(interval);
    };
  }, []);

  // Update personality when it changes
  useEffect(() => {
    voiceService.setPersonality(personality);
  }, [personality]);

  const toggleListening = async () => {
    if (!isEnabled) return;
    
    try {
      if (!isListening) {
        console.log('🎤 VoiceInterface: Starting listening');
        await voiceService.startListening();
        setIsListening(true);
        setCurrentTranscript('Listening...');
      } else {
        console.log('🎤 VoiceInterface: Stopping listening');
        voiceService.stopListening();
        setIsListening(false);
        setCurrentTranscript('');
      }
    } catch (error) {
      console.error('🎤 VoiceInterface: Error toggling listening:', error);
      setIsListening(false);
      alert(`Voice recognition error: ${error.message}`);
    }
  };

  const toggleAlwaysListening = () => {
    const newAlwaysListening = !alwaysListening;
    setAlwaysListening(newAlwaysListening);
    voiceService.setAlwaysListening(newAlwaysListening);
    
    if (newAlwaysListening) {
      setIsListening(true);
    } else {
      setIsListening(false);
    }
  };

  const toggleEnabled = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    voiceService.setEnabled(newEnabled);
    
    if (!newEnabled) {
      setIsListening(false);
      setAlwaysListening(false);
    }
  };

  return (
    <div className="border-t border-gray-800 bg-gray-900 p-4">
      <div className="flex items-center justify-between">
        {/* Voice Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleListening}
            disabled={!isEnabled}
            className={`p-3 rounded-full transition-all ${
              isListening 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            } ${!isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleEnabled}
              className={`p-2 rounded transition-colors ${
                isEnabled ? 'text-green-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-800'
              }`}
            >
              {isEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <label className="flex items-center space-x-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={alwaysListening}
                onChange={toggleAlwaysListening}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span>Always listening</span>
            </label>
          </div>
        </div>

        {/* Personality Selector */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <select
              value={personality}
              onChange={(e) => onPersonalityChange(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {personalities.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={onShowChatLog}
            className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Show chat log"
          >
            <MessageCircle className="w-4 h-4" />
          </button>

          <button className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Display */}
      {(currentTranscript || lastResponse || isSpeaking) && (
        <div className="mt-3 p-3 bg-gray-800 rounded-lg">
          {isListening && currentTranscript && (
            <div className="flex items-start space-x-2 mb-2">
              <MessageCircle className="w-4 h-4 text-blue-400 mt-0.5" />
              <div>
                <div className="text-xs text-blue-400 font-medium">You</div>
                <div className="text-sm text-gray-300">{currentTranscript}</div>
              </div>
            </div>
          )}

          {isSpeaking && (
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-gray-400">{personality} is speaking...</span>
            </div>
          )}

          {lastResponse && !isSpeaking && (
            <div className="flex items-start space-x-2">
              <MessageCircle className="w-4 h-4 text-green-400 mt-0.5" />
              <div>
                <div className="text-xs text-green-400 font-medium">{personality}</div>
                <div className="text-sm text-gray-300">{lastResponse}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceInterface;