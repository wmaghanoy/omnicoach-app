const { SettingsModel, TaskModel, GoalModel, HabitModel, SystemMonitoringModel } = require('./models');
const LLMService = require('./llm-service');
const SystemMonitor = require('./system-monitor');

class FeedbackSystem {
  constructor() {
    this.feedbackSchedule = [];
    this.lastFeedbackTime = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    await this.scheduleDailyFeedback();
    
    // Check for feedback every 30 minutes
    this.feedbackInterval = setInterval(() => {
      this.checkForScheduledFeedback();
    }, 30 * 60 * 1000);
    
    console.log('Feedback system initialized');
  }

  async scheduleDailyFeedback() {
    const frequency = parseInt(await SettingsModel.get('feedback_frequency')) || 3;
    const autoFeedback = await SettingsModel.get('auto_feedback') === 'true';
    
    if (!autoFeedback) return;
    
    // Clear existing schedule
    this.feedbackSchedule = [];
    
    // Schedule feedback at intervals throughout the day
    const now = new Date();
    const startHour = 9; // 9 AM
    const endHour = 21; // 9 PM
    const workingHours = endHour - startHour;
    const interval = workingHours / frequency;
    
    for (let i = 0; i < frequency; i++) {
      const feedbackTime = new Date(now);
      feedbackTime.setHours(startHour + (i * interval), 0, 0, 0);
      
      // If the time has already passed today, schedule for tomorrow
      if (feedbackTime < now) {
        feedbackTime.setDate(feedbackTime.getDate() + 1);
      }
      
      this.feedbackSchedule.push({
        time: feedbackTime,
        type: 'scheduled',
        triggered: false
      });
    }
    
    console.log(`Scheduled ${frequency} feedback sessions`);
  }

  async checkForScheduledFeedback() {
    const now = new Date();
    
    for (const feedback of this.feedbackSchedule) {
      if (!feedback.triggered && now >= feedback.time) {
        feedback.triggered = true;
        await this.generateFeedback('scheduled');
      }
    }
  }

  async generateFeedback(triggerType = 'manual', context = {}) {
    try {
      const feedbackContext = await this.buildFeedbackContext();
      const personality = await SettingsModel.get('default_personality') || 'Coach';
      const tone = await SettingsModel.get('feedback_tone') || 'supportive';
      
      const prompt = this.buildFeedbackPrompt(triggerType, tone, feedbackContext);
      
      const response = await LLMService.generateResponse(prompt, feedbackContext, {
        personality,
        requestType: 'feedback'
      });

      if (response.success) {
        const feedbackEntry = {
          type: triggerType,
          content: response.response,
          mood_score: feedbackContext.mood_score,
          productivity_score: feedbackContext.productivity_score,
          triggered_by: triggerType
        };

        // Log feedback to database
        const { getDatabase } = require('./database');
        const db = getDatabase();
        db.prepare(`
          INSERT INTO feedback_entries (type, content, mood_score, productivity_score, triggered_by)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          feedbackEntry.type,
          feedbackEntry.content,
          feedbackEntry.mood_score,
          feedbackEntry.productivity_score,
          feedbackEntry.triggered_by
        );

        this.lastFeedbackTime = new Date();
        
        return {
          success: true,
          feedback: feedbackEntry,
          usage: response.usage
        };
      } else {
        return {
          success: false,
          error: response.error
        };
      }
    } catch (error) {
      console.error('Error generating feedback:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async buildFeedbackContext() {
    try {
      // Get current tasks, goals, and habits
      const tasks = await TaskModel.getAll();
      const goals = await GoalModel.getAll();
      const habits = await HabitModel.getTodayEntries();
      
      // Get today's system monitoring data
      const todayStats = await SystemMonitor.getTodayStats();
      
      // Calculate various metrics
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const pendingTasks = tasks.filter(t => t.status === 'pending').length;
      const overdueTasks = tasks.filter(t => {
        if (!t.due_date || t.status === 'completed') return false;
        return new Date(t.due_date) < new Date();
      }).length;

      const habitsCompleted = habits.filter(h => h.completed).length;
      const habitsTotal = habits.length;
      const habitCompletionRate = habitsTotal > 0 ? (habitsCompleted / habitsTotal) * 100 : 0;

      const goalsOnTrack = goals.filter(g => {
        if (g.status !== 'active') return false;
        const progress = (g.current_value / g.target_value) * 100;
        const deadline = new Date(g.deadline);
        const timeRemaining = deadline - new Date();
        const timeTotal = deadline - new Date(g.created_at);
        const expectedProgress = ((timeTotal - timeRemaining) / timeTotal) * 100;
        return progress >= expectedProgress * 0.8; // 80% of expected progress
      }).length;

      const productivity_score = todayStats ? todayStats.avgProductivity : 75;
      const totalActiveTime = todayStats ? todayStats.totalTime / 3600 : 0; // hours

      return {
        tasks: tasks.slice(0, 5), // Latest 5 tasks
        goals: goals.slice(0, 3), // Latest 3 goals
        habits: habits.slice(0, 5), // Today's habits
        stats: {
          completedTasks,
          pendingTasks,
          overdueTasks,
          habitCompletionRate,
          goalsOnTrack,
          productivity_score,
          totalActiveTime
        },
        mood_score: this.estimateMoodScore(habitCompletionRate, productivity_score),
        productivity_score,
        recentActivity: this.summarizeRecentActivity(todayStats)
      };
    } catch (error) {
      console.error('Error building feedback context:', error);
      return {
        tasks: [],
        goals: [],
        habits: [],
        stats: {},
        mood_score: 75,
        productivity_score: 75,
        recentActivity: 'No recent activity data available.'
      };
    }
  }

  buildFeedbackPrompt(triggerType, tone, context) {
    const { stats } = context;
    
    let prompt = `Provide personalized feedback based on today's progress. `;
    
    if (triggerType === 'scheduled') {
      prompt += `This is a scheduled check-in. `;
    } else if (triggerType === 'manual') {
      prompt += `The user requested feedback. `;
    }

    prompt += `Use a ${tone} tone. `;

    prompt += `Today's performance:\n`;
    prompt += `- Completed ${stats.completedTasks} tasks, ${stats.pendingTasks} pending`;
    if (stats.overdueTasks > 0) {
      prompt += `, ${stats.overdueTasks} overdue`;
    }
    prompt += `\n- Habit completion: ${stats.habitCompletionRate.toFixed(0)}%\n`;
    prompt += `- Productivity score: ${stats.productivity_score.toFixed(0)}%\n`;
    prompt += `- Active time: ${stats.totalActiveTime.toFixed(1)} hours\n`;
    
    if (stats.goalsOnTrack > 0) {
      prompt += `- ${stats.goalsOnTrack} goals on track\n`;
    }

    prompt += `\nProvide specific, actionable feedback. Keep it concise (2-3 sentences). `;
    prompt += `Focus on what's going well and one area for improvement. `;
    
    if (triggerType === 'scheduled') {
      prompt += `Include motivation for the rest of the day.`;
    }

    return prompt;
  }

  summarizeRecentActivity(todayStats) {
    if (!todayStats || !todayStats.appBreakdown) {
      return 'No activity data available for today.';
    }

    const topApps = Object.entries(todayStats.appBreakdown)
      .sort((a, b) => b[1].time - a[1].time)
      .slice(0, 3);

    if (topApps.length === 0) {
      return 'No significant app usage detected today.';
    }

    const summary = topApps.map(([app, data]) => {
      const hours = (data.time / 3600).toFixed(1);
      return `${app} (${hours}h)`;
    }).join(', ');

    return `Top apps today: ${summary}`;
  }

  estimateMoodScore(habitCompletion, productivity) {
    // Simple mood estimation based on habit completion and productivity
    const base = 50;
    const habitBonus = (habitCompletion / 100) * 25; // Up to 25 points
    const productivityBonus = ((productivity - 50) / 50) * 25; // Up to ±25 points
    
    return Math.max(10, Math.min(100, base + habitBonus + productivityBonus));
  }

  async getRecentFeedback(limit = 10) {
    try {
      const { getDatabase } = require('./database');
      const db = getDatabase();
      
      return db.prepare(`
        SELECT * FROM feedback_entries 
        ORDER BY timestamp DESC 
        LIMIT ?
      `).all(limit);
    } catch (error) {
      console.error('Error getting recent feedback:', error);
      return [];
    }
  }

  async rateFeedback(feedbackId, rating) {
    try {
      const { getDatabase } = require('./database');
      const db = getDatabase();
      
      db.prepare(`
        UPDATE feedback_entries 
        SET user_rating = ? 
        WHERE id = ?
      `).run(rating, feedbackId);
      
      return true;
    } catch (error) {
      console.error('Error rating feedback:', error);
      return false;
    }
  }

  stop() {
    if (this.feedbackInterval) {
      clearInterval(this.feedbackInterval);
    }
    this.isInitialized = false;
    console.log('Feedback system stopped');
  }
}

module.exports = new FeedbackSystem();