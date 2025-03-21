# PinguFly 🐧

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Phaser Version](https://img.shields.io/badge/Phaser-3.88.2-brightgreen.svg)
![Status](https://img.shields.io/badge/status-In%20Development-yellow)

A modern web-based remake of the classic Yeti Sports Pingu Throw game. Launch a penguin as far as possible through a beautifully designed winter landscape and aim for the highest distance score!

[Play PinguFly Online](https://pingufly.sergiomarquez.dev/) | [Report a Bug](https://github.com/sergiomarquezdev/pingufly-2d/issues) | [Request a Feature](https://github.com/sergiomarquezdev/pingufly-2d/issues)

<div align="center">
  <img src="public/assets/images/game-screenshot.png" alt="PinguFly Gameplay" width="80%">
  <p><em>PinguFly in action: Angle selection phase with the penguin ready for launch</em></p>
</div>

## 📖 Table of Contents

- [About The Project](#-about-the-project)
  - [Built With](#built-with)
  - [Game Features](#game-features)
- [Features in Detail](#-features-in-detail)
  - [Physics-Based Gameplay](#physics-based-gameplay)
  - [Two-Stage Launch System](#two-stage-launch-system)
  - [Dynamic Winter Environment](#dynamic-winter-environment)
  - [Score and Progress Tracking](#score-and-progress-tracking)
  - [Responsive UI Design](#responsive-ui-design)
  - [Game State Management](#game-state-management)
- [Technical Implementation](#-technical-implementation)
  - [Performance Optimizations](#performance-optimizations)
  - [Modular Code Architecture](#modular-code-architecture)
  - [Analytics Integration](#analytics-integration)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [How to Play](#-how-to-play)
  - [Controls](#controls)
  - [Game Mechanics](#game-mechanics)
- [Development Roadmap](#️-development-roadmap)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)
- [Acknowledgments](#-acknowledgments)

## 🎮 About The Project

PinguFly is a web-based remake of the classic Yeti Sports game where players launch a penguin using a yeti and a flamingo as a golf club. The objective is to launch the penguin as far as possible across an icy terrain, competing for the highest distance score.

This remake enhances the fundamental experience of the original game using modern web technologies, particularly Phaser 3 and JavaScript, making it playable across various devices including mobile phones. The game features a rich winter environment with dynamic elements such as snowflakes, trees, snowmen, and igloos that create an immersive experience.

### Built With

* [Phaser 3.88.2](https://phaser.io/) - A powerful 2D game framework for making HTML5 games
* [JavaScript (ES6+)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) - Modern JavaScript for game logic
* [Vite 6.2.2](https://vitejs.dev/) - Next generation frontend tooling for fast development and optimized builds
* [Matter.js](https://brm.io/matter-js/) - 2D physics engine (integrated with Phaser)
* [HTML5](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5) & [CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS) - For structure and styling

### Game Features

* 🎯 Two-stage launch mechanics: angle selection followed by power selection
* ❄️ Dynamic winter environment with animated snowfall and wind simulation
* 🏔️ Beautifully designed landscapes with mountains, trees, igloos, and snowmen
* 🎚️ Intuitive controls for both desktop and mobile
* 🌊 Smooth physics-based gameplay with realistic projectile motion
* 📊 Score tracking and personal best records with visual feedback
* 🏆 Multiple launch attempts per game session
* 📱 Responsive design that works on various screen sizes
* 🎨 Appealing visuals with smooth animations and glacier-styled UI
* 🧩 Modular code architecture for improved maintenance

## ✨ Features in Detail

### Physics-Based Gameplay
PinguFly utilizes the Matter.js physics engine integrated with Phaser to create realistic projectile motion. The penguin's trajectory is affected by:
- Gravity and air resistance
- Launch angle and power
- Ground friction (simulating ice for longer slides)
- Physical collisions with the environment

### Two-Stage Launch System
The game implements a strategic two-stage launch mechanic:
1. **Angle Selection**: An animated arrow indicates the launch angle, oscillating between 0° and 90°. Players time their click/tap to select the optimal angle.
2. **Power Selection**: A power bar rises and falls, allowing players to choose the perfect power level for their shot.

### Dynamic Winter Environment
- **Atmospheric Snowfall**: Continuous snowfall creates a dynamic winter atmosphere with varied opacity, sizes, and wind effects
- **Parallax Backgrounds**: Multi-layered mountains and sky create depth perception
- **Environmental Elements**: Strategically placed trees, snowmen, and igloos enhance the visual experience
- **Dynamic Clouds**: Drifting clouds in various shapes and sizes add atmosphere to the sky
- **Sun and Lighting**: Enhanced visual effects with sun rays and ambient lighting

### Score and Progress Tracking
- Tracks distance in real-time during penguin flight
- Accumulates total distance across multiple attempts
- Stores and displays personal best records using local storage
- Visual feedback shows remaining attempts with animated penguin icons
- Special effects for new record achievements on the Game Over screen

### Responsive UI Design
- Adapts seamlessly to different screen sizes and orientations
- Full-screen game experience with proper scaling
- Touch controls optimized for mobile devices
- Desktop controls with keyboard shortcuts for improved user experience
- Glacier-styled UI elements with glowing effects and animations

### Game State Management
- Centralized state management with GameStateManager
- Clean scene transitions with loading states
- Polished Game Over screen with final scores, best distance records, and restart options
- Persistent storage for best distances
- Modal state system to control user interactions at different game stages

## 🔧 Technical Implementation

### Performance Optimizations
- Efficient asset loading with proper preloading and caching strategies
- Texture optimization for reduced memory usage and faster rendering
- Particle system optimizations for snow effects without performance impact
- Efficient state management to minimize unnecessary updates
- Scene management for better memory utilization
- Optimized physics calculations for smooth gameplay

### Modular Code Architecture
- Functional programming patterns for better code organization
- Component-based design focused on single responsibilities
- Separation of concerns between game logic, UI, and physics
- Centralized configuration for easy adjustments and tuning
- Clean interfaces between systems for better maintainability
- Efficient event handling with proper cleanup to prevent memory leaks

### Analytics Integration
- Google Analytics integration for tracking user engagement
- Custom event tracking for gameplay metrics
- Performance monitoring for optimization insights
- Non-intrusive implementation that maintains game performance

## 🚀 Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

* Node.js (v14.0.0 or later)
* npm (comes with Node.js)

```bash
# Check your Node.js version
node -v

# Check your npm version
npm -v
```

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/sergiomarquezdev/pingufly-2d.git
   cd pingufly-2d
   ```

2. Install NPM packages
   ```sh
   npm install
   ```

3. Start the development server
   ```sh
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

5. For production build
   ```sh
   npm run build
   ```

6. Preview the production build
   ```sh
   npm run preview
   ```

## 🎮 How to Play

### Controls

- **PC/Desktop**: Use mouse clicks or taps to interact
- **Mobile**: Use touch screen taps to interact
- **Keyboard shortcuts**:
  - `ESC` - Return to main menu
  - `R` - Restart game

### Game Mechanics

1. **Start the game** - Click/tap the "Play" button on the main menu
2. **Angle selection** - Click/tap when the moving arrow is at your desired launch angle
3. **Power selection** - Click/tap when the power bar reaches your desired strength
4. **Watch the penguin fly** - The distance is measured and added to your total score
5. **Game Over** - After your attempts are exhausted, view your total distance and best record
6. **Play Again** - Choose to restart the game or return to the main menu

## 🛣️ Development Roadmap

- ✅ Core game mechanics and physics
- ✅ Basic UI elements and game flow
- ✅ Score tracking and record keeping
- ✅ Responsive design for multiple devices
- ✅ Refactored code architecture for better maintainability
- ✅ Improved positioning system for game characters
- ✅ Enhanced Game Over screen with restart options
- ✅ Optimized power and angle selection UI
- ✅ Dynamic snowfall effect with wind simulation
- ✅ Environmental elements (trees, snowmen, igloos)
- ❌ Final character assets and animations
- ❌ Sound effects and background music
- ❌ Performance optimizations for mobile devices
- ❌ Additional obstacles and interactive elements
- ❌ Online leaderboards

For a more detailed roadmap, see [timeline.md](project_docs/timeline.md).

## 📂 Project Structure

The project follows a modular organization pattern, with code separated by feature and responsibility:

```
pingufly-2d
├─ src/                       # Source code
│  ├─ components/             # Reusable game components
│  │  ├─ characters/          # Character-related components (CharacterManager)
│  │  ├─ environment/         # Environment components (BackgroundManager, CloudManager, GroundManager)
│  │  ├─ gameplay/            # Core gameplay mechanics (LaunchManager)
│  │  └─ ui/                  # User interface components (GameUI, PowerBar, AngleIndicator, GameOverScreen)
│  ├─ config/                 # Game configuration (gameConfig, physicsConfig, penguinAnimations)
│  ├─ entities/               # Game entities and objects
│  ├─ scenes/                 # Phaser scenes (Game, Menu, Preload, Boot, AnimationTest)
│  ├─ utils/                  # Utility classes (ScoreManager, CameraController, GameStateManager, StorageManager)
│  └─ main.js                 # Entry point
├─ public/                    # Static assets
│  └─ assets/                 # Game assets
│     ├─ images/              # Image assets (backgrounds, characters, UI)
│     └─ audio/               # Audio assets
├─ project_docs/              # Project documentation
│  ├─ assets_checklist.md     # Asset tracking and requirements
│  ├─ timeline.md             # Development timeline and roadmap
│  └─ pingufly-design_development-documentation.md # Design and development documentation
├─ index.html                 # Main HTML entry point
└─ vite.config.js             # Vite configuration
```

Each component is focused on a single responsibility, making the codebase easier to maintain and extend. All major systems follow functional programming patterns where possible, with classes used only when necessary for Phaser-specific implementations.

## 👥 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

When contributing, please follow the established code patterns:
- Use functional programming where possible
- Maintain single responsibility for components
- Follow the established naming conventions
- Prioritize performance optimizations
- Write clear documentation for your changes

## 📝 License

Distributed under the ISC License. See `LICENSE` for more information.

## 📞 Contact

**Sergio Márquez**

[![GitHub](https://img.shields.io/badge/GitHub-sergiomarquezdev-181717?logo=github&style=flat-square)](https://github.com/sergiomarquezdev)
[![X](https://img.shields.io/badge/X-smarquezdev-%23000000.svg?logo=X&logoColor=white)](https://x.com/smarquezdev)
[![LinkedIn](https://custom-icon-badges.demolab.com/badge/LinkedIn-Sergio%20Márquez%20Pérez-0A66C2?logo=linkedin-white&logoColor=fff)](https://www.linkedin.com/in/sergio-marquez-perez/)
[![Email](https://img.shields.io/badge/Email-contacto@sergiomarquez.dev-D14836?logo=gmail&style=flat-square)](mailto:contacto@sergiomarquez.dev)
[![Website](https://img.shields.io/badge/Website-sergiomarquez.dev-4285F4?logo=google-chrome&style=flat-square)](https://sergiomarquez.dev)

Project Link: [https://github.com/sergiomarquezdev/pingufly-2d](https://github.com/sergiomarquezdev/pingufly-2d)

## 🙏 Acknowledgments

* Original Yeti Sports games for inspiration
* [Phaser](https://phaser.io/) community for their excellent documentation and examples
* [OpenGameArt](https://opengameart.org/) for some of the game assets
* Everyone who has contributed to making this project better
