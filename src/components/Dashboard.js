import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  DollarSign,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    tasksCompleted: 12,
    tasksRemaining: 5,
    goalsActive: 3,
    goalsCompleted: 1,
    habitsStreak: 7,
    monthlySpend: 23.45,
    productivityScore: 78
  });

  const [recentFeedback] = useState([
    {
      id: 1,
      type: 'productivity',
      message: "Great focus session! You spent 2.5 hours in deep work without distractions.",
      time: '2 hours ago',
      mood: 'positive'
    },
    {
      id: 2,
      type: 'habit',
      message: "Don't forget your evening meditation - you're on a 7-day streak!",
      time: '4 hours ago',
      mood: 'reminder'
    },
    {
      id: 3,
      type: 'goal',
      message: "You're 75% of the way to your weekly exercise goal. Keep it up!",
      time: '6 hours ago',
      mood: 'encouraging'
    }
  ]);

  const [todaysTasks] = useState([
    { id: 1, title: 'Review quarterly metrics', completed: true, priority: 'high' },
    { id: 2, title: 'Call with design team', completed: true, priority: 'medium' },
    { id: 3, title: 'Finish project proposal', completed: false, priority: 'high' },
    { id: 4, title: 'Weekly planning session', completed: false, priority: 'medium' },
    { id: 5, title: 'Code review for feature X', completed: false, priority: 'low' }
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Good afternoon, Wes</h1>
          <p className="text-gray-400 mt-1">Here's your productivity overview for today</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-400">{stats.productivityScore}%</div>
          <div className="text-sm text-gray-400">Productivity Score</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tasks Completed</p>
              <p className="text-2xl font-bold text-green-400">{stats.tasksCompleted}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tasks Remaining</p>
              <p className="text-2xl font-bold text-orange-400">{stats.tasksRemaining}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Goals</p>
              <p className="text-2xl font-bold text-blue-400">{stats.goalsActive}</p>
            </div>
            <Target className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Habit Streak</p>
              <p className="text-2xl font-bold text-purple-400">{stats.habitsStreak} days</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Today's Tasks</h2>
              <span className="text-sm text-gray-400">
                {todaysTasks.filter(t => t.completed).length} of {todaysTasks.length} completed
              </span>
            </div>
            <div className="space-y-3">
              {todaysTasks.map((task) => (
                <div 
                  key={task.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    task.completed ? 'bg-gray-800 opacity-75' : 'bg-gray-850'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    task.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-600'
                  }`}>
                    {task.completed && (
                      <CheckCircle className="w-4 h-4 text-white -mt-0.5 -ml-0.5" />
                    )}
                  </div>
                  <span className={`flex-1 ${
                    task.completed ? 'line-through text-gray-500' : 'text-white'
                  }`}>
                    {task.title}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    task.priority === 'high' ? 'bg-red-900 text-red-300' :
                    task.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Feedback */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">AI Feedback</h2>
            <div className="space-y-4">
              {recentFeedback.map((feedback) => (
                <div key={feedback.id} className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-gray-300">{feedback.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{feedback.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Tracking */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Monthly Spend</h2>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Current</span>
                <span className="text-green-400">${stats.monthlySpend}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Budget</span>
                <span className="text-gray-300">$100.00</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(stats.monthlySpend / 100) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {((100 - stats.monthlySpend) / 100 * 100).toFixed(0)}% budget remaining
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;