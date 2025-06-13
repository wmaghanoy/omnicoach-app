import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar,
  MoreHorizontal,
  CheckCircle,
  Clock,
  Flag,
  Loader2,
  AlertCircle,
  Trash2
} from 'lucide-react';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

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

  // Load goals from database on component mount
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await window.electron?.invoke('goals:getAll');
        setGoals(result || []);
      } catch (err) {
        console.error('Failed to load goals:', err);
        setError('Failed to load goals. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const addGoal = async () => {
    if (!newGoal.title.trim()) return;
    
    try {
      setSaving(true);
      const goalData = {
        title: newGoal.title,
        description: newGoal.description || null,
        target_value: parseFloat(newGoal.target_value),
        current_value: parseFloat(newGoal.current_value) || 0,
        unit: newGoal.unit || null,
        deadline: newGoal.deadline || null,
        category: newGoal.category || null,
        status: 'active'
      };
      
      const result = await window.electron?.invoke('goals:create', goalData);
      
      if (result) {
        // Refresh goals from database to get the complete record with ID
        const updatedGoals = await window.electron?.invoke('goals:getAll');
        setGoals(updatedGoals || []);
        
        // Reset form
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
      }
    } catch (err) {
      console.error('Failed to create goal:', err);
      setError('Failed to create goal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateProgress = async (goalId, newValue) => {
    try {
      setSaving(true);
      const clampedValue = Math.max(0, newValue);
      
      await window.electron?.invoke('goals:update', goalId, { current_value: clampedValue });
      
      // Update local state optimistically
      setGoals(goals.map(goal => 
        goal.id === goalId ? { ...goal, current_value: clampedValue } : goal
      ));
    } catch (err) {
      console.error('Failed to update goal progress:', err);
      setError('Failed to update progress. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const retryLoad = () => {
    setError(null);
    const fetchGoals = async () => {
      try {
        setLoading(true);
        const result = await window.electron?.invoke('goals:getAll');
        setGoals(result || []);
      } catch (err) {
        console.error('Failed to load goals:', err);
        setError('Failed to load goals. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
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

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Goals</h1>
            <p className="text-gray-400 mt-1">Track your long-term objectives and progress</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-400">Loading goals...</span>
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
            <h1 className="text-3xl font-bold text-white">Goals</h1>
            <p className="text-gray-400 mt-1">Track your long-term objectives and progress</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Goals</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button 
              onClick={retryLoad}
              className="button-primary"
            >
              Try Again
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
          <h1 className="text-3xl font-bold text-white">Goals</h1>
          <p className="text-gray-400 mt-1">Track your long-term objectives and progress</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          disabled={saving}
          className="button-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
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
                      disabled={saving || goal.current_value <= 0}
                      className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="text-sm text-gray-400 min-w-[80px] text-center">
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        'Update progress'
                      )}
                    </span>
                    <button
                      onClick={() => updateProgress(goal.id, goal.current_value + 1)}
                      disabled={saving || goal.current_value >= goal.target_value}
                      className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            <p className="text-gray-500 mb-4">Create your first goal to start tracking your progress.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="button-primary"
            >
              Add Your First Goal
            </button>
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
                disabled={saving}
                className="button-secondary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={addGoal}
                disabled={saving || !newGoal.title.trim() || !newGoal.target_value || parseFloat(newGoal.target_value) <= 0}
                className="button-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Add Goal</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;