import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Filter, 
  Search, 
  Calendar,
  Clock,
  Flag,
  MoreHorizontal,
  CheckCircle,
  Circle,
  Edit,
  Trash2,
  Loader2,
  AlertCircle
} from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    category: '',
    estimated_time: ''
  });

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-gray-400 bg-gray-800' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-300 bg-yellow-900' },
    { value: 'high', label: 'High', color: 'text-red-300 bg-red-900' }
  ];

  // Load tasks from database on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await window.electron?.invoke('tasks:getAll');
        setTasks(result || []);
      } catch (err) {
        console.error('Failed to load tasks:', err);
        setError('Failed to load tasks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleTask = async (taskId) => {
    try {
      setSaving(true);
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      
      await window.electron?.invoke('tasks:update', taskId, { status: newStatus });
      
      // Update local state optimistically
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      ));
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('Failed to update task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addTask = async () => {
    if (!newTask.title.trim()) return;
    
    try {
      setSaving(true);
      const taskData = {
        title: newTask.title,
        description: newTask.description || null,
        priority: newTask.priority,
        due_date: newTask.due_date || null,
        category: newTask.category || null,
        estimated_time: parseInt(newTask.estimated_time) || null,
        status: 'pending'
      };
      
      const result = await window.electron?.invoke('tasks:create', taskData);
      
      if (result) {
        // Refresh tasks from database to get the complete record with ID
        const updatedTasks = await window.electron?.invoke('tasks:getAll');
        setTasks(updatedTasks || []);
        
        // Reset form
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          due_date: '',
          category: '',
          estimated_time: ''
        });
        setShowAddForm(false);
      }
    } catch (err) {
      console.error('Failed to create task:', err);
      setError('Failed to create task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      setSaving(true);
      await window.electron?.invoke('tasks:delete', taskId);
      
      // Remove from local state
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('Failed to delete task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const retryLoad = () => {
    setError(null);
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const result = await window.electron?.invoke('tasks:getAll');
        setTasks(result || []);
      } catch (err) {
        console.error('Failed to load tasks:', err);
        setError('Failed to load tasks. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  };

  const getPriorityConfig = (priority) => {
    return priorities.find(p => p.value === priority) || priorities[1];
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Tasks</h1>
            <p className="text-gray-400 mt-1">Manage your to-do list and track progress</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-400">Loading tasks...</span>
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
            <h1 className="text-3xl font-bold text-white">Tasks</h1>
            <p className="text-gray-400 mt-1">Manage your to-do list and track progress</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Tasks</h3>
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
          <h1 className="text-3xl font-bold text-white">Tasks</h1>
          <p className="text-gray-400 mt-1">Manage your to-do list and track progress</p>
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
          <span>Add Task</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-primary"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-primary pl-10 w-full max-w-md"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const priorityConfig = getPriorityConfig(task.priority);
          const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
          
          return (
            <div key={task.id} className={`card ${task.status === 'completed' ? 'opacity-75' : ''}`}>
              <div className="flex items-start space-x-4">
                <button
                  onClick={() => toggleTask(task.id)}
                  disabled={saving}
                  className="mt-1 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  ) : task.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${
                        task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'
                      }`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`text-sm mt-1 ${
                          task.status === 'completed' ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`text-xs px-2 py-1 rounded ${priorityConfig.color}`}>
                        {priorityConfig.label}
                      </span>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        disabled={saving}
                        className="p-1 rounded hover:bg-red-900 hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-400">
                    {task.category && (
                      <span className="bg-gray-800 px-2 py-1 rounded text-xs">
                        {task.category}
                      </span>
                    )}
                    
                    {task.due_date && (
                      <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-400' : ''}`}>
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(task.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {task.estimated_time && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{task.estimated_time}m</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && tasks.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No tasks yet</h3>
            <p className="text-gray-500 mb-4">Create your first task to get started.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="button-primary"
            >
              Add Your First Task
            </button>
          </div>
        )}

        {filteredTasks.length === 0 && tasks.length > 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No tasks found</h3>
            <p className="text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search terms or filters.' 
                : 'No tasks match your current view.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="input-primary w-full"
                  placeholder="Enter task title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="input-primary w-full h-20 resize-none"
                  placeholder="Enter task description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="input-primary w-full"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="input-primary w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <input
                    type="text"
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="input-primary w-full"
                    placeholder="e.g. Work, Personal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Time (mins)</label>
                  <input
                    type="number"
                    value={newTask.estimated_time}
                    onChange={(e) => setNewTask({ ...newTask, estimated_time: e.target.value })}
                    className="input-primary w-full"
                    placeholder="30"
                  />
                </div>
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
                onClick={addTask}
                disabled={saving || !newTask.title.trim()}
                className="button-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Add Task</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;