# OmniCoach - AI Extension Guide

This file contains instructions for AI agents to understand and extend OmniCoach effectively.

## Architecture Overview

OmniCoach follows a modular Electron + React architecture optimized for AI extensibility:

### Core Components
- **Frontend**: React 18 + TailwindCSS for UI
- **Backend**: Electron main process + SQLite database
- **AI**: Multi-provider LLM integration (Ollama, OpenAI, Claude)
- **Services**: System monitoring, feedback generation, data models

### Key Files for Extension
- `src/shared/models.js` - Database models and operations
- `src/shared/database.js` - SQLite schema definitions
- `src/main/main.js` - Electron IPC handlers
- `src/components/` - React UI components
- `src/App.js` - Main navigation and routing

## Database Schema

The app uses SQLite with these main tables:
- `tasks` - Task management with status, priority, deadlines
- `goals` - Long-term objectives with progress tracking
- `habits` - Daily habits with streak counting
- `habit_entries` - Daily habit completion logs
- `system_monitoring` - App usage and productivity tracking
- `llm_usage` - AI model usage and cost tracking
- `feedback_entries` - AI-generated feedback history
- `settings` - User preferences and configuration
- `voice_personalities` - AI personality configurations

## Adding New Features

### 1. Database Schema
Add new tables in `src/shared/database.js`:
```sql
CREATE TABLE IF NOT EXISTS new_feature (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Data Model
Add model class in `src/shared/models.js`:
```javascript
class NewFeatureModel {
  static getAll() {
    const db = getDatabase();
    return db.prepare('SELECT * FROM new_feature').all();
  }
  
  static create(data) {
    const db = getDatabase();
    const stmt = db.prepare('INSERT INTO new_feature (name) VALUES (?)');
    return stmt.run(data.name);
  }
}
```

### 3. IPC Handlers
Add Electron handlers in `src/main/main.js`:
```javascript
ipcMain.handle('newfeature:getAll', async () => {
  const { NewFeatureModel } = require('../shared/models');
  return NewFeatureModel.getAll();
});
```

### 4. React Component
Create component in `src/components/NewFeature.js`:
```javascript
import React, { useState, useEffect } from 'react';

const NewFeature = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    // Fetch data via IPC
    window.electron?.invoke('newfeature:getAll')
      .then(setData)
      .catch(console.error);
  }, []);
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white">New Feature</h1>
      {/* Component content */}
    </div>
  );
};

export default NewFeature;
```

### 5. Navigation
Add to `src/App.js`:
```javascript
import NewFeature from './components/NewFeature';

// Add route
<Route path="/newfeature" element={<NewFeature />} />

// Add to sidebar navigation in Sidebar.js
{ path: '/newfeature', icon: SomeIcon, label: 'New Feature' }
```

## AI Integration Patterns

### LLM Service Usage
```javascript
const llmService = require('../shared/llm-service');

const response = await llmService.generateResponse(
  "Analyze my productivity today",
  {
    tasks: userTasks,
    habits: userHabits,
    goals: userGoals
  },
  {
    personality: 'Coach',
    requestType: 'analysis'
  }
);
```

### Feedback System Extension
```javascript
// Add to feedback-system.js
buildCustomPrompt(data) {
  return `Analyze this custom data: ${JSON.stringify(data)}`;
}
```

## UI Patterns

### Standard Component Structure
```javascript
const Component = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Header with title and action button
  // Stats cards (use grid grid-cols-1 md:grid-cols-3)
  // Main content area
  // Modals/forms for data entry
  
  return (
    <div className="p-6 space-y-6">
      {/* Standard layout */}
    </div>
  );
};
```

### Styling Guidelines
- Use `card` class for containers
- Use `button-primary` and `button-secondary` for buttons
- Use `input-primary` for form inputs
- Follow the gray-900/gray-800 color scheme
- Use Lucide React icons

## Common Extension Examples

### 1. Journaling Feature
- Table: `journal_entries` (id, content, mood, tags, created_at)
- Model: `JournalModel` with CRUD operations
- Component: Daily journal with mood tracking
- AI Integration: Sentiment analysis and insights

### 2. Fitness Tracking
- Table: `workouts` (id, type, duration, calories, created_at)
- Integration: Sync with fitness APIs
- Analytics: Progress charts and AI coaching

### 3. Time Blocking
- Table: `time_blocks` (id, task_id, start_time, end_time, actual_duration)
- Feature: Calendar integration
- AI: Automatic scheduling suggestions

### 4. Team Features
- Tables: `teams`, `team_members`, `shared_goals`
- Sync: WebSocket or API integration
- Privacy: Optional cloud sync with encryption

## Configuration Patterns

### Settings Integration
```javascript
// Add to SettingsModel
static getJournalingEnabled() {
  return this.get('journaling_enabled') === 'true';
}

// UI in Settings.js
<label>
  <input 
    type="checkbox" 
    checked={settings.journaling_enabled}
    onChange={(e) => updateSetting('journaling_enabled', e.target.checked)}
  />
  Enable journaling
</label>
```

### Voice Commands
```javascript
// Add to VoiceInterface.js
const handleVoiceCommand = (transcript) => {
  if (transcript.includes('journal')) {
    // Handle journal voice commands
  }
};
```

## Testing Approach

### Manual Testing
1. Create sample data in database
2. Test CRUD operations through UI
3. Verify IPC communication
4. Test with different AI providers

### Integration Points
- Database operations (SQLite)
- IPC communication (Electron)
- AI service calls (LLM providers)
- System monitoring (Windows APIs)

## Performance Considerations

### Database
- Use indexed queries for large datasets
- Implement pagination for lists
- Regular cleanup of old monitoring data

### UI
- Lazy load components
- Virtualize long lists
- Optimize re-renders with React.memo

### AI
- Cache frequent prompts
- Use local models for simple tasks
- Batch API calls when possible

## Security Best Practices

### API Keys
- Store encrypted in local database
- Never log or expose in UI
- Validate before making requests

### Data Privacy
- All data stays local by default
- Optional cloud backup with encryption
- Clear data export/deletion options

### System Access
- Request minimal permissions
- Transparent monitoring disclosure
- User control over all tracking

This architecture supports rapid AI-driven development while maintaining privacy, performance, and extensibility.