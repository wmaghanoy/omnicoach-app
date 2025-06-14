const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

let db = null;

function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'omnicoach.db');
  db = new Database(dbPath);
  
  db.exec(`
    -- Tasks table
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      due_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      category TEXT,
      estimated_time INTEGER,
      actual_time INTEGER
    );

    -- Goals table
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active',
      target_value REAL,
      current_value REAL DEFAULT 0,
      unit TEXT,
      deadline TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      category TEXT
    );

    -- Habits table
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      frequency TEXT DEFAULT 'daily',
      target_count INTEGER DEFAULT 1,
      streak INTEGER DEFAULT 0,
      best_streak INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT 1,
      category TEXT,
      reminder_time TEXT
    );

    -- Habit entries table
    CREATE TABLE IF NOT EXISTS habit_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER,
      date TEXT NOT NULL,
      completed BOOLEAN DEFAULT 0,
      count INTEGER DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (habit_id) REFERENCES habits (id)
    );

    -- System monitoring table
    CREATE TABLE IF NOT EXISTS system_monitoring (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      app_name TEXT,
      window_title TEXT,
      duration INTEGER,
      activity_type TEXT,
      productivity_score REAL
    );

    -- LLM usage tracking
    CREATE TABLE IF NOT EXISTS llm_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      tokens_input INTEGER,
      tokens_output INTEGER,
      cost REAL,
      request_type TEXT,
      response_time INTEGER
    );

    -- Feedback entries
    CREATE TABLE IF NOT EXISTS feedback_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      mood_score REAL,
      productivity_score REAL,
      triggered_by TEXT,
      user_rating INTEGER
    );

    -- Settings table
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Voice personalities
    CREATE TABLE IF NOT EXISTS voice_personalities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      voice_model TEXT,
      prompt_style TEXT,
      tone TEXT,
      is_active BOOLEAN DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insert default settings
  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
  `);
  
  insertSetting.run('theme', 'dark');
  insertSetting.run('voice_enabled', 'true');
  insertSetting.run('always_listening', 'false');
  insertSetting.run('wake_word', 'Hey Coach');
  insertSetting.run('monthly_budget', '100');
  insertSetting.run('budget_warnings', 'true');
  insertSetting.run('default_llm', 'ollama');
  insertSetting.run('feedback_frequency', '3');
  
  // ElevenLabs settings (disabled by default until API key is provided)
  insertSetting.run('useElevenLabs', 'false');
  insertSetting.run('elevenLabsApiKey', '');
  insertSetting.run('elevenLabsVoiceId', '21m00Tcm4TlvDq8ikWAM');
  insertSetting.run('voiceVolume', '80');

  // Insert default voice personalities
  const insertPersonality = db.prepare(`
    INSERT OR IGNORE INTO voice_personalities (name, description, voice_model, prompt_style, tone, is_active) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  insertPersonality.run(
    'Coach', 
    'Supportive and motivating productivity coach',
    'default',
    'You are a supportive, encouraging productivity coach. Be direct but kind.',
    'supportive',
    1
  );
  
  insertPersonality.run(
    'Jean-Luc Picard',
    'Wise and diplomatic starship captain',
    'default',
    'You are Captain Jean-Luc Picard. Speak with wisdom, diplomacy, and occasional references to your experiences.',
    'wise',
    0
  );
  
  insertPersonality.run(
    'Therapist',
    'Calm and understanding mental health support',
    'default',
    'You are a calm, understanding therapist. Focus on emotional well-being and mindfulness.',
    'calm',
    0
  );

  console.log('Database initialized successfully');
  return db;
}

function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

module.exports = { initDatabase, getDatabase };