/**
 * Browser-safe API client for communicating with Electron main process
 * This file contains NO Node.js imports and is safe for webpack bundling
 */

class ApiClient {
  constructor() {
    this.isElectron = !!(window && window.electron);
  }

  // Settings operations
  async getSetting(key) {
    if (!this.isElectron) {
      console.warn('Not in Electron environment, using localStorage fallback');
      return localStorage.getItem(key);
    }
    
    try {
      return await window.electron.invoke('settings:get', key);
    } catch (error) {
      console.error('Failed to get setting:', key, error);
      return null;
    }
  }

  async setSetting(key, value) {
    if (!this.isElectron) {
      console.warn('Not in Electron environment, using localStorage fallback');
      localStorage.setItem(key, value);
      return;
    }
    
    try {
      await window.electron.invoke('settings:set', key, value);
    } catch (error) {
      console.error('Failed to set setting:', key, error);
      throw error;
    }
  }

  async getAllSettings() {
    if (!this.isElectron) {
      console.warn('Not in Electron environment, using localStorage fallback');
      const settings = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        settings[key] = localStorage.getItem(key);
      }
      return settings;
    }
    
    try {
      return await window.electron.invoke('settings:getAll');
    } catch (error) {
      console.error('Failed to get all settings:', error);
      return {};
    }
  }

  // Tasks operations
  async getTasks() {
    if (!this.isElectron) return [];
    
    try {
      return await window.electron.invoke('tasks:getAll');
    } catch (error) {
      console.error('Failed to get tasks:', error);
      return [];
    }
  }

  async createTask(task) {
    if (!this.isElectron) return null;
    
    try {
      return await window.electron.invoke('tasks:create', task);
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }

  async updateTask(id, updates) {
    if (!this.isElectron) return null;
    
    try {
      return await window.electron.invoke('tasks:update', id, updates);
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  }

  async deleteTask(id) {
    if (!this.isElectron) return null;
    
    try {
      return await window.electron.invoke('tasks:delete', id);
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  }

  // Goals operations
  async getGoals() {
    if (!this.isElectron) return [];
    
    try {
      return await window.electron.invoke('goals:getAll');
    } catch (error) {
      console.error('Failed to get goals:', error);
      return [];
    }
  }

  async createGoal(goal) {
    if (!this.isElectron) return null;
    
    try {
      return await window.electron.invoke('goals:create', goal);
    } catch (error) {
      console.error('Failed to create goal:', error);
      throw error;
    }
  }

  async updateGoal(id, updates) {
    if (!this.isElectron) return null;
    
    try {
      return await window.electron.invoke('goals:update', id, updates);
    } catch (error) {
      console.error('Failed to update goal:', error);
      throw error;
    }
  }

  async deleteGoal(id) {
    if (!this.isElectron) return null;
    
    try {
      return await window.electron.invoke('goals:delete', id);
    } catch (error) {
      console.error('Failed to delete goal:', error);
      throw error;
    }
  }

  // Habits operations
  async getHabits() {
    if (!this.isElectron) return [];
    
    try {
      return await window.electron.invoke('habits:getAll');
    } catch (error) {
      console.error('Failed to get habits:', error);
      return [];
    }
  }

  async createHabit(habit) {
    if (!this.isElectron) return null;
    
    try {
      return await window.electron.invoke('habits:create', habit);
    } catch (error) {
      console.error('Failed to create habit:', error);
      throw error;
    }
  }

  async updateHabit(id, updates) {
    if (!this.isElectron) return null;
    
    try {
      return await window.electron.invoke('habits:update', id, updates);
    } catch (error) {
      console.error('Failed to update habit:', error);
      throw error;
    }
  }

  async deleteHabit(id) {
    if (!this.isElectron) return null;
    
    try {
      return await window.electron.invoke('habits:delete', id);
    } catch (error) {
      console.error('Failed to delete habit:', error);
      throw error;
    }
  }

  // Habit entries operations
  async getHabitEntries(habitId, date) {
    if (!this.isElectron) return [];
    
    try {
      return await window.electron.invoke('habitEntries:get', habitId, date);
    } catch (error) {
      console.error('Failed to get habit entries:', error);
      return [];
    }
  }

  async logHabitEntry(habitId, date, completed) {
    if (!this.isElectron) return null;
    
    try {
      return await window.electron.invoke('habitEntries:log', habitId, date, completed);
    } catch (error) {
      console.error('Failed to log habit entry:', error);
      throw error;
    }
  }

  // LLM operations
  async generateLLMResponse(message, context, options) {
    if (!this.isElectron) {
      throw new Error('LLM operations require Electron environment');
    }
    
    try {
      return await window.electron.invoke('llm:generateResponse', message, context, options);
    } catch (error) {
      console.error('Failed to generate LLM response:', error);
      throw error;
    }
  }

  // System monitoring
  async getSystemStats() {
    if (!this.isElectron) return null;
    
    try {
      return await window.electron.invoke('system:getStats');
    } catch (error) {
      console.error('Failed to get system stats:', error);
      return null;
    }
  }

  // Feedback system
  async getFeedback() {
    if (!this.isElectron) return [];
    
    try {
      return await window.electron.invoke('feedback:get');
    } catch (error) {
      console.error('Failed to get feedback:', error);
      return [];
    }
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;