import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Activity, 
  BarChart3,
  PieChart,
  Calendar,
  Target,
  Zap
} from 'lucide-react';

const Analytics = () => {
  const [timeframe, setTimeframe] = useState('week');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in real app this would come from the database
  const [analytics] = useState({
    productivity: {
      averageScore: 78,
      trend: '+5%',
      weeklyScores: [72, 75, 80, 76, 82, 79, 78],
      topApps: [
        { name: 'VS Code', time: '8.5h', productivity: 95 },
        { name: 'Chrome', time: '6.2h', productivity: 65 },
        { name: 'Slack', time: '2.1h', productivity: 70 },
        { name: 'Notion', time: '1.8h', productivity: 85 }
      ]
    },
    habits: {
      completionRate: 85,
      totalStreaks: 45,
      bestStreak: 15,
      weeklyCompletion: [80, 90, 75, 85, 95, 80, 85]
    },
    tasks: {
      completed: 89,
      pending: 23,
      overdue: 5,
      averageCompletionTime: '2.3 days',
      completionTrend: '+12%'
    },
    goals: {
      onTrack: 4,
      behind: 1,
      completed: 2,
      averageProgress: 67
    },
    llmUsage: {
      monthlySpend: 23.45,
      budget: 100,
      requestCount: 156,
      averageResponseTime: 2.3,
      topModels: [
        { name: 'Ollama Mistral', requests: 98, cost: 0 },
        { name: 'GPT-4', requests: 42, cost: 18.30 },
        { name: 'Claude Sonnet', requests: 16, cost: 5.15 }
      ]
    }
  });

  const timeframes = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'productivity', label: 'Productivity', icon: TrendingUp },
    { id: 'habits', label: 'Habits', icon: Calendar },
    { id: 'llm', label: 'AI Usage', icon: Zap }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Productivity Score</p>
              <p className="text-2xl font-bold text-blue-400">{analytics.productivity.averageScore}%</p>
              <p className="text-xs text-green-400">{analytics.productivity.trend} from last week</p>
            </div>
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Habit Completion</p>
              <p className="text-2xl font-bold text-green-400">{analytics.habits.completionRate}%</p>
              <p className="text-xs text-gray-400">{analytics.habits.totalStreaks} total streak days</p>
            </div>
            <Calendar className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tasks Completed</p>
              <p className="text-2xl font-bold text-purple-400">{analytics.tasks.completed}</p>
              <p className="text-xs text-green-400">{analytics.tasks.completionTrend} improvement</p>
            </div>
            <Target className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">AI Budget Used</p>
              <p className="text-2xl font-bold text-yellow-400">
                ${analytics.llmUsage.monthlySpend}
              </p>
              <p className="text-xs text-gray-400">
                of ${analytics.llmUsage.budget} budget
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Productivity Trend</h3>
          <div className="space-y-2">
            {analytics.productivity.weeklyScores.map((score, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-sm text-gray-400 w-12">
                  Day {index + 1}
                </span>
                <div className="flex-1 bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
                <span className="text-sm text-white w-8">{score}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Goal Progress</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-green-400">On Track</span>
              <span className="text-2xl font-bold text-green-400">{analytics.goals.onTrack}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-orange-400">Behind Schedule</span>
              <span className="text-2xl font-bold text-orange-400">{analytics.goals.behind}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-400">Completed</span>
              <span className="text-2xl font-bold text-blue-400">{analytics.goals.completed}</span>
            </div>
            <div className="pt-4 border-t border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{analytics.goals.averageProgress}%</div>
                <div className="text-sm text-gray-400">Average Progress</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProductivity = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Time Spent by Application</h3>
        <div className="space-y-4">
          {analytics.productivity.topApps.map((app, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-white">{app.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">{app.time}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${app.productivity}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-300 w-8">{app.productivity}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHabits = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Weekly Completion Rate</h3>
          <div className="space-y-2">
            {analytics.habits.weeklyCompletion.map((rate, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-sm text-gray-400 w-12">
                  Day {index + 1}
                </span>
                <div className="flex-1 bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${rate}%` }}
                  ></div>
                </div>
                <span className="text-sm text-white w-8">{rate}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Streak Statistics</h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">{analytics.habits.bestStreak}</div>
              <div className="text-sm text-gray-400">Best Streak</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{analytics.habits.totalStreaks}</div>
              <div className="text-sm text-gray-400">Total Streak Days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLLMUsage = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Monthly Spend</p>
              <p className="text-2xl font-bold text-green-400">${analytics.llmUsage.monthlySpend}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(analytics.llmUsage.monthlySpend / analytics.llmUsage.budget) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              ${analytics.llmUsage.budget - analytics.llmUsage.monthlySpend} remaining
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Requests</p>
              <p className="text-2xl font-bold text-blue-400">{analytics.llmUsage.requestCount}</p>
            </div>
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Response Time</p>
              <p className="text-2xl font-bold text-purple-400">{analytics.llmUsage.averageResponseTime}s</p>
            </div>
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Model Usage</h3>
        <div className="space-y-4">
          {analytics.llmUsage.topModels.map((model, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  index === 0 ? 'bg-green-500' : 
                  index === 1 ? 'bg-blue-500' : 'bg-purple-500'
                }`}></div>
                <span className="text-white">{model.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">{model.requests} requests</span>
                <span className="text-green-400 font-medium">
                  ${model.cost.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-1">Insights into your productivity and habits</p>
        </div>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="input-primary"
        >
          {timeframes.map(tf => (
            <option key={tf.value} value={tf.value}>{tf.label}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-750'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'productivity' && renderProductivity()}
        {activeTab === 'habits' && renderHabits()}
        {activeTab === 'llm' && renderLLMUsage()}
      </div>
    </div>
  );
};

export default Analytics;