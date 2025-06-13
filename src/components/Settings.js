import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Mic, 
  Brain,
  DollarSign,
  Bell,
  Shield,
  Palette,
  Key,
  Save,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // Default values - will be overridden by database values
    theme: 'dark',
    notifications: 'true',
    autoStart: 'false',
    voiceEnabled: 'true',
    alwaysListening: 'false',
    wakeWord: 'Hey Coach',
    defaultPersonality: 'Coach',
    voiceVolume: '80',
    defaultLLM: 'ollama',
    ollamaModel: 'mistral',
    openaiApiKey: '',
    claudeApiKey: '',
    monthlyBudget: '100',
    budgetWarnings: 'true',
    warningThreshold: '80',
    feedbackFrequency: '3',
    autoFeedback: 'true',
    feedbackTone: 'supportive'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'voice', label: 'Voice & AI', icon: Mic },
    { id: 'llm', label: 'AI Models', icon: Brain },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  const personalities = [
    { value: 'Coach', label: 'Coach - Supportive & Motivating' },
    { value: 'Jean-Luc Picard', label: 'Jean-Luc Picard - Wise & Diplomatic' },
    { value: 'Therapist', label: 'Therapist - Calm & Understanding' }
  ];

  const llmProviders = [
    { value: 'ollama', label: 'Ollama (Local, Free)' },
    { value: 'openai', label: 'OpenAI (GPT-4)' },
    { value: 'claude', label: 'Anthropic (Claude)' }
  ];

  // Load settings from database on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await window.electron?.invoke('settings:getAll');
        
        if (result && Object.keys(result).length > 0) {
          // Merge database settings with defaults
          setSettings(prev => ({ ...prev, ...result }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
        setError('Failed to load settings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setSaveStatus('saving');
    
    try {
      // Save all settings to database
      for (const [key, value] of Object.entries(settings)) {
        await window.electron?.invoke('settings:set', key, value);
      }
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setError('Failed to save settings. Please try again.');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = async (key, value) => {
    // Update local state immediately for responsive UI
    setSettings(prev => ({ ...prev, [key]: value }));
    
    try {
      // Save individual setting to database
      await window.electron?.invoke('settings:set', key, value);
    } catch (err) {
      console.error('Failed to save setting:', err);
      setError('Failed to save setting. Changes may not persist.');
    }
  };

  const retryLoad = () => {
    setError(null);
    const loadSettings = async () => {
      try {
        setLoading(true);
        const result = await window.electron?.invoke('settings:getAll');
        if (result && Object.keys(result).length > 0) {
          setSettings(prev => ({ ...prev, ...result }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
        setError('Failed to load settings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  };

  // Helper functions to handle string/boolean conversion
  const getBooleanValue = (value) => {
    return value === 'true' || value === true;
  };

  const getStringValue = (value) => {
    return value?.toString() || '';
  };

  const getNumericValue = (value) => {
    return parseInt(value) || 0;
  };

  const renderGeneral = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Appearance</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => updateSetting('theme', e.target.value)}
              className="input-primary w-full max-w-xs"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Startup</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={getBooleanValue(settings.autoStart)}
              onChange={(e) => updateSetting('autoStart', e.target.checked.toString())}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-300">Start OmniCoach on system startup</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderVoice = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Voice Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={getBooleanValue(settings.voiceEnabled)}
              onChange={(e) => updateSetting('voiceEnabled', e.target.checked.toString())}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-300">Enable voice interaction</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={getBooleanValue(settings.alwaysListening)}
              onChange={(e) => updateSetting('alwaysListening', e.target.checked.toString())}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-300">Always listening mode</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Wake Word</label>
            <input
              type="text"
              value={settings.wakeWord}
              onChange={(e) => updateSetting('wakeWord', e.target.value)}
              className="input-primary w-full max-w-xs"
              placeholder="Hey Coach"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Voice Volume</label>
            <input
              type="range"
              min="0"
              max="100"
              value={getNumericValue(settings.voiceVolume)}
              onChange={(e) => updateSetting('voiceVolume', e.target.value)}
              className="w-full max-w-xs"
            />
            <span className="text-sm text-gray-400">{getNumericValue(settings.voiceVolume)}%</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">AI Personality</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Default Personality</label>
            <select
              value={settings.defaultPersonality}
              onChange={(e) => updateSetting('defaultPersonality', e.target.value)}
              className="input-primary w-full"
            >
              {personalities.map(personality => (
                <option key={personality.value} value={personality.value}>
                  {personality.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLLM = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">AI Provider</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Default Provider</label>
            <select
              value={settings.defaultLLM}
              onChange={(e) => updateSetting('defaultLLM', e.target.value)}
              className="input-primary w-full"
            >
              {llmProviders.map(provider => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
          </div>

          {settings.defaultLLM === 'ollama' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ollama Model</label>
              <input
                type="text"
                value={settings.ollamaModel}
                onChange={(e) => updateSetting('ollamaModel', e.target.value)}
                className="input-primary w-full"
                placeholder="mistral"
              />
              <p className="text-xs text-gray-500 mt-1">
                Make sure the model is installed in Ollama
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">API Keys</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              OpenAI API Key
              <Key className="w-4 h-4 inline ml-1" />
            </label>
            <input
              type="password"
              value={settings.openaiApiKey}
              onChange={(e) => updateSetting('openaiApiKey', e.target.value)}
              className="input-primary w-full"
              placeholder="sk-..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Claude API Key
              <Key className="w-4 h-4 inline ml-1" />
            </label>
            <input
              type="password"
              value={settings.claudeApiKey}
              onChange={(e) => updateSetting('claudeApiKey', e.target.value)}
              className="input-primary w-full"
              placeholder="sk-ant-..."
            />
          </div>

          <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-3">
            <p className="text-yellow-300 text-sm">
              🔒 API keys are stored locally and never shared. They're only used to make requests to the respective services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBudget = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Monthly Budget</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Budget Limit ($)</label>
            <input
              type="number"
              value={settings.monthlyBudget}
              onChange={(e) => updateSetting('monthlyBudget', parseFloat(e.target.value))}
              className="input-primary w-full max-w-xs"
              placeholder="100"
              min="0"
              step="0.01"
            />
          </div>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={getBooleanValue(settings.budgetWarnings)}
              onChange={(e) => updateSetting('budgetWarnings', e.target.checked.toString())}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-300">Enable budget warnings</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Warning Threshold (%)</label>
            <input
              type="range"
              min="50"
              max="95"
              value={settings.warningThreshold}
              onChange={(e) => updateSetting('warningThreshold', parseInt(e.target.value))}
              className="w-full max-w-xs"
            />
            <span className="text-sm text-gray-400">{settings.warningThreshold}%</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Current Usage</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">This month</span>
            <span className="text-green-400 font-bold">$23.45</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Remaining</span>
            <span className="text-white">$76.55</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: '23%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Feedback Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={getBooleanValue(settings.autoFeedback)}
              onChange={(e) => updateSetting('autoFeedback', e.target.checked.toString())}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-300">Enable automatic feedback</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Feedback Frequency (per day)</label>
            <input
              type="number"
              value={getNumericValue(settings.feedbackFrequency)}
              onChange={(e) => updateSetting('feedbackFrequency', e.target.value)}
              className="input-primary w-full max-w-xs"
              min="1"
              max="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Feedback Tone</label>
            <select
              value={settings.feedbackTone}
              onChange={(e) => updateSetting('feedbackTone', e.target.value)}
              className="input-primary w-full max-w-xs"
            >
              <option value="supportive">Supportive</option>
              <option value="direct">Direct</option>
              <option value="encouraging">Encouraging</option>
              <option value="analytical">Analytical</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Data & Privacy</h3>
        <div className="space-y-4">
          <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
            <h4 className="text-blue-300 font-medium mb-2">🔒 Privacy First</h4>
            <ul className="text-blue-100 text-sm space-y-1">
              <li>• All data is stored locally on your device</li>
              <li>• No personal data is sent to our servers</li>
              <li>• API keys are encrypted and stored securely</li>
              <li>• You have full control over your data</li>
            </ul>
          </div>

          <div className="space-y-2">
            <button className="button-secondary flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Export Data</span>
            </button>
            <button className="button-secondary flex items-center space-x-2 text-red-400 border-red-700 hover:bg-red-900">
              <RefreshCw className="w-4 h-4" />
              <span>Reset All Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400 mt-1">Configure OmniCoach to your preferences</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-400">Loading settings...</span>
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
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400 mt-1">Configure OmniCoach to your preferences</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Settings</h3>
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
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Configure OmniCoach to your preferences</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className={`button-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            saveStatus === 'saved' ? 'bg-green-600' : 
            saveStatus === 'error' ? 'bg-red-600' : ''
          }`}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saveStatus === 'saved' ? (
            <CheckCircle className="w-4 h-4" />
          ) : saveStatus === 'error' ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>
            {saving ? 'Saving...' : 
             saveStatus === 'saved' ? 'Saved!' : 
             saveStatus === 'error' ? 'Error' : 'Save Changes'}
          </span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'general' && renderGeneral()}
          {activeTab === 'voice' && renderVoice()}
          {activeTab === 'llm' && renderLLM()}
          {activeTab === 'budget' && renderBudget()}
          {activeTab === 'notifications' && renderNotifications()}
          {activeTab === 'privacy' && renderPrivacy()}
        </div>
      </div>
    </div>
  );
};

export default Settings;