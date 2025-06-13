import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  DollarSign,
  Activity,
  Loader2,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    tasksRemaining: 0,
    goalsActive: 0,
    goalsCompleted: 0,
    habitsStreak: 0,
    habitsCompletionRate: 0,
    monthlySpend: 0,
    monthlyBudget: 100,
    productivityScore: 0
  });

  const [recentFeedback, setRecentFeedback] = useState([]);
  const [todaysTasks, setTodaysTasks] = useState([]);
  const [activeGoals, setActiveGoals] = useState([]);
  const [todaysHabits, setTodaysHabits] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [
          tasksResult,
          goalsResult, 
          habitsResult,
          feedbackResult,
          monthlyBudget,
          llmStats
        ] = await Promise.all([
          window.electron?.invoke('tasks:getAll'),
          window.electron?.invoke('goals:getAll'),
          window.electron?.invoke('habits:getTodayEntries'),
          window.electron?.invoke('feedback:getRecent', 3),
          window.electron?.invoke('settings:get', 'monthlyBudget'),
          window.electron?.invoke('llm:getMonthlyStats')
        ]);

        const allTasks = tasksResult || [];
        const allGoals = goalsResult || [];
        const allHabits = habitsResult || [];
        const feedback = feedbackResult || [];

        // Calculate task statistics
        const completedTasks = allTasks.filter(t => t.status === 'completed');
        const pendingTasks = allTasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
        
        // Get today's tasks (tasks due today or overdue)
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = allTasks.filter(task => {
          if (!task.due_date) return false;
          const taskDate = new Date(task.due_date).toISOString().split('T')[0];
          return taskDate <= today;
        });

        // Calculate goal statistics  
        const activeGoals = allGoals.filter(g => g.status === 'active');
        const completedGoals = allGoals.filter(g => g.status === 'completed');

        // Calculate habit statistics
        const completedHabits = allHabits.filter(h => h.completed);
        const habitsCompletionRate = allHabits.length > 0 
          ? Math.round((completedHabits.length / allHabits.length) * 100) 
          : 0;

        // Calculate habit streak (simplified - longest current streak)
        const habitsStreak = calculateHabitStreak(allHabits);

        // Calculate monthly spend
        const totalCost = llmStats?.reduce((sum, stat) => sum + (stat.total_cost || 0), 0) || 0;
        const budget = parseFloat(monthlyBudget) || 100;

        // Calculate productivity score based on task completion
        const productivityScore = calculateProductivityScore(completedTasks, pendingTasks, habitsCompletionRate);

        // Update stats
        setStats({
          tasksCompleted: completedTasks.length,
          tasksRemaining: pendingTasks.length,
          goalsActive: activeGoals.length,
          goalsCompleted: completedGoals.length,
          habitsStreak: habitsStreak,
          habitsCompletionRate: habitsCompletionRate,
          monthlySpend: totalCost,
          monthlyBudget: budget,
          productivityScore: productivityScore
        });

        // Set component data
        setTodaysTasks(todayTasks);
        setActiveGoals(activeGoals.slice(0, 5)); // Show top 5
        setTodaysHabits(allHabits);
        setRecentFeedback(feedback);

      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const calculateHabitStreak = (habits) => {
    // Simplified streak calculation - return completion rate as days
    const completedToday = habits.filter(h => h.completed).length;
    return completedToday;
  };

  const calculateProductivityScore = (completed, pending, habitRate) => {
    const taskScore = completed.length > 0 ? (completed.length / (completed.length + pending.length)) * 50 : 0;
    const habitScore = (habitRate / 100) * 50;
    return Math.round(taskScore + habitScore);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">Loading your productivity overview...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-400">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">Here's your productivity overview for today</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="button-primary"
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                {todaysTasks.filter(t => t.status === 'completed').length} of {todaysTasks.length} completed
              </span>
            </div>
            <div className="space-y-3">
              {todaysTasks.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No tasks due today</p>
                  <p className="text-sm text-gray-500">You're all caught up!</p>
                </div>
              ) : (
                todaysTasks.map((task) => (
                <div 
                  key={task.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    task.status === 'completed' ? 'bg-gray-800 opacity-75' : 'bg-gray-850'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    task.status === 'completed' 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-600'
                  }`}>
                    {task.status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-white -mt-0.5 -ml-0.5" />
                    )}
                  </div>
                  <span className={`flex-1 ${
                    task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'
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
                ))
              )}
            </div>
          </div>
        </div>

        {/* AI Feedback */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">AI Feedback</h2>
            <div className="space-y-4">
              {recentFeedback.length === 0 ? (
                <div className="text-center py-6">
                  <Activity className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No recent AI feedback</p>
                  <p className="text-xs text-gray-500">Complete some tasks to get insights!</p>
                </div>
              ) : (
                recentFeedback.map((feedback) => (
                  <div key={feedback.id} className="border-l-4 border-blue-500 pl-4">
                    <p className="text-sm text-gray-300">{feedback.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{feedback.time}</p>
                  </div>
                ))
              )}
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
                <span className="text-green-400">${stats.monthlySpend.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Budget</span>
                <span className="text-gray-300">${stats.monthlyBudget.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${Math.min((stats.monthlySpend / stats.monthlyBudget) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {Math.max(0, ((stats.monthlyBudget - stats.monthlySpend) / stats.monthlyBudget * 100)).toFixed(0)}% budget remaining
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;