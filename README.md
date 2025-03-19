# PinguFly 🐧

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Phaser Version](https://img.shields.io/badge/Phaser-3.88.2-brightgreen.svg)
![Status](https://img.shields.io/badge/status-In%20Development-yellow)

A modern web-based remake of the classic Yeti Sports Pingu Throw game. Launch a penguin as far as possible and aim for the highest distance score!

[Play PinguFly Online](https://pingufly.sergiomarquez.dev/) | [Report a Bug](https://github.com/sergiomarquezdev/pingufly-2d/issues) | [Request a Feature](https://github.com/sergiomarquezdev/pingufly-2d/issues)

<div align="center">
  <img src="public/assets/images/game-screenshot.png" alt="PinguFly Gameplay" width="80%">
  <p><em>PinguFly in action: Angle selection phase with the penguin ready for launch</em></p>
</div>

## 📖 Table of Contents

- [PinguFly 🐧](#pingufly-)
  - [📖 Table of Contents](#-table-of-contents)
  - [🎮 About The Project](#-about-the-project)
    - [Built With](#built-with)
    - [Game Features](#game-features)
  - [✨ Features in Detail](#-features-in-detail)
    - [Physics-Based Gameplay](#physics-based-gameplay)
    - [Two-Stage Launch System](#two-stage-launch-system)
    - [Score and Progress Tracking](#score-and-progress-tracking)
    - [Responsive UI Design](#responsive-ui-design)
    - [Game State Management](#game-state-management)
  - [🚀 Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [🎮 How to Play](#-how-to-play)
    - [Controls](#controls)
    - [Game Mechanics](#game-mechanics)
  - [🛣️ Development Roadmap](#️-development-roadmap)
  - [📂 Project Structure](#-project-structure)
  - [👥 Contributing](#-contributing)
  - [📝 License](#-license)
  - [📞 Contact](#-contact)
  - [🙏 Acknowledgments](#-acknowledgments)

## 🎮 About The Project

PinguFly is a web-based remake of the classic Yeti Sports game where players launch a penguin using a yeti and a flamingo as a golf club. The objective is to launch the penguin as far as possible across an icy terrain, competing for the highest distance score.

This remake focuses on recreating the fundamental experience of the original game using modern web technologies, particularly Phaser 3 and JavaScript, making it playable across various devices including mobile phones.

### Built With

* [Phaser 3](https://phaser.io/) - A powerful 2D game framework for making HTML5 games
* [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) - Core programming language
* [Vite](https://vitejs.dev/) - Next generation frontend tooling
* [Matter.js](https://brm.io/matter-js/) - 2D physics engine (integrated with Phaser)
* [HTML5](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5) & [CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS) - For structure and styling

### Game Features

* 🎯 Two-stage launch mechanics: angle selection followed by power selection
* 🎚️ Intuitive controls for both desktop and mobile
* 🌊 Smooth physics-based gameplay with realistic projectile motion
* 📊 Score tracking and personal best records
* 🏆 Multiple launch attempts per game session
* 📱 Responsive design that works on various screen sizes
* 🎨 Appealing visuals with smooth animations
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

### Score and Progress Tracking
- Tracks distance in real-time during penguin flight
- Accumulates total distance across multiple attempts
- Stores and displays personal best records using local storage
- Visual feedback shows remaining attempts with animated penguin icons

### Responsive UI Design
- Adapts seamlessly to different screen sizes and orientations
- Full-screen game experience with proper scaling
- Touch controls optimized for mobile devices
- Desktop controls with keyboard shortcuts for improved user experience

### Game State Management
- Centralized state management with GameStateManager
- Clean scene transitions with loading states
- Game over screen with final scores and options to continue
- Persistent storage for best distances

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

## 🎮 How to Play

### Controls

- **PC/Desktop**: Use mouse clicks or taps to interact
- **Mobile**: Use touch screen taps to interact
- **Keyboard shortcuts**:
  - `ESC` - Return to main menu
  - `R` - Restart game

### Game Mechanics

1. **Start the game** - Click/tap to begin
2. **Angle selection** - Click/tap when the moving arrow is at your desired launch angle
3. **Power selection** - Click/tap when the power bar reaches your desired strength
4. **Watch the penguin fly** - The distance is measured and added to your total score
5. **Repeat** - You have 5 attempts per game to achieve the highest total distance

## 🛣️ Development Roadmap

- ✅ Core game mechanics and physics
- ✅ Basic UI elements and game flow
- ✅ Score tracking and record keeping
- ✅ Responsive design for multiple devices
- ✅ Refactored code architecture for better maintainability
- ✅ Improved positioning system for game characters
- ✅ Enhanced Game Over screen with restart options
- ✅ Optimized power and angle selection UI
- ❌ Final character assets and animations
- ❌ Sound effects and background music
- ❌ Performance optimizations for mobile devices
- ❌ Additional obstacles and interactive elements
- ❌ Online leaderboards

For a more detailed roadmap, see [timeline.md](project_docs/timeline.md).

## 📂 Project Structure

```
/pingufly-2d
├── public/               # Static assets
│   └── assets/           # Game assets (images, audio, spritesheets)
│       ├── images/       # Image assets
│       ├── audio/        # Audio assets
│       └── spritesheets/ # Spritesheet assets
├── src/                  # Source code
│   ├── components/       # Game components
│   │   ├── characters/   # Character-related components
│   │   ├── gameplay/     # Gameplay mechanics
│   │   └── ui/           # User interface components
│   ├── config/           # Game configuration
│   ├── scenes/           # Game scenes (Boot, Preload, Menu, Game)
│   ├── utils/            # Utility functions and managers
│   └── main.js           # Entry point
├── project_docs/         # Documentation files
│   └── timeline.md       # Development timeline
├── index.html            # Main HTML file
├── package.json          # NPM dependencies
└── vite.config.js        # Vite configuration
```

## 👥 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

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
