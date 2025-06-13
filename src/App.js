import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import Goals from './components/Goals';
import Habits from './components/Habits';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import VoiceInterface from './components/VoiceInterface';
import VoiceChatLog from './components/VoiceChatLog';
import voiceService from './shared/voice-service';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPersonality, setCurrentPersonality] = useState('Coach');
  const [chatMessages, setChatMessages] = useState([]);
  const [showChatLog, setShowChatLog] = useState(false);

  // Set up voice service chat log callback
  useEffect(() => {
    voiceService.setChatLogCallback(setChatMessages);
    return () => {
      voiceService.setChatLogCallback(null);
    };
  }, []);

  return (
    <Router>
      <div className="flex h-screen bg-gray-950 text-white">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        <main className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/habits" element={<Habits />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
          
          <VoiceInterface 
            personality={currentPersonality}
            onPersonalityChange={setCurrentPersonality}
            onShowChatLog={() => setShowChatLog(true)}
          />
        </main>

        {/* Voice Chat Log */}
        <VoiceChatLog
          messages={chatMessages}
          isVisible={showChatLog}
          onToggle={() => setShowChatLog(!showChatLog)}
          onClear={() => {
            voiceService.clearChatHistory();
            setChatMessages([]);
          }}
        />
      </div>
    </Router>
  );
}

export default App;