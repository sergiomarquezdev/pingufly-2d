/**
 * Escena Menu - Muestra el menú principal del juego
 * con opciones para comenzar, ver instrucciones, etc.
 */

import Phaser from 'phaser';

export default class Menu extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Fondo del menú
    this.add.image(width / 2, height / 2, 'sky').setScale(2);

    // Título del juego
    const title = this.add.text(width / 2, height / 3, 'YETI SPORTS 5', {
      fontFamily: 'Arial',
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Subtítulo
    const subtitle = this.add.text(width / 2, height / 3 + 60, 'Flamingo Drive', {
      fontFamily: 'Arial',
      fontSize: '32px',
      fontStyle: 'italic',
      color: '#ffffaa',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Botón de inicio
    const startButton = this.add.image(width / 2, height / 2 + 50, 'button').setScale(2);
    const startText = this.add.text(width / 2, height / 2 + 50, 'JUGAR', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Botón de instrucciones
    const instructionsButton = this.add.image(width / 2, height / 2 + 120, 'button').setScale(2);
    const instructionsText = this.add.text(width / 2, height / 2 + 120, 'INSTRUCCIONES', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Hacer los botones interactivos
    this.setupButtons(startButton, instructionsButton);

    // Añadir algunas animaciones para hacer el menú más dinámico
    this.addMenuAnimations(title, subtitle);

    // Versión del juego
    this.add.text(width - 10, height - 10, 'v1.0.0', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#ffffff'
    }).setOrigin(1, 1);
  }

  /**
   * Configura la interactividad de los botones
   */
  setupButtons(startButton, instructionsButton) {
    // Botón de inicio
    startButton.setInteractive();
    startButton.on('pointerover', () => {
      startButton.setTint(0xaaaaff);
    });
    startButton.on('pointerout', () => {
      startButton.clearTint();
    });
    startButton.on('pointerdown', () => {
      this.startGame();
    });

    // Botón de instrucciones
    instructionsButton.setInteractive();
    instructionsButton.on('pointerover', () => {
      instructionsButton.setTint(0xaaaaff);
    });
    instructionsButton.on('pointerout', () => {
      instructionsButton.clearTint();
    });
    instructionsButton.on('pointerdown', () => {
      this.showInstructions();
    });
  }

  /**
   * Añade animaciones al menú principal
   */
  addMenuAnimations(title, subtitle) {
    // Animación del título
    this.tweens.add({
      targets: title,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Animación del subtítulo
    this.tweens.add({
      targets: subtitle,
      y: subtitle.y + 10,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Inicia el juego pasando a la escena de juego
   */
  startGame() {
    // Efecto de transición
    this.cameras.main.fade(500, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Game');
    });
  }

  /**
   * Muestra las instrucciones del juego
   */
  showInstructions() {
    // En una versión completa, podríamos mostrar una nueva escena de instrucciones
    // Por ahora, mostraremos un mensaje sencillo

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Crear una capa de instrucciones
    const instructionsLayer = this.add.container(0, height);

    // Fondo semi-transparente
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

    // Texto de instrucciones
    const instructionsTitle = this.add.text(width / 2, 100, 'INSTRUCCIONES', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    const instructionsText = this.add.text(width / 2, height / 2,
      '1. Haz clic una vez para seleccionar el ángulo\n' +
      '2. Haz clic de nuevo para seleccionar la potencia\n' +
      '3. El Yeti golpeará al pingüino con el flamenco\n' +
      '4. Intenta alcanzar la mayor distancia posible\n\n' +
      'Tienes 5 intentos por partida.', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Botón para cerrar
    const closeButton = this.add.image(width / 2, height - 100, 'button');
    const closeText = this.add.text(width / 2, height - 100, 'VOLVER', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Hacer interactivo el botón de cerrar
    closeButton.setInteractive();
    closeButton.on('pointerover', () => {
      closeButton.setTint(0xaaaaff);
    });
    closeButton.on('pointerout', () => {
      closeButton.clearTint();
    });
    closeButton.on('pointerdown', () => {
      // Animar la salida de las instrucciones
      this.tweens.add({
        targets: instructionsLayer,
        y: height,
        duration: 300,
        ease: 'Back.easeIn',
        onComplete: () => {
          instructionsLayer.destroy();
        }
      });
    });

    // Añadir todo al contenedor
    instructionsLayer.add([bg, instructionsTitle, instructionsText, closeButton, closeText]);

    // Animar la entrada de las instrucciones
    this.tweens.add({
      targets: instructionsLayer,
      y: 0,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }
}
