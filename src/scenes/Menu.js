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

    // Variable para almacenar el récord
    this.bestDistance = 0;
  }

  create(data) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Cargar el récord desde localStorage
    this.loadBestDistance();

    // Fondo del menú
    this.add.image(width / 2, height / 2, 'sky').setScale(2);

    // Añadir estrellas decorativas
    this.createStarfield(width, height);

    // Crear un contenedor para el menú principal
    this.mainMenuContainer = this.add.container(0, 0);

    // Agregar elementos al contenedor del menú principal
    this.createMainMenu(width, height);

    // Añadir el panel del récord
    this.createBestDistancePanel(width, height);

    // Versión del juego
    this.add.text(width - 10, height - 10, 'v1.0.0', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#ffffff'
    }).setOrigin(1, 1);

    // Si venimos de AnimationTest y se solicita mostrar instrucciones
    if (data && data.showInstructions) {
      this.showInstructions();
    }
  }

  /**
   * Crea los elementos del menú principal
   */
  createMainMenu(width, height) {
    // Título del juego - Colocado en la parte superior
    const title = this.add.text(width / 2, height * 0.15, 'PINGUFLY', {
      fontFamily: 'Arial',
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Subtítulo - Justo debajo del título
    const subtitle = this.add.text(width / 2, height * 0.25, 'Fly Penguin, Fly!', {
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

    // Fondo del botón con gradiente
    const background = this.add.graphics();
    background.fillGradientStyle(0x003366, 0x003366, 0x0088cc, 0x0088cc, 1);
    background.fillRoundedRect(-width/2, -height/2, width, height, 15);

    // Efecto de brillo interno
    const innerGlow = this.add.graphics();
    innerGlow.fillStyle(0x66ccff, 0.3);
    innerGlow.fillRoundedRect(-width/2 + 5, -height/2 + 5, width - 10, height - 10, 10);

    // Borde exterior del botón
    const outerBorder = this.add.graphics();
    outerBorder.lineStyle(4, 0xffaa00, 1);
    outerBorder.strokeRoundedRect(-width/2, -height/2, width, height, 15);

    // Borde interior brillante
    const innerBorder = this.add.graphics();
    innerBorder.lineStyle(2, 0xffffdd, 0.7);
    innerBorder.strokeRoundedRect(-width/2 + 6, -height/2 + 6, width - 12, height - 12, 9);

    // Decoración: pequeñas estrellas en las esquinas
    const stars = this.add.container(0, 0);

    // Posiciones de las estrellas (esquinas)
    const starPositions = [
      { x: -width/2 + 15, y: -height/2 + 15 },
      { x: width/2 - 15, y: -height/2 + 15 },
      { x: -width/2 + 15, y: height/2 - 15 },
      { x: width/2 - 15, y: height/2 - 15 }
    ];

    // Crear estrellas en cada posición
    starPositions.forEach(pos => {
      // Estrella central
      const star = this.add.circle(pos.x, pos.y, 2, 0xffffff, 0.9);

      // Rayos de la estrella
      const rays = this.add.graphics();
      rays.lineStyle(1, 0xffffdd, 0.7);
      const rayLength = 4;

      rays.beginPath();
      rays.moveTo(pos.x - rayLength, pos.y);
      rays.lineTo(pos.x + rayLength, pos.y);
      rays.moveTo(pos.x, pos.y - rayLength);
      rays.lineTo(pos.x, pos.y + rayLength);
      rays.strokePath();

      stars.add([star, rays]);

      // Animar el brillo de las estrellas
      this.tweens.add({
        targets: [star, rays],
        alpha: 0.3,
        duration: Phaser.Math.Between(1000, 2000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // Texto del botón con sombra
    const buttonTextShadow = this.add.text(2, 2, text, {
      fontFamily: 'Arial',
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#000000',
      align: 'center'
    }).setOrigin(0.5).setAlpha(0.5);

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
    container.add([background, innerGlow, outerBorder, innerBorder, stars, buttonTextShadow, buttonText]);

    // Configurar interactividad
    container.setSize(width, height);
    container.setInteractive();

    // Animación de brillo en el borde
    this.tweens.add({
      targets: innerBorder,
      alpha: 0.3,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    return {
      button: container,
      elements: [container],
      text: buttonText,
      background: background,
      border: outerBorder,
      glow: innerGlow,
      innerBorder: innerBorder,
      textShadow: buttonTextShadow,
      stars: stars
    };
  }

  /**
   * Configura la interactividad de los botones
   */
  setupButtons(startButton, instructionsButton) {
    // Botón de inicio
    startButton.on('pointerover', () => {
      this.tweens.add({
        targets: startButton,
        scale: 1.05,
        duration: 200,
        ease: 'Sine.easeOut'
      });

      // Efecto de brillo intensificado al pasar el mouse
      const glow = startButton.getAt(1); // innerGlow
      glow.clear();
      glow.fillStyle(0x99ddff, 0.5);
      glow.fillRoundedRect(-startButton.width/2 + 5, -startButton.height/2 + 5, startButton.width - 10, startButton.height - 10, 10);

      // Cambiar el color del borde
      const border = startButton.getAt(2); // outerBorder
      border.clear();
      border.lineStyle(4, 0xffcc00, 1);
      border.strokeRoundedRect(-startButton.width/2, -startButton.height/2, startButton.width, startButton.height, 15);
    });

    startButton.on('pointerout', () => {
      this.tweens.add({
        targets: startButton,
        scale: 1.0,
        duration: 200,
        ease: 'Sine.easeOut'
      });

      // Restaurar el brillo normal
      const glow = startButton.getAt(1); // innerGlow
      glow.clear();
      glow.fillStyle(0x66ccff, 0.3);
      glow.fillRoundedRect(-startButton.width/2 + 5, -startButton.height/2 + 5, startButton.width - 10, startButton.height - 10, 10);

      // Restaurar el color del borde
      const border = startButton.getAt(2); // outerBorder
      border.clear();
      border.lineStyle(4, 0xffaa00, 1);
      border.strokeRoundedRect(-startButton.width/2, -startButton.height/2, startButton.width, startButton.height, 15);
    });

    startButton.on('pointerdown', () => {
      // Efecto de presionado
      this.tweens.add({
        targets: startButton,
        scale: 0.95,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          this.startGame();
        }
      });
    });

    // Botón de instrucciones - Mismo comportamiento
    instructionsButton.on('pointerover', () => {
      this.tweens.add({
        targets: instructionsButton,
        scale: 1.05,
        duration: 200,
        ease: 'Sine.easeOut'
      });

      // Efecto de brillo intensificado al pasar el mouse
      const glow = instructionsButton.getAt(1); // innerGlow
      glow.clear();
      glow.fillStyle(0x99ddff, 0.5);
      glow.fillRoundedRect(-instructionsButton.width/2 + 5, -instructionsButton.height/2 + 5, instructionsButton.width - 10, instructionsButton.height - 10, 10);

      // Cambiar el color del borde
      const border = instructionsButton.getAt(2); // outerBorder
      border.clear();
      border.lineStyle(4, 0xffcc00, 1);
      border.strokeRoundedRect(-instructionsButton.width/2, -instructionsButton.height/2, instructionsButton.width, instructionsButton.height, 15);
    });

    instructionsButton.on('pointerout', () => {
      this.tweens.add({
        targets: instructionsButton,
        scale: 1.0,
        duration: 200,
        ease: 'Sine.easeOut'
      });

      // Restaurar el brillo normal
      const glow = instructionsButton.getAt(1); // innerGlow
      glow.clear();
      glow.fillStyle(0x66ccff, 0.3);
      glow.fillRoundedRect(-instructionsButton.width/2 + 5, -instructionsButton.height/2 + 5, instructionsButton.width - 10, instructionsButton.height - 10, 10);

      // Restaurar el color del borde
      const border = instructionsButton.getAt(2); // outerBorder
      border.clear();
      border.lineStyle(4, 0xffaa00, 1);
      border.strokeRoundedRect(-instructionsButton.width/2, -instructionsButton.height/2, instructionsButton.width, instructionsButton.height, 15);
    });

    instructionsButton.on('pointerdown', () => {
      // Efecto de presionado
      this.tweens.add({
        targets: instructionsButton,
        scale: 0.95,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          this.showInstructions();
        }
      });
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
    const panelHeight = height * 0.8;
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
    const closeButtonY = height * 0.8;
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
      // Hacer visible el menú principal pero con alpha 0
      this.mainMenuContainer.setVisible(true);
      this.mainMenuContainer.setAlpha(0);

      // Animar ambas capas simultáneamente (cross-fade)
      this.tweens.add({
        targets: instructionsLayer,
        alpha: 0,
        duration: 500,
        ease: 'Power2'
      });

      // Fade in del menú principal
      this.tweens.add({
        targets: this.mainMenuContainer,
        alpha: 1,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          // Solo destruir las instrucciones cuando ambas animaciones hayan terminado
          instructionsLayer.destroy();
        }
      });
    });

    // Botón para ver las animaciones del pingüino
    const animButtonWidth = 180;
    const animButtonHeight = 40;
    const animButtonY = height * 0.65;

    // Crear el fondo del botón
    const animButtonBg = this.add.graphics();
    animButtonBg.fillStyle(0x006600, 1);
    animButtonBg.fillRoundedRect(
      width / 2 - animButtonWidth / 2,
      animButtonY - animButtonHeight / 2,
      animButtonWidth,
      animButtonHeight,
      15
    );

    // Borde del botón
    const animButtonBorder = this.add.graphics();
    animButtonBorder.lineStyle(3, 0xffaa00, 1);
    animButtonBorder.strokeRoundedRect(
      width / 2 - animButtonWidth / 2,
      animButtonY - animButtonHeight / 2,
      animButtonWidth,
      animButtonHeight,
      15
    );

    // Texto del botón
    const animText = this.add.text(width / 2, animButtonY, 'VER ANIMACIONES', {
      fontFamily: 'Arial',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Crear zona interactiva para el botón
    const animButton = this.add.zone(
      width / 2,
      animButtonY,
      animButtonWidth,
      animButtonHeight
    ).setInteractive();

    // Hacer interactivo el botón de animaciones
    animButton.on('pointerover', () => {
      animButtonBg.clear();
      animButtonBg.fillStyle(0x008800, 1);
      animButtonBg.fillRoundedRect(
        width / 2 - animButtonWidth / 2,
        animButtonY - animButtonHeight / 2,
        animButtonWidth,
        animButtonHeight,
        15
      );
      animText.setScale(1.1);
    });

    animButton.on('pointerout', () => {
      animButtonBg.clear();
      animButtonBg.fillStyle(0x006600, 1);
      animButtonBg.fillRoundedRect(
        width / 2 - animButtonWidth / 2,
        animButtonY - animButtonHeight / 2,
        animButtonWidth,
        animButtonHeight,
        15
      );
      animText.setScale(1.0);
    });

    animButton.on('pointerdown', () => {
      // Transición de salida
      this.cameras.main.fade(300, 0, 0, 0, false, (camera, progress) => {
        if (progress === 1) {
          // Iniciar la escena de prueba de animaciones
          this.scene.start('AnimationTest');
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
      closeButton,
      animButtonBg,
      animButtonBorder,
      animText,
      animButton
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

  /**
   * Crea un campo de estrellas decorativas
   */
  createStarfield(width, height) {
    // Añadir estrellas aleatorias en el fondo
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 3);
      const alpha = Phaser.Math.FloatBetween(0.2, 1);

      const star = this.add.circle(x, y, size, 0xffffff, alpha);

      // Añadir destello a algunas estrellas
      if (Phaser.Math.Between(0, 10) > 8) {
        this.tweens.add({
          targets: star,
          alpha: 0.1,
          duration: Phaser.Math.Between(1000, 3000),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }

    // Añadir algunas estrellas más grandes con efecto de destello
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);

      // Estrella central
      const starSize = Phaser.Math.Between(2, 4);
      const star = this.add.circle(x, y, starSize, 0xffffff, 1);

      // Añadir destellos (líneas que salen de la estrella)
      const rays = this.add.graphics();
      rays.lineStyle(1, 0xffffff, 0.8);

      // Dibujar 4 rayos en forma de cruz
      const rayLength = Phaser.Math.Between(5, 10);
      rays.beginPath();
      rays.moveTo(x - rayLength, y);
      rays.lineTo(x + rayLength, y);
      rays.moveTo(x, y - rayLength);
      rays.lineTo(x, y + rayLength);
      rays.strokePath();

      // Animar el destello
      this.tweens.add({
        targets: [star, rays],
        alpha: 0.2,
        duration: Phaser.Math.Between(1500, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  /**
   * Carga la mejor distancia desde localStorage
   */
  loadBestDistance() {
    const stored = localStorage.getItem('pinguFly_bestDistance');
    this.bestDistance = stored ? parseInt(stored, 10) : 0;
  }

  /**
   * Crea un panel para mostrar la mejor distancia
   */
  createBestDistancePanel(width, height) {
    // Posicionar el panel en la parte inferior del contenedor del menú
    const panelY = height * 0.92;

    // Crear un panel decorativo para el récord
    const panelWidth = width * 0.3;
    const panelHeight = height * 0.08;

    // Contenedor para el panel
    const recordContainer = this.add.container(width / 2, panelY);

    // Fondo del panel con gradiente
    const recordPanel = this.add.graphics();
    recordPanel.fillGradientStyle(0x000044, 0x000044, 0x0066aa, 0x0066aa, 1);
    recordPanel.fillRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 10);

    // Borde brillante
    const panelBorder = this.add.graphics();
    panelBorder.lineStyle(2, 0xffdd00, 1);
    panelBorder.strokeRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 10);

    // Título "BEST DISTANCE"
    const recordTitle = this.add.text(0, -panelHeight/4, "BEST DISTANCE", {
      fontFamily: 'Impact',
      fontSize: '16px',
      color: '#ffdd00',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Valor del récord
    const recordValue = this.add.text(0, panelHeight/5, `${this.bestDistance} m`, {
      fontFamily: 'Impact',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Añadir todo al contenedor
    recordContainer.add([recordPanel, panelBorder, recordTitle, recordValue]);

    // Agregar un brillo animado al borde
    this.tweens.add({
      targets: panelBorder,
      alpha: 0.5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Añadir el contenedor al menú principal
    this.mainMenuContainer.add(recordContainer);
  }
}
