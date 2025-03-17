/**
 * Escena Menu - Muestra el menú principal del juego
 * con opciones para comenzar, ver instrucciones, etc.
 */

import Phaser from 'phaser';

export default class Menu extends Phaser.Scene {
  constructor() {
    super('Menu');

    // Referencia a elementos de la UI principal
    this.mainMenuContainer = null;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Fondo del menú
    this.add.image(width / 2, height / 2, 'sky').setScale(2);

    // Crear un contenedor para el menú principal
    this.mainMenuContainer = this.add.container(0, 0);

    // Agregar elementos al contenedor del menú principal
    this.createMainMenu(width, height);

    // Versión del juego
    this.add.text(width - 10, height - 10, 'v1.0.0', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#ffffff'
    }).setOrigin(1, 1);
  }

  /**
   * Crea los elementos del menú principal
   */
  createMainMenu(width, height) {
    // Título del juego - Colocado en la parte superior
    const title = this.add.text(width / 2, height * 0.15, 'YETI SPORTS 5', {
      fontFamily: 'Arial',
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Subtítulo - Justo debajo del título
    const subtitle = this.add.text(width / 2, height * 0.25, 'Flamingo Drive', {
      fontFamily: 'Arial',
      fontSize: '32px',
      fontStyle: 'italic',
      color: '#ffffaa',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Calcular dimensiones óptimas para los botones
    const buttonSpacing = height * 0.12; // Espacio entre botones
    const buttonPanelTop = height * 0.35; // Posición superior del panel de botones

    // Crear un panel decorativo para los botones
    const panelWidth = width * 0.8;
    const panelHeight = height * 0.5;
    const buttonPanel = this.add.graphics();
    buttonPanel.fillStyle(0x000000, 0.5);
    buttonPanel.fillRoundedRect(
      width / 2 - panelWidth / 2,
      buttonPanelTop,
      panelWidth,
      panelHeight,
      20
    );
    buttonPanel.lineStyle(3, 0x4444aa, 1);
    buttonPanel.strokeRoundedRect(
      width / 2 - panelWidth / 2,
      buttonPanelTop,
      panelWidth,
      panelHeight,
      20
    );

    // Posiciones de los botones
    const buttonY1 = buttonPanelTop + panelHeight * 0.3;
    const buttonY2 = buttonPanelTop + panelHeight * 0.7;

    // Botón de jugar - Ocupa la parte superior del panel
    const startButton = this.createCustomButton(
      width / 2,
      buttonY1,
      'JUGAR',
      panelWidth * 0.7,
      panelHeight * 0.25
    );

    // Botón de instrucciones - Ocupa la parte inferior del panel
    const instructionsButton = this.createCustomButton(
      width / 2,
      buttonY2,
      'INSTRUCCIONES',
      panelWidth * 0.7,
      panelHeight * 0.25
    );

    // Añadir todo al contenedor
    this.mainMenuContainer.add([buttonPanel, title, subtitle]);
    this.mainMenuContainer.add(startButton.elements);
    this.mainMenuContainer.add(instructionsButton.elements);

    // Hacer los botones interactivos
    this.setupButtons(startButton.button, instructionsButton.button);

    // Añadir algunas animaciones para hacer el menú más dinámico
    this.addMenuAnimations(title, subtitle);
  }

  /**
   * Crea un botón personalizado con fondo, texto y efecto de brillo
   */
  createCustomButton(x, y, text, width, height) {
    // Crear un contenedor para el botón
    const container = this.add.container(x, y);

    // Fondo del botón
    const background = this.add.graphics();
    background.fillStyle(0x0066aa, 1);
    background.fillRoundedRect(-width/2, -height/2, width, height, 15);

    // Borde del botón
    const border = this.add.graphics();
    border.lineStyle(4, 0xffaa00, 1);
    border.strokeRoundedRect(-width/2, -height/2, width, height, 15);

    // Texto del botón
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: 'Arial',
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Añadir todos los elementos al contenedor
    container.add([background, border, buttonText]);

    // Configurar interactividad
    container.setSize(width, height);
    container.setInteractive();

    return {
      button: container,
      elements: [container],
      text: buttonText,
      background: background,
      border: border
    };
  }

  /**
   * Configura la interactividad de los botones
   */
  setupButtons(startButton, instructionsButton) {
    // Botón de inicio
    startButton.on('pointerover', () => {
      startButton.scale = 1.05;
      this.tweens.add({
        targets: startButton,
        scale: 1.1,
        duration: 200,
        ease: 'Sine.easeOut'
      });
    });

    startButton.on('pointerout', () => {
      this.tweens.add({
        targets: startButton,
        scale: 1.0,
        duration: 200,
        ease: 'Sine.easeOut'
      });
    });

    startButton.on('pointerdown', () => {
      this.startGame();
    });

    // Botón de instrucciones
    instructionsButton.on('pointerover', () => {
      instructionsButton.scale = 1.05;
      this.tweens.add({
        targets: instructionsButton,
        scale: 1.1,
        duration: 200,
        ease: 'Sine.easeOut'
      });
    });

    instructionsButton.on('pointerout', () => {
      this.tweens.add({
        targets: instructionsButton,
        scale: 1.0,
        duration: 200,
        ease: 'Sine.easeOut'
      });
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
    // Ocultar el menú principal mientras se muestran las instrucciones
    this.mainMenuContainer.setVisible(false);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Crear una capa de instrucciones
    const instructionsLayer = this.add.container(0, 0);

    // Fondo semi-transparente
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

    // Panel decorativo para las instrucciones
    const panelWidth = width * 0.8;
    const panelHeight = height * 0.7;
    const instructionsPanel = this.add.graphics();
    instructionsPanel.fillStyle(0x222244, 0.9);
    instructionsPanel.fillRoundedRect(width / 2 - panelWidth / 2, height * 0.15, panelWidth, panelHeight, 20);
    instructionsPanel.lineStyle(4, 0xffaa00, 1);
    instructionsPanel.strokeRoundedRect(width / 2 - panelWidth / 2, height * 0.15, panelWidth, panelHeight, 20);

    // Texto de instrucciones
    const instructionsTitle = this.add.text(width / 2, height * 0.25, 'INSTRUCCIONES', {
      fontFamily: 'Arial',
      fontSize: '32px',
      fontWeight: 'bold',
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
      fontSize: '22px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5);

    // Botón para cerrar - Usando el mismo estilo de botón personalizado
    const closeButtonY = height * 0.7;
    const closeButtonWidth = panelWidth * 0.4;
    const closeButtonHeight = panelHeight * 0.15;

    // Fondo del botón
    const closeButtonBg = this.add.graphics();
    closeButtonBg.fillStyle(0x0066aa, 1);
    closeButtonBg.fillRoundedRect(
      width / 2 - closeButtonWidth / 2,
      closeButtonY - closeButtonHeight / 2,
      closeButtonWidth,
      closeButtonHeight,
      15
    );

    // Borde del botón
    const closeButtonBorder = this.add.graphics();
    closeButtonBorder.lineStyle(4, 0xffaa00, 1);
    closeButtonBorder.strokeRoundedRect(
      width / 2 - closeButtonWidth / 2,
      closeButtonY - closeButtonHeight / 2,
      closeButtonWidth,
      closeButtonHeight,
      15
    );

    // Texto del botón
    const closeText = this.add.text(width / 2, closeButtonY, 'VOLVER', {
      fontFamily: 'Arial',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Crear una zona interactiva para el botón
    const closeButton = this.add.zone(
      width / 2,
      closeButtonY,
      closeButtonWidth,
      closeButtonHeight
    ).setInteractive();

    // Hacer interactivo el botón de cerrar
    closeButton.on('pointerover', () => {
      closeButtonBg.clear();
      closeButtonBg.fillStyle(0x0088cc, 1);
      closeButtonBg.fillRoundedRect(
        width / 2 - closeButtonWidth / 2,
        closeButtonY - closeButtonHeight / 2,
        closeButtonWidth,
        closeButtonHeight,
        15
      );
      closeText.setScale(1.1);
    });

    closeButton.on('pointerout', () => {
      closeButtonBg.clear();
      closeButtonBg.fillStyle(0x0066aa, 1);
      closeButtonBg.fillRoundedRect(
        width / 2 - closeButtonWidth / 2,
        closeButtonY - closeButtonHeight / 2,
        closeButtonWidth,
        closeButtonHeight,
        15
      );
      closeText.setScale(1.0);
    });

    closeButton.on('pointerdown', () => {
      // Animar la salida de las instrucciones
      this.tweens.add({
        targets: instructionsLayer,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          instructionsLayer.destroy();
          // Mostrar el menú principal nuevamente
          this.mainMenuContainer.setVisible(true);
        }
      });
    });

    // Añadir todo al contenedor
    instructionsLayer.add([
      bg,
      instructionsPanel,
      instructionsTitle,
      instructionsText,
      closeButtonBg,
      closeButtonBorder,
      closeText,
      closeButton
    ]);

    // Animar la entrada de las instrucciones
    instructionsLayer.alpha = 0;
    this.tweens.add({
      targets: instructionsLayer,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });
  }
}
