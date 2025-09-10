# iller4 - Medical MCQ Trainer

A mobile-first web application for medical students to practice multiple choice questions. Features 300 Swedish medical questions across 73 categories with intelligent progress tracking and adaptive learning.

![iller4 Home Screen](https://github.com/user-attachments/assets/e6bf48db-fc65-4919-a755-4a485262db66)

## ✨ Key Features

- **300 Swedish Medical Questions** - Comprehensive question bank covering 73 medical categories
- **Smart Progress Tracking** - Local storage tracks daily stats and per-category accuracy
- **Adaptive Learning** - Focuses on weakest categories for targeted improvement
- **Mobile-First Design** - Optimized for smartphones and tablets
- **Offline-Capable** - Works without internet after initial load
- **No Registration** - All data stored locally on your device

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x (for local development server)

### Setup & Run

1. **Clone the repository**
   ```bash
   git clone https://github.com/okface/iller4.git
   cd iller4
   ```

2. **Start local server** (required for CORS)
   ```bash
   python3 -m http.server 8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

4. **Start practicing!**
   - Choose "5-question quiz" or "10-question quiz" for random questions
   - Use "10-question weakest" to focus on your challenging areas

> **⚠️ Important:** Never open `index.html` directly in the browser due to CORS restrictions. Always use an HTTP server.

## 📱 How It Works

### Home Screen
- **Daily Stats**: Track your progress with correct answers, attempts, and accuracy
- **Quick Start**: Jump into quizzes of different lengths
- **Adaptive Learning**: The app identifies your weakest categories automatically

### Quiz Interface
- Clean, distraction-free question presentation
- Immediate feedback with detailed explanations
- Progress tracking within each session
- Category and question number display

### Progress Tracking
- **Daily Statistics**: Tracks performance per day (Europe/Stockholm timezone)
- **Category Analytics**: Identifies strong and weak medical topics
- **Local Storage**: All data stays on your device (no cloud sync)

## 🏗️ Technical Architecture

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Styling**: Custom CSS with CSS custom properties
- **Data**: YAML format for questions
- **Dependencies**: js-yaml (CDN), Inter font (Google Fonts)

### File Structure
```
iller4/
├── app.js              # Main application logic (368 lines)
├── index.html          # Single-page application structure
├── styles.css          # Mobile-first CSS styling
└── data/
    └── questions.yaml  # Medical question database (5,827 lines)
```

### Key Components

**app.js** - Core application logic:
- IIFE wrapper for scope isolation
- YAML question loading with js-yaml
- localStorage-based progress tracking
- Quiz session management
- DOM manipulation utilities

**questions.yaml** - Question database:
- 300 Swedish medical questions
- 73 categories (Kardiologi, Neurologi, etc.)
- Multiple choice format with explanations
- Images excluded for faster loading

## 🔧 Development

### Development Workflow
1. Edit files directly (no build process required)
2. Refresh browser to see changes
3. Test functionality:
   - Question loading and display
   - localStorage persistence
   - Mobile responsive design
   - Cross-browser compatibility

### Testing & Validation

**JavaScript Syntax Check:**
```bash
node -c app.js
```

**Server Health Check:**
```bash
curl -I http://localhost:8000/
```

**Browser Testing:**
- Open Developer Tools
- Check Console for JavaScript errors
- Verify YAML loading (no CORS errors)
- Test localStorage functionality

### Configuration

Key settings in `app.js`:
- `QUESTIONS_PATH`: `"./data/questions.yaml"`
- `TZ`: `"Europe/Stockholm"`
- `MAX_CATS_AUTO`: `3` (categories for auto-selection)

localStorage keys:
- `mmcq_stats_v1`: Daily and category statistics
- `mmcq_cache_v1`: Reserved for future features

## 📊 Question Format

Questions in `data/questions.yaml` follow this structure:

```yaml
- number: '1.001'
  category: Kardiologi
  uses_image: false
  question: "Swedish medical question text..."
  options:
    - "Option A"
    - "Option B"
    - "Option C"
    - "Option D"
  correct_option_index: 2
  more_information: "Detailed explanation..."
```

The app automatically filters to use only questions with `uses_image: false`.

## 🛠️ Common Issues & Solutions

**CORS Errors**
- Always serve files through HTTP server
- Never open `index.html` directly in browser

**YAML Loading Failures**
- Ensure `data/questions.yaml` is accessible
- Check js-yaml CDN availability
- Verify YAML syntax is valid

**Performance**
- App loads in ~2 seconds
- No optimization needed for typical usage
- Questions load instantly after initial YAML parse

## 🤝 Contributing

This project uses vanilla JavaScript for simplicity. When making changes:

1. Start the local HTTP server first
2. Edit files directly (no build process)
3. Test in browser immediately
4. Check browser console for errors
5. Verify YAML loading still works

### For Copilot Editors

Refer to `.github/copilot-instructions.md` for detailed development guidelines and architecture information.

## 📄 License

Medical content is for educational purposes. Check with institution guidelines for usage permissions.

---

**Made for medical students** 🩺 **Built with care** ❤️