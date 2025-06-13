const { exec } = require('child_process');
const { SystemMonitoringModel } = require('./models');

class SystemMonitor {
  constructor() {
    this.isMonitoring = false;
    this.currentSession = null;
    this.lastActiveApp = null;
    this.sessionStartTime = null;
    
    // App productivity scores (can be customized by user)
    this.productivityScores = {
      'code': 95,
      'vs code': 95,
      'visual studio code': 95,
      'intellij': 95,
      'pycharm': 95,
      'sublime': 90,
      'atom': 90,
      'notepad++': 85,
      'notion': 85,
      'obsidian': 85,
      'word': 75,
      'excel': 80,
      'powerpoint': 70,
      'chrome': 60,
      'firefox': 60,
      'edge': 60,
      'safari': 60,
      'slack': 70,
      'teams': 70,
      'zoom': 65,
      'discord': 40,
      'steam': 20,
      'netflix': 10,
      'youtube': 30,
      'twitter': 25,
      'facebook': 25,
      'instagram': 20,
      'reddit': 30,
      'spotify': 50,
      'music': 50
    };
  }

  async startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('System monitoring started');
    
    // Check active window every 10 seconds
    this.monitorInterval = setInterval(() => {
      this.checkActiveWindow();
    }, 10000);
    
    // Log productivity sessions every 5 minutes
    this.sessionInterval = setInterval(() => {
      this.logCurrentSession();
    }, 5 * 60 * 1000);
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    console.log('System monitoring stopped');
    
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
    
    if (this.sessionInterval) {
      clearInterval(this.sessionInterval);
    }
    
    // Log final session
    this.logCurrentSession();
  }

  async checkActiveWindow() {
    try {
      const activeApp = await this.getActiveApplication();
      
      if (activeApp && activeApp !== this.lastActiveApp) {
        // Log previous session if exists
        if (this.currentSession) {
          await this.logCurrentSession();
        }
        
        // Start new session
        this.startNewSession(activeApp);
      }
    } catch (error) {
      console.error('Error checking active window:', error);
    }
  }

  async getActiveApplication() {
    return new Promise((resolve, reject) => {
      let command;
      
      if (process.platform === 'win32') {
        // Windows - get active window
        command = 'powershell "Get-Process | Where-Object {$_.MainWindowTitle -ne \\"\\"} | Select-Object ProcessName, MainWindowTitle | ConvertTo-Json"';
      } else if (process.platform === 'darwin') {
        // macOS - get frontmost app
        command = 'osascript -e "tell application \\"System Events\\" to get name of first application process whose frontmost is true"';
      } else {
        // Linux - get active window (requires xdotool)
        command = 'xdotool getwindowfocus getwindowname 2>/dev/null || echo "Unknown"';
      }

      exec(command, (error, stdout, stderr) => {
        if (error) {
          resolve('Unknown');
          return;
        }

        try {
          if (process.platform === 'win32') {
            const processes = JSON.parse(stdout);
            if (processes && processes.length > 0) {
              const activeProcess = processes[0];
              resolve({
                app: activeProcess.ProcessName,
                title: activeProcess.MainWindowTitle
              });
            } else {
              resolve('Unknown');
            }
          } else {
            const appName = stdout.trim();
            resolve({
              app: appName,
              title: appName
            });
          }
        } catch (parseError) {
          resolve('Unknown');
        }
      });
    });
  }

  startNewSession(appInfo) {
    this.currentSession = {
      app_name: typeof appInfo === 'string' ? appInfo : appInfo.app,
      window_title: typeof appInfo === 'object' ? appInfo.title : null,
      start_time: Date.now()
    };
    
    this.lastActiveApp = this.currentSession.app_name;
    this.sessionStartTime = Date.now();
  }

  async logCurrentSession() {
    if (!this.currentSession) return;
    
    const duration = Math.round((Date.now() - this.sessionStartTime) / 1000); // seconds
    
    if (duration < 5) return; // Ignore very short sessions
    
    const productivity_score = this.calculateProductivityScore(this.currentSession.app_name);
    
    const entry = {
      app_name: this.currentSession.app_name,
      window_title: this.currentSession.window_title,
      duration: duration,
      activity_type: this.categorizeActivity(this.currentSession.app_name),
      productivity_score: productivity_score
    };

    try {
      await SystemMonitoringModel.log(entry);
      console.log(`Logged session: ${entry.app_name} (${duration}s, ${productivity_score}% productive)`);
    } catch (error) {
      console.error('Error logging session:', error);
    }
    
    this.currentSession = null;
  }

  calculateProductivityScore(appName) {
    if (!appName) return 50;
    
    const lowercaseApp = appName.toLowerCase();
    
    // Check for exact matches first
    if (this.productivityScores[lowercaseApp]) {
      return this.productivityScores[lowercaseApp];
    }
    
    // Check for partial matches
    for (const [key, score] of Object.entries(this.productivityScores)) {
      if (lowercaseApp.includes(key) || key.includes(lowercaseApp)) {
        return score;
      }
    }
    
    // Default score for unknown apps
    return 60;
  }

  categorizeActivity(appName) {
    if (!appName) return 'unknown';
    
    const lowercaseApp = appName.toLowerCase();
    
    if (lowercaseApp.includes('code') || lowercaseApp.includes('intellij') || 
        lowercaseApp.includes('pycharm') || lowercaseApp.includes('sublime')) {
      return 'development';
    }
    
    if (lowercaseApp.includes('chrome') || lowercaseApp.includes('firefox') || 
        lowercaseApp.includes('safari') || lowercaseApp.includes('edge')) {
      return 'browsing';
    }
    
    if (lowercaseApp.includes('slack') || lowercaseApp.includes('teams') || 
        lowercaseApp.includes('zoom') || lowercaseApp.includes('discord')) {
      return 'communication';
    }
    
    if (lowercaseApp.includes('notion') || lowercaseApp.includes('obsidian') || 
        lowercaseApp.includes('word') || lowercaseApp.includes('excel')) {
      return 'documentation';
    }
    
    if (lowercaseApp.includes('spotify') || lowercaseApp.includes('music') || 
        lowercaseApp.includes('netflix') || lowercaseApp.includes('youtube')) {
      return 'entertainment';
    }
    
    return 'other';
  }

  async getTodayStats() {
    try {
      const todayData = await SystemMonitoringModel.getToday();
      
      const totalTime = todayData.reduce((sum, entry) => sum + entry.duration, 0);
      const avgProductivity = todayData.length > 0 
        ? todayData.reduce((sum, entry) => sum + (entry.productivity_score || 0), 0) / todayData.length
        : 0;
      
      const appBreakdown = {};
      const categoryBreakdown = {};
      
      todayData.forEach(entry => {
        // App breakdown
        if (!appBreakdown[entry.app_name]) {
          appBreakdown[entry.app_name] = {
            time: 0,
            productivity: 0,
            sessions: 0
          };
        }
        appBreakdown[entry.app_name].time += entry.duration;
        appBreakdown[entry.app_name].productivity += entry.productivity_score || 0;
        appBreakdown[entry.app_name].sessions += 1;
        
        // Category breakdown
        if (!categoryBreakdown[entry.activity_type]) {
          categoryBreakdown[entry.activity_type] = {
            time: 0,
            productivity: 0
          };
        }
        categoryBreakdown[entry.activity_type].time += entry.duration;
        categoryBreakdown[entry.activity_type].productivity += entry.productivity_score || 0;
      });
      
      // Calculate averages
      Object.keys(appBreakdown).forEach(app => {
        appBreakdown[app].productivity = 
          appBreakdown[app].productivity / appBreakdown[app].sessions;
      });
      
      return {
        totalTime,
        avgProductivity,
        appBreakdown,
        categoryBreakdown,
        sessions: todayData.length
      };
    } catch (error) {
      console.error('Error getting today stats:', error);
      return null;
    }
  }

  setProductivityScore(appName, score) {
    this.productivityScores[appName.toLowerCase()] = Math.max(0, Math.min(100, score));
  }
}

module.exports = new SystemMonitor();