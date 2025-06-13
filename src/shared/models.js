const { getDatabase } = require('./database');

class TaskModel {
  static getAll() {
    const db = getDatabase();
    return db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
  }

  static getById(id) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  }

  static create(task) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO tasks (title, description, status, priority, due_date, category, estimated_time)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      task.title,
      task.description || null,
      task.status || 'pending',
      task.priority || 'medium',
      task.due_date || null,
      task.category || null,
      task.estimated_time || null
    );
    return result.lastInsertRowid;
  }

  static update(id, updates) {
    const db = getDatabase();
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);
    
    const stmt = db.prepare(`UPDATE tasks SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    return stmt.run(...values);
  }

  static delete(id) {
    const db = getDatabase();
    return db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  }
}

class GoalModel {
  static getAll() {
    const db = getDatabase();
    return db.prepare('SELECT * FROM goals ORDER BY created_at DESC').all();
  }

  static getById(id) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
  }

  static create(goal) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO goals (title, description, status, target_value, current_value, unit, deadline, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      goal.title,
      goal.description || null,
      goal.status || 'active',
      goal.target_value || null,
      goal.current_value || 0,
      goal.unit || null,
      goal.deadline || null,
      goal.category || null
    );
    return result.lastInsertRowid;
  }

  static update(id, updates) {
    const db = getDatabase();
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);
    
    const stmt = db.prepare(`UPDATE goals SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    return stmt.run(...values);
  }

  static delete(id) {
    const db = getDatabase();
    return db.prepare('DELETE FROM goals WHERE id = ?').run(id);
  }
}

class HabitModel {
  static getAll() {
    const db = getDatabase();
    return db.prepare('SELECT * FROM habits WHERE is_active = 1 ORDER BY created_at DESC').all();
  }

  static getById(id) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM habits WHERE id = ?').get(id);
  }

  static create(habit) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO habits (name, description, frequency, target_count, category, reminder_time)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      habit.name,
      habit.description || null,
      habit.frequency || 'daily',
      habit.target_count || 1,
      habit.category || null,
      habit.reminder_time || null
    );
    return result.lastInsertRowid;
  }

  static update(id, updates) {
    const db = getDatabase();
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);
    
    const stmt = db.prepare(`UPDATE habits SET ${fields} WHERE id = ?`);
    return stmt.run(...values);
  }

  static delete(id) {
    const db = getDatabase();
    return db.prepare('UPDATE habits SET is_active = 0 WHERE id = ?').run(id);
  }

  static getTodayEntries() {
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];
    return db.prepare(`
      SELECT h.*, he.completed, he.count, he.notes
      FROM habits h
      LEFT JOIN habit_entries he ON h.id = he.habit_id AND he.date = ?
      WHERE h.is_active = 1
    `).all(today);
  }

  static logEntry(habitId, date, completed, count = 1, notes = null) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO habit_entries (habit_id, date, completed, count, notes)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(habitId, date, completed, count, notes);
  }
}

class SystemMonitoringModel {
  static log(entry) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO system_monitoring (app_name, window_title, duration, activity_type, productivity_score)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(
      entry.app_name,
      entry.window_title || null,
      entry.duration,
      entry.activity_type || 'unknown',
      entry.productivity_score || null
    );
  }

  static getToday() {
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];
    return db.prepare(`
      SELECT * FROM system_monitoring 
      WHERE date(timestamp) = ? 
      ORDER BY timestamp DESC
    `).all(today);
  }

  static getStats(days = 7) {
    const db = getDatabase();
    return db.prepare(`
      SELECT 
        app_name,
        SUM(duration) as total_duration,
        AVG(productivity_score) as avg_productivity
      FROM system_monitoring 
      WHERE datetime(timestamp) >= datetime('now', '-${days} days')
      GROUP BY app_name
      ORDER BY total_duration DESC
    `).all();
  }
}

class LLMUsageModel {
  static log(usage) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO llm_usage (provider, model, tokens_input, tokens_output, cost, request_type, response_time)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      usage.provider,
      usage.model,
      usage.tokens_input || 0,
      usage.tokens_output || 0,
      usage.cost || 0,
      usage.request_type || 'chat',
      usage.response_time || null
    );
  }

  static getMonthlyStats() {
    const db = getDatabase();
    return db.prepare(`
      SELECT 
        provider,
        model,
        SUM(tokens_input) as total_input_tokens,
        SUM(tokens_output) as total_output_tokens,
        SUM(cost) as total_cost,
        COUNT(*) as request_count
      FROM llm_usage 
      WHERE datetime(timestamp) >= datetime('now', 'start of month')
      GROUP BY provider, model
    `).all();
  }

  static getTotalCostThisMonth() {
    const db = getDatabase();
    const result = db.prepare(`
      SELECT SUM(cost) as total_cost
      FROM llm_usage 
      WHERE datetime(timestamp) >= datetime('now', 'start of month')
    `).get();
    return result.total_cost || 0;
  }
}

class SettingsModel {
  static get(key) {
    const db = getDatabase();
    const result = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return result ? result.value : null;
  }

  static set(key, value) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO settings (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    return stmt.run(key, value);
  }

  static getAll() {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM settings').all();
    return rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
  }
}

module.exports = {
  TaskModel,
  GoalModel,
  HabitModel,
  SystemMonitoringModel,
  LLMUsageModel,
  SettingsModel
};