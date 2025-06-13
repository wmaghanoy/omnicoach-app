const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = process.env.NODE_ENV === 'development' 
      ? path.join(process.cwd(), 'logs')
      : path.join(require('electron').app.getPath('userData'), 'logs');
    
    // Ensure log directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    
    this.logFile = path.join(this.logDir, `omnicoach-${new Date().toISOString().split('T')[0]}.log`);
  }

  writeLog(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data: data ? JSON.stringify(data, null, 2) : null,
      pid: process.pid
    };

    const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
    
    try {
      fs.appendFileSync(this.logFile, logLine);
      console.log(`📝 Logged to file: ${this.logFile}`);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  info(message, data) {
    this.writeLog('info', message, data);
  }

  error(message, data) {
    this.writeLog('error', message, data);
  }

  warn(message, data) {
    this.writeLog('warn', message, data);
  }

  debug(message, data) {
    this.writeLog('debug', message, data);
  }

  voice(message, data) {
    this.writeLog('voice', message, data);
  }

  getLogPath() {
    return this.logFile;
  }

  getLogDir() {
    return this.logDir;
  }
}

module.exports = new Logger();