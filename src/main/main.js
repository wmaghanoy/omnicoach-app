const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const http = require('http');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      webSecurity: true
    },
    show: false,
    backgroundColor: '#0f0f0f'
  });

  // Handle permission requests
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    console.log('🔐 Permission requested:', permission);
    if (permission === 'microphone') {
      console.log('🎤 Granting microphone permission');
      callback(true);
    } else {
      callback(false);
    }
  });

  // Set additional security headers (temporarily disabled for debugging)
  /*
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' data: blob:; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data: blob:; " +
          "font-src 'self' data:; " +
          "connect-src 'self' ws: wss: http://localhost:* https://api.elevenlabs.io https://api.openai.com https://api.anthropic.com http://localhost:11434; " +
          "media-src 'self' blob: data:; " +
          "worker-src 'self' blob:;"
        ]
      }
    });
  });
  */

  const startUrl = isDev 
    ? 'http://localhost:3281' 
    : `file://${path.join(__dirname, '../build/index.html')}`;

  // In development, wait for React dev server to start
  if (isDev) {
    // Wait for React dev server to be ready
    const waitForServer = async () => {
      const maxAttempts = 60; // Increased from 20 to 60 (30 seconds)
      for (let i = 0; i < maxAttempts; i++) {
        try {
          await new Promise((resolve, reject) => {
            const req = http.get('http://localhost:3281', (res) => {
              resolve(res);
            });
            req.on('error', reject);
            req.setTimeout(2000, () => reject(new Error('Timeout'))); // Increased timeout
          });
          console.log('✅ React dev server is ready!');
          return true;
        } catch (error) {
          // Server not ready yet
          console.log(`⏳ Waiting for React dev server... (${i + 1}/${maxAttempts})`);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      return false;
    };

    waitForServer().then(ready => {
      if (ready) {
        mainWindow.loadURL(startUrl);
      } else {
        console.error('React dev server failed to start');
        mainWindow.loadURL(`data:text/html,<h1>Failed to connect to React dev server at ${startUrl}</h1>`);
      }
    });
  } else {
    mainWindow.loadURL(startUrl);
  }

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize database and create window
let db = null;
app.whenReady().then(async () => {
  const { initDatabase } = require('../shared/database');
  try {
    db = initDatabase();
    console.log('Database initialized successfully');
    
    // Initialize system services
    const systemMonitor = require('../shared/system-monitor');
    const feedbackSystem = require('../shared/feedback-system');
    
    await systemMonitor.startMonitoring();
    await feedbackSystem.initialize();
    
    console.log('System services initialized');
  } catch (error) {
    console.error('Failed to initialize database or services:', error);
  }
  
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Clean up services before quitting
    const systemMonitor = require('../shared/system-monitor');
    const feedbackSystem = require('../shared/feedback-system');
    
    systemMonitor.stopMonitoring();
    feedbackSystem.stop();
    
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for database operations
ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('show-error-dialog', (event, title, message) => {
  dialog.showErrorBox(title, message);
});

// Task operations
ipcMain.handle('tasks:getAll', async () => {
  const { TaskModel } = require('../shared/models');
  return TaskModel.getAll();
});

ipcMain.handle('tasks:create', async (event, task) => {
  const { TaskModel } = require('../shared/models');
  return TaskModel.create(task);
});

ipcMain.handle('tasks:update', async (event, id, updates) => {
  const { TaskModel } = require('../shared/models');
  return TaskModel.update(id, updates);
});

ipcMain.handle('tasks:delete', async (event, id) => {
  const { TaskModel } = require('../shared/models');
  return TaskModel.delete(id);
});

// Goal operations
ipcMain.handle('goals:getAll', async () => {
  const { GoalModel } = require('../shared/models');
  return GoalModel.getAll();
});

ipcMain.handle('goals:create', async (event, goal) => {
  const { GoalModel } = require('../shared/models');
  return GoalModel.create(goal);
});

ipcMain.handle('goals:update', async (event, id, updates) => {
  const { GoalModel } = require('../shared/models');
  return GoalModel.update(id, updates);
});

// Habit operations
ipcMain.handle('habits:getAll', async () => {
  const { HabitModel } = require('../shared/models');
  return HabitModel.getAll();
});

ipcMain.handle('habits:getTodayEntries', async () => {
  const { HabitModel } = require('../shared/models');
  return HabitModel.getTodayEntries();
});

ipcMain.handle('habits:create', async (event, habit) => {
  const { HabitModel } = require('../shared/models');
  return HabitModel.create(habit);
});

ipcMain.handle('habits:logEntry', async (event, habitId, date, completed, count, notes) => {
  const { HabitModel } = require('../shared/models');
  return HabitModel.logEntry(habitId, date, completed, count, notes);
});

// LLM operations
ipcMain.handle('llm:generateResponse', async (event, prompt, context, options) => {
  const llmService = require('../shared/llm-service');
  return llmService.generateResponse(prompt, context, options);
});

ipcMain.handle('llm:getMonthlyStats', async () => {
  const { LLMUsageModel } = require('../shared/models');
  return LLMUsageModel.getMonthlyStats();
});

ipcMain.handle('llm:checkBudget', async () => {
  const llmService = require('../shared/llm-service');
  return llmService.checkBudget();
});

// Settings operations
ipcMain.handle('settings:get', async (event, key) => {
  const { SettingsModel } = require('../shared/models');
  return SettingsModel.get(key);
});

ipcMain.handle('settings:set', async (event, key, value) => {
  const { SettingsModel } = require('../shared/models');
  return SettingsModel.set(key, value);
});

ipcMain.handle('settings:getAll', async () => {
  const { SettingsModel } = require('../shared/models');
  return SettingsModel.getAll();
});

// System monitoring
ipcMain.handle('monitoring:log', async (event, entry) => {
  const { SystemMonitoringModel } = require('../shared/models');
  return SystemMonitoringModel.log(entry);
});

ipcMain.handle('monitoring:getToday', async () => {
  const { SystemMonitoringModel } = require('../shared/models');
  return SystemMonitoringModel.getToday();
});

ipcMain.handle('monitoring:getStats', async (event, days) => {
  const { SystemMonitoringModel } = require('../shared/models');
  return SystemMonitoringModel.getStats(days);
});

ipcMain.handle('monitoring:getTodayStats', async () => {
  const systemMonitor = require('../shared/system-monitor');
  return systemMonitor.getTodayStats();
});

// Feedback system
ipcMain.handle('feedback:generate', async (event, triggerType, context) => {
  const feedbackSystem = require('../shared/feedback-system');
  return feedbackSystem.generateFeedback(triggerType, context);
});

ipcMain.handle('feedback:getRecent', async (event, limit) => {
  const feedbackSystem = require('../shared/feedback-system');
  return feedbackSystem.getRecentFeedback(limit);
});

ipcMain.handle('feedback:rate', async (event, feedbackId, rating) => {
  const feedbackSystem = require('../shared/feedback-system');
  return feedbackSystem.rateFeedback(feedbackId, rating);
});