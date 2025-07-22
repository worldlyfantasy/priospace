# 🎯 Priospace

A beautiful, modern productivity app that combines task management with Pomodoro timer functionality and habit tracking. Built with Next.js, React, and Framer Motion for smooth animations and premium user experience.

![Todo Timer](https://img.shields.io/badge/Version-2.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)

## ✨ Features

### 📝 Task Management
- Create, edit, and manage tasks and habits
- Organize tasks with custom color-coded categories
- Mark tasks as complete with smooth animations
- Hold-to-complete gesture for mobile-friendly interaction
- Separate sections for regular tasks and habits

### ⏱️ Pomodoro Timer
- Customizable timer presets (5, 10, 25, 50 minutes)
- Real-time countdown with animated display
- Overtime tracking for extended work sessions
- Break timer with automatic transitions
- Focus time tracking for productivity insights
- Music player-style controls (play/pause/stop)

### 🔄 Habit Tracking
- GitHub-style contribution graph for 90-day habit history
- Monthly view with visual intensity indicators
- Individual habit tracking with daily completion
- Interactive grid for marking habit completion
- Comprehensive habit analytics and progress visualization

### 🎨 Beautiful UI/UX
- Modern bottom-sheet modal design
- Smooth spring animations with Framer Motion
- Responsive design optimized for mobile and desktop
- Dark/Light mode support with seamless transitions
- Primary color theming throughout the app
- Intuitive touch gestures and micro-interactions

### 📊 Data Management
- Export/Import functionality for data backup
- Local storage persistence
- Settings panel with theme controls
- Motivational intro screen with random quotes

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anoyrc/priospace.git
   cd priospace
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library with hooks and modern patterns
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth interactions

### UI Components
- **shadcn/ui** - High-quality, accessible UI components
- **Lucide React** - Beautiful, customizable icons
- **Custom Components** - CountdownTimer, CircleProgress, and modal systems

### State Management
- **React Hooks** - useState, useEffect, useRef for state management
- **Local Storage** - Data persistence in browser
- **Context API** - Theme and global state management

## 📁 Project Structure

```
todo-timer/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and Tailwind imports
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main application page
├── components/            # Reusable components
├── lib/                   # Utility functions
│   └── utils.ts          # Helper functions and utilities
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## 🎮 Usage

### Creating Tasks
1. Click the **"Add Task"** button
2. Enter your task title in the borderless input
3. Optionally select or create a category with custom colors
4. Click **"Add Task"** to save

### Using the Timer
1. Select a task from your list
2. Choose a timer preset (5, 10, 25, or 50 minutes)
3. Use the music player-style controls:
   - **Play/Pause** - Start or pause the timer
   - **Stop** - Reset the timer to original time
   - **Break** - Take a 5-minute break
4. Complete your task when finished

### Tracking Habits
1. Open the **Habit Tracker** from the bottom navigation
2. Add new habits with categories
3. Click on grid squares to mark daily completions
4. View your 90-day progress with GitHub-style visualization
5. Navigate between habit overview and individual habit views

### Managing Data
1. Access **Settings** to:
   - Toggle between light and dark themes
   - Export your data as JSON backup
   - Import previously exported data
   - Support the developer with "Buy Me a Coffee"


## 🔧 Configuration

### Customizing Colors
The app uses CSS custom properties for theming. Update your `globals.css`:

```css
:root {
  --primary: your-color-hue your-color-saturation your-color-lightness;
}
```

### Timer Presets
Modify the timer presets in `TimerModal.tsx`:

```javascript
const presets = [
  { value: "5", label: "5 min", seconds: 5 * 60 },
  { value: "15", label: "15 min", seconds: 15 * 60 },
  // Add your custom presets
];
```

### Motivational Quotes
Add custom quotes in `IntroScreen.tsx`:

```javascript
const motivationalQuotes = [
  "Your custom quote here.",
  // Add more quotes
];
```

## 📱 Progressive Web App Features

- Responsive design for mobile and desktop
- Touch gestures and mobile-optimized interactions
- Offline-ready with local storage persistence
- Fast loading with Next.js optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and component patterns
- Use TypeScript for type safety
- Add appropriate animations with Framer Motion
- Ensure responsive design works on all screen sizes
- Test both light and dark themes
- Maintain accessibility standards

## 🐛 Bug Reports & Feature Requests

Please use the [GitHub Issues](https://github.com/yourusername/todo-timer/issues) page to:
- Report bugs with detailed reproduction steps
- Request new features with clear use cases
- Discuss improvements and suggestions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Framer Motion** for smooth animations
- **Lucide** for the icon set
- **Tailwind CSS** for the utility-first styling approach
- **Next.js** team for the amazing React framework

## 💖 Support

If you find this project helpful, consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs or requesting features
- ☕ [Buying me a coffee](https://coff.ee/anoy)
- 🐦 Following [@Anoyroyc](https://x.com/Anoyroyc) on Twitter

---

<div align="center">

### 🎯 vibecoded

**Coded with ❤️ by [Anoy Roy Chowdhury](https://x.com/Anoyroyc)**

*Focus • Track • Achieve*

</div>