import React, { useState } from 'react';
import { 
  Plus, 
  Calendar,
  TrendingUp, 
  Flame,
  Check,
  X,
  MoreHorizontal,
  Bell,
  Repeat
} from 'lucide-react';

const Habits = () => {
  const [habits, setHabits] = useState([
    {
      id: 1,
      name: 'Morning Meditation',
      description: '10 minutes of mindfulness meditation',
      frequency: 'daily',
      target_count: 1,
      streak: 7,
      best_streak: 15,
      category: 'Wellness',
      reminder_time: '07:00',
      is_active: true,
      todayCompleted: true,
      todayCount: 1
    },
    {
      id: 2,
      name: 'Exercise',
      description: 'Any form of physical activity for 30+ minutes',
      frequency: 'daily',
      target_count: 1,
      streak: 3,
      best_streak: 12,
      category: 'Health',
      reminder_time: '18:00',
      is_active: true,
      todayCompleted: false,
      todayCount: 0
    },
    {
      id: 3,
      name: 'Read',
      description: 'Read for at least 30 minutes',
      frequency: 'daily',
      target_count: 1,
      streak: 5,
      best_streak: 8,
      category: 'Learning',
      reminder_time: '21:00',
      is_active: true,
      todayCompleted: true,
      todayCount: 1
    },
    {
      id: 4,
      name: 'Drink Water',
      description: 'Drink 8 glasses of water',
      frequency: 'daily',
      target_count: 8,
      streak: 2,
      best_streak: 5,
      category: 'Health',
      reminder_time: '09:00',
      is_active: true,
      todayCompleted: false,
      todayCount: 5
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    target_count: '1',
    category: '',
    reminder_time: ''
  });

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const addHabit = () => {
    if (!newHabit.name.trim()) return;
    
    const habit = {
      id: Date.now(),
      ...newHabit,
      target_count: parseInt(newHabit.target_count) || 1,
      streak: 0,
      best_streak: 0,
      is_active: true,
      todayCompleted: false,
      todayCount: 0,
      created_at: new Date().toISOString()
    };
    
    setHabits([habit, ...habits]);
    setNewHabit({
      name: '',
      description: '',
      frequency: 'daily',
      target_count: '1',
      category: '',
      reminder_time: ''
    });
    setShowAddForm(false);
  };

  const toggleHabitCompletion = (habitId) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newCompleted = !habit.todayCompleted;
        const newStreak = newCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1);
        const newBestStreak = Math.max(habit.best_streak, newStreak);
        
        return {
          ...habit,
          todayCompleted: newCompleted,
          todayCount: newCompleted ? habit.target_count : 0,
          streak: newStreak,
          best_streak: newBestStreak
        };
      }
      return habit;
    }));
  };

  const updateHabitCount = (habitId, increment) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newCount = Math.max(0, habit.todayCount + increment);
        const isCompleted = newCount >= habit.target_count;
        
        return {
          ...habit,
          todayCount: newCount,
          todayCompleted: isCompleted
        };
      }
      return habit;
    }));
  };

  const getStreakColor = (streak) => {
    if (streak >= 30) return 'text-purple-400';
    if (streak >= 14) return 'text-blue-400';
    if (streak >= 7) return 'text-green-400';
    if (streak >= 3) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getCompletionRate = () => {
    const completedToday = habits.filter(h => h.todayCompleted).length;
    return habits.length > 0 ? (completedToday / habits.length) * 100 : 0;
  };

  const getTotalStreak = () => {
    return habits.reduce((sum, habit) => sum + habit.streak, 0);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Habits</h1>
          <p className="text-gray-400 mt-1">Build consistency and track your daily routines</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="button-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Habit</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Today's Completion</p>
              <p className="text-2xl font-bold text-green-400">{getCompletionRate().toFixed(0)}%</p>
            </div>
            <Check className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Streak Days</p>
              <p className="text-2xl font-bold text-orange-400">{getTotalStreak()}</p>
            </div>
            <Flame className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Habits</p>
              <p className="text-2xl font-bold text-blue-400">{habits.filter(h => h.is_active).length}</p>
            </div>
            <Repeat className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-4">
        {habits.map((habit) => {
          const progressPercentage = (habit.todayCount / habit.target_count) * 100;
          
          return (
            <div key={habit.id} className={`card ${habit.todayCompleted ? 'ring-2 ring-green-500' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <button
                    onClick={() => toggleHabitCompletion(habit.id)}
                    className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      habit.todayCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    {habit.todayCompleted && <Check className="w-4 h-4" />}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`text-lg font-semibold ${
                        habit.todayCompleted ? 'text-green-300' : 'text-white'
                      }`}>
                        {habit.name}
                      </h3>
                      <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">
                        {habit.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Flame className={`w-4 h-4 ${getStreakColor(habit.streak)}`} />
                        <span className={`text-sm font-medium ${getStreakColor(habit.streak)}`}>
                          {habit.streak}
                        </span>
                      </div>
                    </div>

                    {habit.description && (
                      <p className="text-gray-400 text-sm mb-3">{habit.description}</p>
                    )}

                    {/* Progress for countable habits */}
                    {habit.target_count > 1 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            {habit.todayCount} / {habit.target_count} {habit.frequency}
                          </span>
                          <span className="text-white font-medium">
                            {progressPercentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, progressPercentage)}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateHabitCount(habit.id, -1)}
                            className="w-6 h-6 bg-gray-800 hover:bg-gray-700 rounded text-white transition-colors text-sm"
                          >
                            -
                          </button>
                          <button
                            onClick={() => updateHabitCount(habit.id, 1)}
                            className="w-6 h-6 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Best: {habit.best_streak} days</span>
                      </div>
                      {habit.reminder_time && (
                        <div className="flex items-center space-x-1">
                          <Bell className="w-4 h-4" />
                          <span>{habit.reminder_time}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span className="capitalize">{habit.frequency}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="p-1 rounded hover:bg-gray-800 transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          );
        })}

        {habits.length === 0 && (
          <div className="text-center py-12">
            <Repeat className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No habits yet</h3>
            <p className="text-gray-500">Create your first habit to start building consistency.</p>
          </div>
        )}
      </div>

      {/* Add Habit Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Habit</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  className="input-primary w-full"
                  placeholder="Morning meditation, exercise, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                  className="input-primary w-full h-20 resize-none"
                  placeholder="Brief description of the habit..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
                  <select
                    value={newHabit.frequency}
                    onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
                    className="input-primary w-full"
                  >
                    {frequencies.map(freq => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Target Count</label>
                  <input
                    type="number"
                    value={newHabit.target_count}
                    onChange={(e) => setNewHabit({ ...newHabit, target_count: e.target.value })}
                    className="input-primary w-full"
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <input
                    type="text"
                    value={newHabit.category}
                    onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
                    className="input-primary w-full"
                    placeholder="Health, Learning, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reminder Time</label>
                  <input
                    type="time"
                    value={newHabit.reminder_time}
                    onChange={(e) => setNewHabit({ ...newHabit, reminder_time: e.target.value })}
                    className="input-primary w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={addHabit}
                className="button-primary"
              >
                Add Habit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Habits;