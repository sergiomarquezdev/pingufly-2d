# Design and Development Documentation: PinguFly videogame (Initial Version - Javascript Web)

**Date:** March 17, 2025
**Version:** 1.1 (Adapted for Javascript Web)
**Product:** PinguFly videogame
**Audience:** Game Designers, Game Developers

## 1. Introduction and Product Vision

This document details the functionalities and gameplay of the video game 'PinguFly' with the aim of serving as a guide for the design and development of an initial remake version. This first version will focus on the core mechanics of the game, omitting for now secondary elements such as giraffes, snakes, and other advanced obstacles.

The vision for this first version is to recreate the fundamental experience of launching a penguin as far as possible using a flamingo as a golf club, maintaining the essence and charm of the original game, using web technologies with Javascript for its implementation.

## 2. Target Audience

Casual players who enjoy games with simple and addictive mechanics, as well as fans of the original Yeti Sports series looking to relive the experience through web browsers on various devices (including mobile).

## 3. Target Platform (Initial)

The initial target platform will be the **web**, developed using **Javascript**, **HTML5**, and **CSS**. The goal is for this web version to be responsive and playable in modern browsers on both desktop computers and mobile devices.

## 4. Genre

Arcade, Sports (launching).

## 5. Core Gameplay Loop

1.  The player initiates a launch.
2.  The player adjusts the penguin's launch angle using a one-click/touch timing system.
3.  The player adjusts the power of the hit using a two-click/touch timing system.
4.  The Yeti hits the penguin with the flamingo.
5.  The penguin is launched through the environment.
6.  The distance reached is measured and displayed.
7.  The player has a limited number of launches per game (initially, consider 5 launches as in the original).
8.  The objective is to achieve the greatest accumulated distance or the best distance in a single launch (to be defined).

## 6. Detailed Gameplay Design (Initial Version)

### 6.1. Controls

The simple two-interaction (click or touch) control scheme will be maintained, adapting it to the web environment:

* **PC (Web):** Left mouse click. `mousedown` or `mouseup` events will be used to detect clicks.
* **Mobile (Web):** Touch on the screen. `touchstart` or `touchend` events will be used to detect touches.

The game logic should abstract the difference between click and touch to maintain consistency in gameplay.

### 6.2. Angle Selection Mechanic

* Upon initiating the launch, an arrow will appear moving vertically over the Yeti on the canvas.
* The player must perform the first interaction (click or touch) when the arrow is at the desired angle.
* The range and speed of the arrow's movement should be calibrated to offer a fair and precise challenge. A moderate speed could be considered for this initial version.

### 6.3. Power Selection Mechanic

* After selecting the angle, a power bar will appear moving horizontally (or vertically) on the canvas.
* The player must perform the second interaction (click or touch) when the power bar reaches the desired level.
* The speed and range of the power bar should also be carefully calibrated. A bar with an adequate range and a speed that allows for good precision would be ideal to start with.

### 6.4. Launch and Initial Physics

* Once the angle and power are defined, the Yeti will perform an animation (by manipulating the DOM or the canvas) hitting the penguin with the flamingo.
* A basic 2D physics system using Javascript will be implemented to simulate the penguin's trajectory in the air. 2D physics libraries in Javascript (such as Matter.js) be used, or a simplified physics logic can be implemented.
* Initially, complex interactions with the environment will not be implemented. The penguin will simply follow a ballistic trajectory until it hits the ground.

### 6.5. Distance Measurement

* The distance the penguin travels will be displayed in real-time, updating an HTML element on the web page.
* Upon completion of the launch (when the penguin stops), the final distance reached for that attempt will be displayed.
* The best distance reached in the current session should also be displayed on the web interface.

### 6.6. Number of Launches

* The player will have a limited number of 5 launches per game, as in the original game. This information will be managed using Javascript variables and displayed in the UI.

## 7. Environment Design (Initial Version)

The environment design will be done using HTML elements, CSS, and/or an HTML5 canvas.

* **Perspective:** The game will be developed in a 2D view with horizontal scrolling. The Yeti will be located on the far left.
* **Ground:** A `<div>` element or drawn on the canvas representing the savanna surface. CSS styles will be used to give it color (light brown or sandy yellow) and possibly a simple texture.
* **Background:**
    * **Sky:** A `<div>` element or drawn on the canvas with a blue background color. Elements such as clouds can be added using CSS or by drawing them on the canvas.
    * **Distant Elements:** Silhouettes of acacia trees and hills can be implemented as SVG images or elements drawn on the canvas to maintain scalability.
* **Nearby Vegetation (Non-Interactive):** Elements such as clumps of tall grass and small bushes can be implemented as images (PNG with transparency) or elements drawn on the canvas and positioned near the Yeti.
* **Visual Style:** Maintain a simple, clean, and colorful graphic style, similar to the original. Spritesheets can be used for the animations of the Yeti and the penguin, managed with Javascript on the canvas or by manipulating CSS styles.
* **Distance Measurement:** A clear visual indicator at the top of the web page will display the distance traveled by the penguin, updated dynamically with Javascript.

## 8. Character Design (Initial Version)

* **Yeti:** Can be represented with a series of images (sprites) for the animations. Javascript will control which sprite is displayed at each moment (idle, hitting). These sprites can be loaded into `<img>` elements or drawn on the canvas.
* **Penguin:** Similar to the Yeti, sprites will be used for the start, flight, and landing animations.
* **Flamingo:** Can be represented as a static image or as part of the Yeti's animation.

## 9. User Interface (UI) and User Experience (UX) (Initial Version)

The user interface will be built with HTML elements and styled with CSS. The interaction and update logic will be managed with Javascript.

* **Launch Screen:**
    * Main container for the game (can be a `<div>` containing the canvas and other elements).
    * `<img>` elements or elements drawn on the canvas for the Yeti and the penguin.
    * Visual elements (drawn on canvas or `<div>` elements with CSS styles) for the angle indicator (arrow) and the power bar.
    * Optionally, a `<button>` to start the launch.
* **Game Screen:**
    * The main canvas where the environment and the penguin's trajectory are rendered.
    * A `<span>` or `<div>` element to display the current distance.
* **Results Screen:**
    * `<div>` or `<span>` elements to display the distance of the last launch and the best distance.
    * A `<span>` or `<div>` element to indicate the number of remaining launches.
    * A `<button>` to restart the game.

## 10. Technical Considerations (Initial Version - Javascript Web) - Detailed Analysis

For the development of this remake using Javascript and focusing on a web version compatible with mobile devices, the most recommended and optimal option, considering the use of spritesheets for the Yeti and penguin models, is the 2D game framework **Phaser**.

**Specific Recommendation: Phaser**

* **Justification:**
    * **Robust Spritesheet Support:** Phaser offers efficient and easy-to-use tools for loading, managing, and animating spritesheets, which will be the basis for the visual representation of the Yeti and the penguin. This allows for the creation of fluid and detailed animations for all game actions.
    * **Integrated 2D Physics Engine (Matter.js):** Phaser includes the 2D physics engine Matter.js, ideal for accurately and configurably simulating the penguin's ballistic trajectory, allowing for the adjustment of gravity and other parameters to replicate the physics of the original game.
    * **Ease of Development:** Phaser has a clear syntax, comprehensive documentation, and a large community of developers, which facilitates learning and problem-solving during development.
    * **Web and Mobile Performance:** It is optimized to run efficiently in modern web browsers, ensuring a good gaming experience on both desktop computers and mobile devices.
    * **Input Management:** Phaser simplifies the detection and handling of user input events (mouse clicks and screen touches), which will facilitate the implementation of the game's two-interaction control mechanics.
    * **Extensive Functionalities:** In addition to graphics and physics management, Phaser offers many other useful features for game development, such as scene management, sound, text, particle systems, and more, which could be relevant for future game expansions.
* **Spritesheet Implementation ("Models"):**
    * Spritesheets containing images of the Yeti and the penguin in different poses and for various animations (e.g., Yeti preparing to hit, hitting, penguin being hit, flying, landing) can be easily loaded and animated using Phaser's functionalities.
    * Different animations can be defined (for example, an animation for the Yeti's hit, an animation for the penguin's flight) and controlled through code in Phaser.

**Considered Alternatives (and why Phaser is the best option for this case):**

* **PixiJS:** While an excellent high-performance 2D rendering library, it would require the integration of an external physics library (like Matter.js), which adds an extra layer of complexity for the initial version.
* **Three.js or Babylon.js (3D):** These are not the most suitable option for this game, which has fundamentally 2D mechanics, and could be heavier on performance in browsers, especially on mobile devices.
* **Vanilla Javascript with Canvas:** Implementing all the necessary functionalities from scratch would be much more laborious and less efficient compared to using a framework like Phaser that already provides these optimized tools.

**Conclusion:**

For the realization of the initial version of 'PinguFly' with Javascript, using spritesheets for the characters, **Phaser is the most recommended option**. It offers an ideal balance between functionality, performance, ease of use, and a large support community, which will facilitate the work of both the designer and the developer to carry out this project.

## 11. Next Steps and Future Functionalities

Once the main mechanics are implemented and polished in Javascript, the following expansions can be considered:

* Implementation of interactive obstacles (giraffes, elephants, acacias, vultures, snakes) with their logic and animations in Javascript.
* Adding sound effects using the Web Audio API of Javascript.
* Implementing a more elaborate scoring system.
* Designing different levels or environments.
* Exploring additional game modes.
* Implementing local storage (localStorage) to save the best score.

## 12. Conclusion

This adapted document provides a specific guide for the development of the 'PinguFly' remake using Javascript for a web platform compatible with mobile devices. By focusing on the core mechanics and using the appropriate web technologies, we will be able to create a playable experience and expand the game in future iterations.

Please do not hesitate to ask any questions or make suggestions. We are ready to start development!
