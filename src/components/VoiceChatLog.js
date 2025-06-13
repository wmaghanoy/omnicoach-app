import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  User, 
  Bot, 
  X, 
  Download,
  Trash2,
  Clock
} from 'lucide-react';

const VoiceChatLog = ({ messages, onClear, isVisible, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const exportChatLog = () => {
    const chatText = messages.map(msg => {
      const time = formatTime(msg.timestamp);
      const speaker = msg.type === 'user' ? 'You' : msg.personality || 'AI';
      return `[${time}] ${speaker}: ${msg.text}`;
    }).join('\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed right-4 bottom-20 bg-gray-900 border border-gray-700 rounded-lg shadow-xl transition-all duration-300 ${
      isExpanded ? 'w-96 h-96' : 'w-80 h-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-white">Voice Chat Log</span>
          <span className="text-xs text-gray-400">({messages.length})</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            <div className={`w-3 h-3 border border-gray-400 ${isExpanded ? 'rotate-45' : ''} transition-transform`} />
          </button>
          {messages.length > 0 && (
            <>
              <button
                onClick={exportChatLog}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Export chat log"
              >
                <Download className="w-3 h-3" />
              </button>
              <button
                onClick={onClear}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                title="Clear chat log"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
          <button
            onClick={onToggle}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ height: isExpanded ? '320px' : '180px' }}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            <div className="text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p>No voice conversations yet</p>
              <p className="text-xs mt-1">Start talking to see your chat history</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-2 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white ml-8' 
                  : 'bg-gray-800 text-gray-100 mr-8'
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  {message.type === 'user' ? (
                    <User className="w-3 h-3" />
                  ) : (
                    <Bot className="w-3 h-3" />
                  )}
                  <span className="text-xs font-medium">
                    {message.type === 'user' ? 'You' : (message.personality || 'AI')}
                  </span>
                  <div className="flex items-center space-x-1 text-xs opacity-70">
                    <Clock className="w-2 h-2" />
                    <span>{formatTime(message.timestamp)}</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{message.text}</p>
                {message.confidence && (
                  <div className="text-xs opacity-70 mt-1">
                    Confidence: {Math.round(message.confidence * 100)}%
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-700">
        <div className="text-xs text-gray-500 flex items-center justify-between">
          <span>Real-time voice conversation log</span>
          {messages.length > 0 && (
            <span>{messages.filter(m => m.type === 'user').length} spoken, {messages.filter(m => m.type === 'ai').length} responses</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceChatLog;