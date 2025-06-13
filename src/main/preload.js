const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  invoke: (channel, ...args) => {
    // Whitelist channels for security
    const validChannels = [
      'tasks:getAll',
      'tasks:create', 
      'tasks:update',
      'tasks:delete',
      'goals:getAll',
      'goals:create',
      'goals:update', 
      'habits:getAll',
      'habits:getTodayEntries',
      'habits:create',
      'habits:logEntry',
      'llm:generateResponse',
      'llm:getMonthlyStats',
      'llm:checkBudget',
      'settings:get',
      'settings:set',
      'settings:getAll',
      'monitoring:log',
      'monitoring:getToday',
      'monitoring:getStats',
      'monitoring:getTodayStats',
      'feedback:generate',
      'feedback:getRecent',
      'feedback:rate',
      'voice:processCommand'
    ];
    
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    } else {
      console.error('Invalid IPC channel:', channel);
      return Promise.reject(new Error(`Invalid IPC channel: ${channel}`));
    }
  }
});

console.log('🔌 Preload script loaded successfully');