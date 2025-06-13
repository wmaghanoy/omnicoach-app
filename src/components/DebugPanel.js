import React, { useState, useEffect } from 'react';
import { Bug, Download, Trash2, Copy } from 'lucide-react';

const DebugPanel = () => {
  const [logs, setLogs] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Capture console logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (type, args) => {
      const timestamp = new Date().toISOString();
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [...prev.slice(-999), { // Keep last 1000 logs
        id: Date.now() + Math.random(),
        timestamp,
        type,
        message
      }]);
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog('log', args);
    };

    console.error = (...args) => {
      originalError(...args);
      addLog('error', args);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog('warn', args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.type === filter;
  });

  const exportLogs = () => {
    const logText = filteredLogs
      .map(log => `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}`)
      .join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnicoach-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyLogs = () => {
    const logText = filteredLogs
      .map(log => `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}`)
      .join('\n');
    navigator.clipboard.writeText(logText);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg z-50"
        title="Open Debug Panel"
      >
        <Bug className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h3 className="text-white font-medium">Debug Panel</h3>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
          >
            <option value="all">All</option>
            <option value="log">Log</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
          </select>
          <button
            onClick={copyLogs}
            className="p-1 text-gray-400 hover:text-white"
            title="Copy logs"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={exportLogs}
            className="p-1 text-gray-400 hover:text-white"
            title="Export logs"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={clearLogs}
            className="p-1 text-gray-400 hover:text-white"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="h-80 overflow-y-auto p-2">
        {filteredLogs.length === 0 ? (
          <div className="text-gray-500 text-sm">No logs to display</div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className={`text-xs mb-1 p-1 rounded ${
                log.type === 'error' ? 'bg-red-900/30 text-red-300' :
                log.type === 'warn' ? 'bg-yellow-900/30 text-yellow-300' :
                'bg-gray-800/30 text-gray-300'
              }`}
            >
              <div className="text-gray-500">
                {new Date(log.timestamp).toLocaleTimeString()}
              </div>
              <div className="font-mono whitespace-pre-wrap break-words">
                {log.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DebugPanel;