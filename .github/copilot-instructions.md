# Copilot Instructions for iller4

## Repository Overview

**iller4** is a medical MCQ (Multiple Choice Question) trainer web application designed for medical students. This is a client-side JavaScript quiz application that loads medical questions from a YAML file and tracks student progress locally using browser localStorage.

### Key Characteristics
- **Type**: Static web application (HTML/CSS/JavaScript)
- **Size**: Small codebase (~6,400 lines total, with 5,827 lines being question data)
- **Languages**: HTML, CSS, JavaScript, YAML
- **Framework**: Vanilla JavaScript (no frameworks)
- **Target Runtime**: Modern web browsers
- **Dependencies**: Single external library (js-yaml from CDN)

## Build and Development Instructions

### Prerequisites
- Any modern web browser
- Python 3.x (for local development server) OR any static file server
- Node.js v20+ (optional, for JavaScript syntax validation)

### Setup and Run
**Always use these exact steps in order:**

1. **No installation required** - This is a static web application with no build process
2. **Start local server** (required for CORS and file loading):
   ```bash
   cd /home/runner/work/iller4/iller4
   python3 -m http.server 8000
   ```
3. **Access application**: Open `http://localhost:8000` in browser
4. **Stop server**: `Ctrl+C` or `pkill -f "python3 -m http.server"`

### Development Workflow
1. Edit files directly (no build step required)
2. Refresh browser to see changes
3. Test functionality by:
   - Loading questions (should display medical quiz questions)
   - Attempting quiz questions 
   - Checking localStorage stats persistence
   - Testing mobile responsive design

### Validation and Testing

**JavaScript Syntax Validation:**
```bash
# This will fail with DOM errors but validates syntax
node -c app.js  # Use -c flag for syntax check only
```

**File Serving Test:**
```bash
# Should return HTTP 200
curl -I http://localhost:8000/
```

**Browser Console Testing:**
- Open browser DevTools
- Check for JavaScript errors in Console
- Verify YAML loading works (no CORS errors)
- Test localStorage functionality

### Common Issues and Solutions

**CORS Errors**: Always serve files through HTTP server, never open `index.html` directly in browser due to YAML file loading restrictions.

**YAML Loading Failures**: Ensure `data/questions.yaml` is accessible and js-yaml CDN is reachable.

**Time Requirements**: 
- App startup: < 2 seconds
- Question loading: < 1 second
- No long-running build processes

## Project Layout and Architecture

### File Structure
```
/
├── app.js              # Main application logic (368 lines)
├── index.html          # HTML structure (119 lines) 
├── styles.css          # Styling (128 lines)
└── data/
    └── questions.yaml  # Medical quiz questions (5827 lines)
```

### Architecture Overview

**app.js** - Contains all application logic:
- IIFE wrapper for scope isolation
- Question loading from YAML using js-yaml
- localStorage-based progress tracking (Europe/Stockholm timezone)
- Quiz session management
- DOM manipulation utilities
- No module system (vanilla JavaScript)

**index.html** - Single-page application structure:
- Loads js-yaml from CDN (essential dependency)
- Two main screens: home (stats) and quiz
- Mobile-first responsive design
- Uses Inter font from Google Fonts

**styles.css** - Custom CSS styling:
- CSS custom properties for theming
- Mobile-first responsive design
- Card-based layout with purple color scheme

**data/questions.yaml** - Medical question database:
- 300 Swedish medical questions with multiple choice answers
- 73 different medical categories (including Kardiologi, etc.)
- Structure: number, category, uses_image, question, options, correct_option_index, more_information
- App filters to use only questions with `uses_image: false`

### Key Features and Logic
- **Progress Tracking**: Daily stats and per-category accuracy via localStorage
- **Question Selection**: Focuses on weakest categories for targeted learning
- **Session Management**: Tracks current quiz state and scoring
- **Mobile Optimization**: Touch-friendly interface with viewport-fit=cover

### Configuration
- Questions path: `./data/questions.yaml`
- Timezone: `Europe/Stockholm`  
- localStorage keys: `mmcq_stats_v1`, `mmcq_cache_v1`
- Max categories for auto-selection: 3

### Dependencies
- **js-yaml v4.1.0**: YAML parsing (loaded from CDN)
- **Inter font**: Typography (loaded from Google Fonts)
- **No package.json**: No npm dependencies

### Validation Pipeline
**No automated CI/CD exists.** Manual validation only:
1. Serve with HTTP server
2. Test in browser
3. Check browser console for errors
4. Verify YAML loading and quiz functionality

### Critical Files for Changes
- **app.js**: All application logic and question handling
- **data/questions.yaml**: Question content (be careful with YAML syntax)
- **styles.css**: Visual appearance and responsive behavior
- **index.html**: Structure and CDN dependencies

### Repository Root Contents
```
.git/           # Git repository data
.github/        # GitHub configuration (this file)
app.js          # Main application JavaScript
data/           # Question data directory
index.html      # Main HTML file
styles.css      # Stylesheet
```

## Instructions for Coding Agents

**Trust these instructions** and avoid unnecessary exploration. Only search/explore if:
- Information here is incomplete or incorrect
- Making changes to areas not covered in these instructions
- Debugging specific issues not addressed here

**For any changes:**
1. Start local HTTP server first (required for testing)
2. Edit files directly (no build process)
3. Test in browser immediately after changes
4. Check browser console for JavaScript errors
5. Verify YAML loading still works if touching data files

**Common tasks:**
- **Adding questions**: Edit `data/questions.yaml` following existing structure
- **UI changes**: Edit `styles.css` for appearance, `index.html` for structure  
- **Logic changes**: Edit `app.js` (single file contains all functionality)
- **Testing**: Always use HTTP server, never file:// protocol

**Performance notes**: App loads quickly (~2 seconds), no optimization needed for typical changes.