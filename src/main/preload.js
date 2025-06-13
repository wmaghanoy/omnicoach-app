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
      'voice:processCommand',
      'get-app-path',
      'show-error-dialog'
    ];
    
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args).catch(error => {
        console.error(`IPC Error on channel ${channel}:`, error);
        throw error;
      });
    } else {
      console.error('Invalid IPC channel:', channel);
      return Promise.reject(new Error(`Invalid IPC channel: ${channel}`));
    }
  },
  
  // Expose platform info for debugging
  platform: process.platform,
  
  // Expose version info
  versions: {
    node: process.versions.node,
    electron: process.versions.electron,
    chrome: process.versions.chrome
  }
});

console.log('🔌 Preload script loaded successfully');