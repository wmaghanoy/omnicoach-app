import React, { useState } from 'react';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar,
  MoreHorizontal,
  CheckCircle,
  Clock,
  Flag
} from 'lucide-react';

const Goals = () => {
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: 'Exercise 5 times per week',
      description: 'Maintain consistent workout routine for better health',
      status: 'active',
      target_value: 5,
      current_value: 3,
      unit: 'workouts',
      deadline: '2024-01-31',
      category: 'Health',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      title: 'Read 12 books this year',
      description: 'Expand knowledge and improve reading habit',
      status: 'active',
      target_value: 12,
      current_value: 1,
      unit: 'books',
      deadline: '2024-12-31',
      category: 'Personal',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      title: 'Save $10,000',
      description: 'Build emergency fund and financial security',
      status: 'active',
      target_value: 10000,
      current_value: 3250,
      unit: 'dollars',
      deadline: '2024-06-30',
      category: 'Financial',
      created_at: '2024-01-01T00:00:00Z'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target_value: '',
    current_value: '0',
    unit: '',
    deadline: '',
    category: ''
  });

  const addGoal = () => {
    if (!newGoal.title.trim()) return;
    
    const goal = {
      id: Date.now(),
      ...newGoal,
      status: 'active',
      target_value: parseFloat(newGoal.target_value),
      current_value: parseFloat(newGoal.current_value) || 0,
      created_at: new Date().toISOString()
    };
    
    setGoals([goal, ...goals]);
    setNewGoal({
      title: '',
      description: '',
      target_value: '',
      current_value: '0',
      unit: '',
      deadline: '',
      category: ''
    });
    setShowAddForm(false);
  };

  const updateProgress = (goalId, newValue) => {
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, current_value: Math.max(0, newValue) }
        : goal
    ));
  };

  const getProgressPercentage = (current, target) => {
    return Math.min(100, (current / target) * 100);
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Goals</h1>
          <p className="text-gray-400 mt-1">Track your long-term objectives and progress</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="button-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Goals</p>
              <p className="text-2xl font-bold text-blue-400">{goals.filter(g => g.status === 'active').length}</p>
            </div>
            <Target className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Average Progress</p>
              <p className="text-2xl font-bold text-green-400">
                {Math.round(goals.reduce((acc, goal) => acc + getProgressPercentage(goal.current_value, goal.target_value), 0) / goals.length)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Near Deadline</p>
              <p className="text-2xl font-bold text-orange-400">
                {goals.filter(g => getDaysRemaining(g.deadline) <= 30).length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-6">
        {goals.map((goal) => {
          const progressPercentage = getProgressPercentage(goal.current_value, goal.target_value);
          const daysRemaining = getDaysRemaining(goal.deadline);
          const isNearDeadline = daysRemaining <= 30 && daysRemaining > 0;
          const isOverdue = daysRemaining < 0;
          
          return (
            <div key={goal.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{goal.title}</h3>
                    <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">
                      {goal.category}
                    </span>
                  </div>
                  {goal.description && (
                    <p className="text-gray-400 text-sm mb-3">{goal.description}</p>
                  )}
                </div>
                <button className="p-1 rounded hover:bg-gray-800 transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Progress Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold text-white">
                      {goal.current_value.toLocaleString()}
                    </div>
                    <div className="text-gray-400">
                      of {goal.target_value.toLocaleString()} {goal.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-white">
                      {progressPercentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">complete</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(progressPercentage)}`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>

                {/* Progress Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateProgress(goal.id, goal.current_value - 1)}
                      className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded text-white transition-colors"
                    >
                      -
                    </button>
                    <span className="text-sm text-gray-400 min-w-[60px] text-center">
                      Update progress
                    </span>
                    <button
                      onClick={() => updateProgress(goal.id, goal.current_value + 1)}
                      className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className={`${
                      isOverdue ? 'text-red-400' : 
                      isNearDeadline ? 'text-orange-400' : 'text-gray-400'
                    }`}>
                      {isOverdue ? `${Math.abs(daysRemaining)} days overdue` :
                       daysRemaining === 0 ? 'Due today' :
                       `${daysRemaining} days remaining`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No goals yet</h3>
            <p className="text-gray-500">Create your first goal to start tracking your progress.</p>
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Goal</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="input-primary w-full"
                  placeholder="Enter goal title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="input-primary w-full h-20 resize-none"
                  placeholder="Enter goal description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Target Value</label>
                  <input
                    type="number"
                    value={newGoal.target_value}
                    onChange={(e) => setNewGoal({ ...newGoal, target_value: e.target.value })}
                    className="input-primary w-full"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Unit</label>
                  <input
                    type="text"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    className="input-primary w-full"
                    placeholder="workouts, books, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Progress</label>
                  <input
                    type="number"
                    value={newGoal.current_value}
                    onChange={(e) => setNewGoal({ ...newGoal, current_value: e.target.value })}
                    className="input-primary w-full"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Deadline</label>
                  <input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    className="input-primary w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <input
                  type="text"
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  className="input-primary w-full"
                  placeholder="Health, Financial, Personal, etc."
                />
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
                onClick={addGoal}
                className="button-primary"
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;