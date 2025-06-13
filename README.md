# OmniCoach MVP

A local-first, privacy-respecting AI assistant that acts as a productivity coach, therapist, and executive assistant. Built with Electron + React for Windows desktop.

## 🚀 Features

### Core MVP Features
- **📋 Task Management** - Create, track, and organize tasks with priorities and deadlines
- **🎯 Goal Tracking** - Set and monitor long-term objectives with progress visualization
- **📅 Habit Building** - Track daily habits and build consistent routines
- **🤖 AI Assistant** - Multi-personality AI coach with voice interaction
- **📊 Analytics** - Detailed insights into productivity and behavior patterns
- **💰 Cost Tracking** - Monitor AI usage costs and stay within budget
- **🖥️ System Monitoring** - Track app usage and productivity scores
- **🔒 Privacy First** - All data stored locally, no cloud dependencies

### AI Capabilities
- **Multiple LLM Support** - Ollama (local), OpenAI GPT-4, Anthropic Claude
- **Voice Interaction** - Speech-to-text and text-to-speech with wake word support
- **Personality Modes** - Coach, Jean-Luc Picard, Therapist personalities
- **Automated Feedback** - Intelligent daily feedback based on productivity data
- **Budget Management** - Cost tracking with $100/month default budget

## 🛠️ Tech Stack

- **Frontend**: React 18 + TailwindCSS
- **Desktop**: Electron
- **Database**: SQLite (better-sqlite3)
- **AI Integration**: Ollama, OpenAI API, Claude API
- **Voice**: Speech Recognition API + TTS
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Ollama** (optional, for local AI):
   ```bash
   # Install Ollama from https://ollama.ai
   ollama pull mistral  # or your preferred model
   ```

### Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd omnicoach
   npm install
   ```

2. **Development mode**:
   ```bash
   npm run dev
   ```
   This starts both the React dev server and Electron app.

3. **Production build**:
   ```bash
   npm run build
   npm run build:electron
   ```

## ⚙️ Configuration

### API Keys (Optional)

For cloud AI providers, add your API keys in Settings:

- **OpenAI**: Get from https://platform.openai.com/api-keys
- **Claude**: Get from https://console.anthropic.com/

### Ollama Setup (Recommended)

1. Install Ollama from https://ollama.ai
2. Pull a model: `ollama pull mistral`
3. OmniCoach will automatically detect and use Ollama

## 🎯 Usage

### First Time Setup

1. **Launch OmniCoach** - The app will create a local database automatically
2. **Configure Settings** - Set your preferences, API keys, and budget
3. **Add Your First Task** - Click "Add Task" to get started
4. **Set Up Habits** - Create daily habits you want to track
5. **Define Goals** - Set long-term objectives with deadlines

### Voice Interaction

- **Enable Voice** in Settings → Voice & AI
- **Wake Word**: Say "Hey Coach" (customizable)
- **Manual Mode**: Click the microphone button
- **Personality Switching**: Change AI personality in real-time

### AI Features

- **Ask Questions**: "What should I focus on today?"
- **Get Feedback**: "How am I doing with my goals?"
- **Voice Commands**: "Add a task to call mom tomorrow"
- **Personality Chat**: Switch to Jean-Luc Picard for wise advice

## 📊 Analytics & Monitoring

### Automatic Tracking
- **App Usage** - Time spent in different applications
- **Productivity Scores** - Intelligent scoring based on app categories
- **Habit Streaks** - Track consistency and build momentum
- **Goal Progress** - Visual progress tracking with deadlines

### Privacy
- All monitoring data stays on your device
- No telemetry or external tracking
- System monitoring can be disabled anytime

## 💡 AI Extensibility

OmniCoach is designed to be extended by AI agents. The modular architecture allows for easy feature additions:

### Adding New Features
1. **Database Models** - Extend `src/shared/models.js`
2. **UI Components** - Add React components in `src/components/`
3. **Services** - Create new services in `src/shared/`
4. **IPC Handlers** - Add Electron IPC in `src/main/main.js`

### Example: Adding Journaling
```javascript
// 1. Add to database schema
CREATE TABLE journal_entries (
  id INTEGER PRIMARY KEY,
  content TEXT,
  mood INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

// 2. Create model
class JournalModel {
  static create(entry) { /* ... */ }
  static getAll() { /* ... */ }
}

// 3. Add React component
const Journal = () => { /* ... */ };

// 4. Add to navigation
```

## 🔧 Troubleshooting

### Common Issues

**Database Error on Startup**
- Ensure write permissions in app data directory
- Try deleting `%APPDATA%/omnicoach/omnicoach.db` to reset

**Ollama Connection Failed**
- Verify Ollama is running: `ollama serve`
- Check model is installed: `ollama list`
- Default URL: `http://localhost:11434`

**Voice Not Working**
- Check microphone permissions
- Ensure browser supports Speech Recognition API
- Try manual mode instead of always-listening

**High AI Costs**
- Switch to Ollama for free local inference
- Adjust budget warnings in Settings
- Review usage in Analytics → AI Usage

## 📁 Project Structure

```
omnicoach/
├── src/
│   ├── main/           # Electron main process
│   │   └── main.js     # App entry, IPC handlers
│   ├── shared/         # Shared logic
│   │   ├── database.js # SQLite schema & init
│   │   ├── models.js   # Data models
│   │   ├── llm-service.js      # AI integration
│   │   ├── system-monitor.js   # App monitoring
│   │   └── feedback-system.js  # Automated feedback
│   ├── components/     # React components
│   │   ├── Dashboard.js
│   │   ├── Tasks.js
│   │   ├── Goals.js
│   │   ├── Habits.js
│   │   ├── Analytics.js
│   │   ├── Settings.js
│   │   ├── Sidebar.js
│   │   └── VoiceInterface.js
│   ├── App.js         # Main React app
│   ├── index.js       # React entry
│   └── index.css      # TailwindCSS styles
├── public/            # Static assets
├── package.json       # Dependencies & scripts
└── README.md         # This file
```

## 🎨 Design Philosophy

### Local-First
- All data stored locally using SQLite
- Works offline completely
- You own your data

### Privacy-Respecting
- No telemetry or tracking
- API keys stored locally and encrypted
- System monitoring is transparent and optional

### AI-Extensible
- Modular architecture for easy AI-driven expansion
- Clear interfaces for adding new features
- Designed to grow with user needs

### Windows-Native
- Electron provides native desktop experience
- System-level integrations (future: notifications, shortcuts)
- Optimized for productivity workflows

## 🗺️ Roadmap

### Immediate Enhancements
- [ ] Voice recognition (Whisper integration)
- [ ] Text-to-speech with personality voices
- [ ] Google Calendar sync
- [ ] Improved system monitoring
- [ ] Browser extension for time tracking

### Future Extensions
- [ ] Journaling module
- [ ] Fitness tracking integration
- [ ] Wearable device sync (Apple Watch, etc.)
- [ ] Meditation/mindfulness features
- [ ] Advanced scheduling and time-blocking
- [ ] Team collaboration features
- [ ] Mobile app companion

## 🤝 Contributing

OmniCoach is designed to be extended by AI. To add new features:

1. Use the existing patterns in `src/shared/models.js`
2. Follow the React component structure
3. Add IPC handlers in `main.js` for database access
4. Update the navigation in `App.js`

## 📄 License

MIT License - you're free to use, modify, and distribute OmniCoach.

## 🆘 Support

For issues or feature requests:
1. Check the troubleshooting section above
2. Review the project structure for customization
3. The codebase is designed to be AI-readable for easy extension

---

Built with ❤️ for productivity enthusiasts who value privacy and local control.