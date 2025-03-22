/**
 * Escena Menu - Muestra el menú principal del juego
 * con opciones para comenzar, ver instrucciones, etc.
 */

import Phaser from 'phaser';
import StorageManager from '../utils/StorageManager';
import SoundManager from '../utils/SoundManager';

export default class Menu extends Phaser.Scene {
  constructor() {
    super('Menu');

    // Referencia a elementos de la UI principal
    this.mainMenuContainer = null;

    // Variable para almacenar el récord
    this.bestDistance = 0;

    // Flag para mostrar instrucciones
    this.showInstructions = false;

    // Flag para evitar múltiples clics
    this.isTransitioning = false;
  }

  create(data) {
    // Inicializar gestor de sonido
    this.soundManager = new SoundManager(this);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Cargar el récord desde localStorage
    this.loadBestDistance();

    // Añadir elementos decorativos de invierno
    this.createWinterBackground(width, height);

    // Crear un contenedor para el menú principal
    this.mainMenuContainer = this.add.container(0, 0);
    // Configurar una profundidad muy alta para el menú principal para que esté por encima de todo
    this.mainMenuContainer.setDepth(10);

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
      this.showInstructions = data.showInstructions;
      this.showInstructionsPanel();
    }

    // Reproducir música de menú con pequeño retraso para evitar solapamientos
    this.time.delayedCall(100, () => {
      this.soundManager.playMusic(SoundManager.MUSIC_MENU, {
        loop: true,
        fade: true,
        fadeTime: 1000,
        seek: 0 // Explícitamente comenzar desde el principio
      });
    });
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
      stroke: '#003366',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Subtítulo - Justo debajo del título
    const subtitle = this.add.text(width / 2, height * 0.25, 'Fly Penguin, Fly!', {
      fontFamily: 'Arial',
      fontSize: '32px',
      fontStyle: 'italic',
      color: '#e8f4fc',
      stroke: '#003366',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Calcular dimensiones óptimas para los botones
    const buttonSpacing = height * 0.12; // Espacio entre botones
    const buttonPanelTop = height * 0.35; // Posición superior del panel de botones

    // Crear un panel decorativo para los botones - Aspecto de bloque de hielo
    const panelWidth = width * 0.8;
    const panelHeight = height * 0.5;
    const buttonPanel = this.add.graphics();
    buttonPanel.fillStyle(0x88c1dd, 0.6);
    buttonPanel.fillRoundedRect(
      width / 2 - panelWidth / 2,
      buttonPanelTop,
      panelWidth,
      panelHeight,
      20
    );
    buttonPanel.lineStyle(3, 0x6baed6, 1);
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
    const startButton = this.createIceButton(
      width / 2,
      buttonY1,
      'JUGAR',
      panelWidth * 0.7,
      panelHeight * 0.25
    );

    // Botón de instrucciones - Ocupa la parte inferior del panel
    const instructionsButton = this.createIceButton(
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

    return {
      button: startButton.button,
      elements: [buttonPanel, title, subtitle, startButton.button, instructionsButton.button],
      text: startButton.text,
      background: startButton.background,
      border: startButton.border,
      glow: startButton.glow,
      innerBorder: startButton.innerBorder,
      textShadow: startButton.textShadow,
      snowflakes: startButton.snowflakes
    };
  }

  /**
   * Crea un botón con aspecto de hielo
   */
  createIceButton(x, y, text, width, height) {
    // Crear un contenedor para el botón
    const container = this.add.container(x, y);

    // Fondo del botón con gradiente de hielo
    const background = this.add.graphics();
    background.fillGradientStyle(0x2c85c1, 0x2c85c1, 0x88c1dd, 0x88c1dd, 1);
    background.fillRoundedRect(-width/2, -height/2, width, height, 15);

    // Efecto de brillo interno - simula luz reflejada en hielo
    const innerGlow = this.add.graphics();
    innerGlow.fillStyle(0xe8f4fc, 0.3);
    innerGlow.fillRoundedRect(-width/2 + 5, -height/2 + 5, width - 10, height - 10, 10);

    // Borde exterior del botón - efecto de hielo pulido
    const outerBorder = this.add.graphics();
    outerBorder.lineStyle(4, 0xffaa00, 1);
    outerBorder.strokeRoundedRect(-width/2, -height/2, width, height, 15);

    // Borde interior brillante
    const innerBorder = this.add.graphics();
    innerBorder.lineStyle(2, 0xffffff, 0.7);
    innerBorder.strokeRoundedRect(-width/2 + 6, -height/2 + 6, width - 12, height - 12, 9);

    // Decoración: pequeños copos de nieve en las esquinas
    const snowflakes = this.add.container(0, 0);

    // Posiciones de los copos (esquinas)
    const flakePositions = [
      { x: -width/2 + 15, y: -height/2 + 15 },
      { x: width/2 - 15, y: -height/2 + 15 },
      { x: -width/2 + 15, y: height/2 - 15 },
      { x: width/2 - 15, y: height/2 - 15 }
    ];

    // Crear copos de nieve en cada posición
    flakePositions.forEach(pos => {
      // Copo central
      const flake = this.add.circle(pos.x, pos.y, 2, 0xffffff, 0.9);

      // Rayos del copo de nieve
      const rays = this.add.graphics();
      rays.lineStyle(1, 0xffffff, 0.7);
      const rayLength = 4;

      // Dibujar 6 rayos para simular un copo de nieve
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI) / 3;
      rays.beginPath();
        rays.moveTo(pos.x, pos.y);
        rays.lineTo(
          pos.x + Math.cos(angle) * rayLength,
          pos.y + Math.sin(angle) * rayLength
        );
        rays.moveTo(pos.x, pos.y);
        rays.lineTo(
          pos.x - Math.cos(angle) * rayLength,
          pos.y - Math.sin(angle) * rayLength
        );
      rays.strokePath();
      }

      snowflakes.add([flake, rays]);

      // Animar el brillo de los copos
      this.tweens.add({
        targets: [flake, rays],
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
      color: '#001a33',
      align: 'center'
    }).setOrigin(0.5).setAlpha(0.5);

    // Texto del botón
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: 'Arial',
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#ffffff',
      align: 'center',
      stroke: '#003366',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Añadir todos los elementos al contenedor
    container.add([background, innerGlow, outerBorder, innerBorder, snowflakes, buttonTextShadow, buttonText]);

    // Configurar interactividad
    container.setSize(width, height);
    container.setInteractive();

    // Animación de brillo en el borde - efecto de hielo brillante
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
      snowflakes: snowflakes
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

      // Efecto de brillo intensificado al pasar el mouse - como hielo brillante
      const glow = startButton.getAt(1); // innerGlow
      glow.clear();
      glow.fillStyle(0xe8f4fc, 0.5);
      glow.fillRoundedRect(-startButton.width/2 + 5, -startButton.height/2 + 5, startButton.width - 10, startButton.height - 10, 10);

      // Cambiar el color del borde
      const border = startButton.getAt(2); // outerBorder
      border.clear();
      border.lineStyle(4, 0xff8c00, 1);
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
      glow.fillStyle(0xe8f4fc, 0.3);
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
      glow.fillStyle(0xe8f4fc, 0.5);
      glow.fillRoundedRect(-instructionsButton.width/2 + 5, -instructionsButton.height/2 + 5, instructionsButton.width - 10, instructionsButton.height - 10, 10);

      // Cambiar el color del borde
      const border = instructionsButton.getAt(2); // outerBorder
      border.clear();
      border.lineStyle(4, 0xff8c00, 1);
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
      glow.fillStyle(0xe8f4fc, 0.3);
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
          this.showInstructionsPanel();
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

    // Animación del subtítulo - ligero movimiento como flotando en el agua
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
   * Crea un fondo invernal con elementos del juego
   */
  createWinterBackground(width, height) {
    // Fondo principal con imagen de cielo - depth más bajo
    this.add.image(width / 2, height / 2, 'background_sky')
      .setScale(1.2)
      .setDepth(0);

    // Añadir el sol - depth bajo
    const sun = this.add.image(width * 0.2, height * 0.1, 'background_sun')
      .setScale(0.2)
      .setDepth(1);

    // Animar el brillo del sol
    this.tweens.add({
      targets: sun,
      alpha: 0.8,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Añadir montañas en el fondo - depth bajo
    this.add.image(width / 2, height * 0.8, 'background_mountain_01')
      .setScale(0.4)
      .setDepth(1);

    // Añadir textura de nieve en el suelo
    const snowGround = this.add.tileSprite(width / 2, height - 20, width, 100, 'snow_texture')
      .setAlpha(0.8)
      .setDepth(1);

    // Añadir nubes en diferentes posiciones - depth bajo-medio
    const clouds = [
      { key: 'cloud_01', x: width * 0.2, y: height * 0.3, scale: 0.8 },
      { key: 'cloud_02', x: width * 0.5, y: height * 0.2, scale: 0.6 },
      { key: 'cloud_03', x: width * 0.8, y: height * 0.25, scale: 0.7 },
      { key: 'cloud_04', x: width * 0.1, y: height * 0.15, scale: 0.5 }
    ];

    // Crear y animar cada nube
    clouds.forEach(cloud => {
      const cloudSprite = this.add.image(cloud.x, cloud.y, cloud.key)
        .setScale(cloud.scale)
        .setAlpha(0.8)
        .setDepth(2);

      // Animación de movimiento lento horizontal
      this.tweens.add({
        targets: cloudSprite,
        x: cloudSprite.x + Phaser.Math.Between(50, 100),
        duration: Phaser.Math.Between(15000, 25000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // Añadir un iglú decorativo
    const igloo = this.add.image(width * 0.2, height * 0.88, 'igloo')
      .setScale(0.3)
      .setDepth(8);

    // Añadir árboles nevados en el horizonte
    const treePositions = [
      { key: 'snow_tree', x: width * 0.14, y: height * 0.91, scale: 0.5, depth: 4 },
      { key: 'snow_tree', x: width * 0.92, y: height * 0.95, scale: 0.35, depth: 4 },
      { key: 'snow_tree', x: width * 0.3, y: height * 0.96, scale: 0.5, depth: 5 },
      { key: 'snow_tree', x: width * 0.7, y: height * 0.92, scale: 0.4, depth: 5 }
    ];

    treePositions.forEach(pos => {
      this.add.image(pos.x, pos.y, pos.key)
        .setScale(pos.scale)
        .setDepth(pos.depth);
    });

    // Añadir muñecos de nieve
    const snowmanPositions = [
      { x: width * 0.75, y: height * 0.92, scale: 0.6, depth: 6 },
      { x: width * 0.26, y: height * 0.92, scale: 0.5, depth: 6 }
    ];

    snowmanPositions.forEach(pos => {
      const snowman = this.add.image(pos.x, pos.y, 'snowman')
        .setScale(pos.scale)
        .setDepth(pos.depth);

      // Recortar 1px de la parte superior para eliminar la línea extraña
      snowman.setCrop(0, 1, 64, 63);
    });

    // Añadir un pingüino decorativo (usando el sheet)
    const penguinFrame = 0; // Frame inicial
    const pinguin = this.add.sprite(width * 0.2, height * 0.93, 'penguin_sheet', penguinFrame)
      .setScale(1)
      .setDepth(7);

    // Recortar 1px de la parte superior para eliminar la línea extraña
    pinguin.setCrop(0, 1, 32, 31);

    // Animar el pingüino para que parezca moverse ligeramente
    this.tweens.add({
      targets: pinguin,
      y: pinguin.y - 35,
      duration: 7000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Añadir copos de nieve usando el sprite en lugar de crearlos programáticamente
    this.createSnowflakes(width, height);
  }

  /**
   * Crea copos de nieve flotando en la pantalla
   */
  createSnowflakes(width, height) {
    // Grupo para los copos de nieve
    const snowflakes = this.add.group();

    // Crear 35 copos de nieve con el sprite
    for (let i = 0; i < 35; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(-100, height);
      const scale = Phaser.Math.FloatBetween(0.1, 0.2); // Escalas pequeñas para los copos
      const rotationSpeed = Phaser.Math.FloatBetween(0.1, 0.3); // Velocidad de rotación

      // Crear un copo de nieve usando el sprite
      const snowflake = this.add.image(x, y, 'snowflake')
        .setScale(scale)
        .setAlpha(Phaser.Math.FloatBetween(0.5, 0.9))
        .setDepth(8); // Por encima de los elementos decorativos pero debajo del menú

      snowflakes.add(snowflake);

      // Animación de caída con rotación
      this.tweens.add({
        targets: snowflake,
        y: height + 100, // Caer fuera de la pantalla
        x: x + Phaser.Math.Between(-100, 100), // Deriva horizontal
        rotation: snowflake.rotation + rotationSpeed * 10, // Rotación durante la caída
        duration: Phaser.Math.Between(8000, 20000), // Velocidad variable
        ease: 'Linear',
        repeat: -1,
        onRepeat: () => {
          // Reiniciar posición cuando se repita
          snowflake.y = Phaser.Math.Between(-100, -20);
          snowflake.x = Phaser.Math.Between(0, width);
          snowflake.alpha = Phaser.Math.FloatBetween(0.5, 0.9);
          snowflake.rotation = 0;
        }
      });
    }

    // Añadir unos pocos copos grandes en primer plano para dar sensación de profundidad
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(-100, height);
      const scale = Phaser.Math.FloatBetween(0.3, 0.5); // Escalas más grandes
      const rotationSpeed = Phaser.Math.FloatBetween(0.05, 0.15); // Rotación más lenta para copos grandes

      const largeSnowflake = this.add.image(x, y, 'snowflake')
        .setScale(scale)
        .setAlpha(Phaser.Math.FloatBetween(0.7, 1))
        .setDepth(9); // Máxima profundidad entre los elementos decorativos, pero por debajo del menú

      snowflakes.add(largeSnowflake);

      // Animación de caída más rápida para copos cercanos (efecto paralaje)
      this.tweens.add({
        targets: largeSnowflake,
        y: height + 100,
        x: x + Phaser.Math.Between(-150, 150),
        rotation: largeSnowflake.rotation + rotationSpeed * 10,
        duration: Phaser.Math.Between(6000, 10000), // Más rápidos que los pequeños
        ease: 'Linear',
        repeat: -1,
        onRepeat: () => {
          largeSnowflake.y = Phaser.Math.Between(-100, -20);
          largeSnowflake.x = Phaser.Math.Between(0, width);
          largeSnowflake.alpha = Phaser.Math.FloatBetween(0.7, 1);
          largeSnowflake.rotation = 0;
        }
      });
    }

    return snowflakes;
  }

  /**
   * Inicia el juego
   */
  startGame() {
    // Evitar múltiples clics
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Detener la música del menú
    this.soundManager.stopMusic(true, 500);

    // Efecto de transición
    this.cameras.main.fade(500, 0, 0, 0, false, (camera, progress) => {
      if (progress === 1) {
      this.scene.start('Game');
      }
    });
  }

  /**
   * Muestra las instrucciones del juego
   */
  showInstructionsPanel() {
    // Ocultar el menú principal mientras se muestran las instrucciones
    this.mainMenuContainer.setVisible(false);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Crear una capa de instrucciones
    const instructionsLayer = this.add.container(0, 0);
    // Configurar la profundidad del panel de instrucciones para que esté por encima de todo
    instructionsLayer.setDepth(11);

    // Fondo semi-transparente
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000033, 0.7);

    // Panel decorativo para las instrucciones - Aspecto de hielo similar a los botones
    const panelWidth = width * 0.8;
    const panelHeight = height * 0.8;
    const instructionsPanel = this.add.graphics();
    // Cambiamos a un color azul glaciar para el panel
    instructionsPanel.fillGradientStyle(0x2c85c1, 0x2c85c1, 0x88c1dd, 0x88c1dd, 0.9);
    instructionsPanel.fillRoundedRect(width / 2 - panelWidth / 2, height * 0.15, panelWidth, panelHeight, 20);
    instructionsPanel.lineStyle(4, 0x6baed6, 1);
    instructionsPanel.strokeRoundedRect(width / 2 - panelWidth / 2, height * 0.15, panelWidth, panelHeight, 20);

    // Añadir detalles de hielo en las esquinas
    const iceDetails = this.add.graphics();
    iceDetails.fillStyle(0xe8f4fc, 0.4);
    iceDetails.fillRoundedRect(
      width / 2 - panelWidth / 2 + 10,
      height * 0.15 + 10,
      panelWidth - 20,
      panelHeight - 20,
      15
    );

    // Texto de instrucciones con estilo de hielo
    const instructionsTitle = this.add.text(width / 2, height * 0.25, 'INSTRUCCIONES', {
      fontFamily: 'Arial',
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#003366',
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

    // --------- NUEVO BOTÓN DE FLECHA PARA VOLVER ---------
    // Posición en la esquina superior izquierda del panel
    const backArrowX = width / 2 - panelWidth / 2 + 45;
    const backArrowY = height * 0.15 + 35;
    const buttonRadius = 20;

    // Crear círculo con gradiente usando graphics
    const backButtonBg = this.add.graphics();
    backButtonBg.fillGradientStyle(0x2c85c1, 0x2c85c1, 0x88c1dd, 0x88c1dd, 0.9);
    backButtonBg.fillCircle(backArrowX, backArrowY, buttonRadius);
    backButtonBg.lineStyle(3, 0xffaa00, 1);
    backButtonBg.strokeCircle(backArrowX, backArrowY, buttonRadius);

    // Efecto de brillo interno
    const backButtonGlow = this.add.graphics();
    backButtonGlow.fillStyle(0xe8f4fc, 0.3);
    backButtonGlow.fillCircle(backArrowX, backArrowY, buttonRadius - 5);

    // Crear icono de flecha
    const arrowGraphic = this.add.graphics();
    arrowGraphic.fillStyle(0xffffff, 1);
    arrowGraphic.lineStyle(3, 0xffffff, 1);

    // Dibujar triángulo para la punta de la flecha
    arrowGraphic.beginPath();
    arrowGraphic.moveTo(backArrowX - 8, backArrowY);
    arrowGraphic.lineTo(backArrowX - 2, backArrowY - 8);
    arrowGraphic.lineTo(backArrowX - 2, backArrowY + 8);
    arrowGraphic.closePath();
    arrowGraphic.fillPath();

    // Dibujar línea horizontal para la flecha
    arrowGraphic.moveTo(backArrowX - 2, backArrowY);
    arrowGraphic.lineTo(backArrowX + 10, backArrowY);
    arrowGraphic.strokePath();

    // Crear una zona interactiva para el botón
    const backArrowButton = this.add.circle(backArrowX, backArrowY, buttonRadius)
      .setInteractive();

    // Hacer interactivo el botón de flecha
    backArrowButton.on('pointerover', () => {
      backButtonBg.clear();
      backButtonBg.fillGradientStyle(0x3997d3, 0x3997d3, 0x99d2ee, 0x99d2ee, 0.9);
      backButtonBg.fillCircle(backArrowX, backArrowY, buttonRadius);
      backButtonBg.lineStyle(3, 0xffaa00, 1);
      backButtonBg.strokeCircle(backArrowX, backArrowY, buttonRadius);

      backButtonGlow.clear();
      backButtonGlow.fillStyle(0xe8f4fc, 0.5);
      backButtonGlow.fillCircle(backArrowX, backArrowY, buttonRadius - 5);

      arrowGraphic.setAlpha(0.8);
      arrowGraphic.setScale(1.01);
    });

    backArrowButton.on('pointerout', () => {
      backButtonBg.clear();
      backButtonBg.fillGradientStyle(0x2c85c1, 0x2c85c1, 0x88c1dd, 0x88c1dd, 0.9);
      backButtonBg.fillCircle(backArrowX, backArrowY, buttonRadius);
      backButtonBg.lineStyle(3, 0xffaa00, 1);
      backButtonBg.strokeCircle(backArrowX, backArrowY, buttonRadius);

      backButtonGlow.clear();
      backButtonGlow.fillStyle(0xe8f4fc, 0.3);
      backButtonGlow.fillCircle(backArrowX, backArrowY, buttonRadius - 5);

      arrowGraphic.setAlpha(1);
      arrowGraphic.setScale(1);
    });

    backArrowButton.on('pointerdown', () => {
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

    // ----- MOVER EL BOTÓN VER ANIMACIONES A LA POSICIÓN INFERIOR -----
    // Usar la posición que antes era para el botón VOLVER
    const animButtonY = height * 0.8;
    const animButtonWidth = panelWidth * 0.4;
    const animButtonHeight = panelHeight * 0.15;

    // Crear el fondo del botón
    const animButtonBg = this.add.graphics();
    animButtonBg.fillGradientStyle(0x2c85c1, 0x2c85c1, 0x88c1dd, 0x88c1dd, 1);
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

    // Brillo interior
    const animButtonGlow = this.add.graphics();
    animButtonGlow.fillStyle(0xe8f4fc, 0.3);
    animButtonGlow.fillRoundedRect(
      width / 2 - animButtonWidth / 2 + 5,
      animButtonY - animButtonHeight / 2 + 5,
      animButtonWidth - 10,
      animButtonHeight - 10,
      10
    );

    // Texto del botón
    const animText = this.add.text(width / 2, animButtonY, 'VER ANIMACIONES', {
      fontFamily: 'Arial',
      fontSize: '22px',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#003366',
      strokeThickness: 3
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
      animButtonBg.fillGradientStyle(0x3997d3, 0x3997d3, 0x99d2ee, 0x99d2ee, 1);
      animButtonBg.fillRoundedRect(
        width / 2 - animButtonWidth / 2,
        animButtonY - animButtonHeight / 2,
        animButtonWidth,
        animButtonHeight,
        15
      );

      animButtonGlow.clear();
      animButtonGlow.fillStyle(0xe8f4fc, 0.5);
      animButtonGlow.fillRoundedRect(
        width / 2 - animButtonWidth / 2 + 5,
        animButtonY - animButtonHeight / 2 + 5,
        animButtonWidth - 10,
        animButtonHeight - 10,
        10
      );

      animText.setScale(1.1);
    });

    animButton.on('pointerout', () => {
      animButtonBg.clear();
      animButtonBg.fillGradientStyle(0x2c85c1, 0x2c85c1, 0x88c1dd, 0x88c1dd, 1);
      animButtonBg.fillRoundedRect(
        width / 2 - animButtonWidth / 2,
        animButtonY - animButtonHeight / 2,
        animButtonWidth,
        animButtonHeight,
        15
      );

      animButtonGlow.clear();
      animButtonGlow.fillStyle(0xe8f4fc, 0.3);
      animButtonGlow.fillRoundedRect(
        width / 2 - animButtonWidth / 2 + 5,
        animButtonY - animButtonHeight / 2 + 5,
        animButtonWidth - 10,
        animButtonHeight - 10,
        10
      );

      animText.setScale(1.0);
    });

    animButton.on('pointerdown', () => {
      // Transición de salida

      // Primero detener la música del menú
      this.soundManager.stopMusic(true, 300);

      this.cameras.main.fade(300, 0, 0, 0, false, (camera, progress) => {
        if (progress === 1) {
          // Esperar un poco más para asegurar que la música del menú se haya detenido correctamente
          this.time.delayedCall(200, () => {
            // Iniciar la escena de prueba de animaciones
            this.scene.start('AnimationTest');
          });
        }
      });
    });

    // Añadir algunos copos de nieve flotando en el panel de instrucciones
    const instructionSnowflakes = [];
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(width / 2 - panelWidth / 2 + 30, width / 2 + panelWidth / 2 - 30);
      const y = Phaser.Math.Between(height * 0.2, height * 0.7);
      const scale = Phaser.Math.FloatBetween(0.08, 0.15); // Escalas más pequeñas para el panel
      const rotationSpeed = Phaser.Math.FloatBetween(0.1, 0.2);

      const snowflake = this.add.image(x, y, 'snowflake')
        .setScale(scale)
        .setAlpha(Phaser.Math.FloatBetween(0.5, 0.8));

      instructionSnowflakes.push(snowflake);

      // Animar los copos con rotación
      this.tweens.add({
        targets: snowflake,
        y: y + Phaser.Math.Between(40, 80),
        x: x + Phaser.Math.Between(-20, 20),
        rotation: snowflake.rotation + rotationSpeed * 5,
        alpha: 0.3,
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1,
        onRepeat: () => {
          snowflake.y = Phaser.Math.Between(height * 0.2, height * 0.3);
          snowflake.x = Phaser.Math.Between(width / 2 - panelWidth / 2 + 30, width / 2 + panelWidth / 2 - 30);
          snowflake.alpha = Phaser.Math.FloatBetween(0.5, 0.8);
          snowflake.rotation = 0;
        }
      });
    }

    // Añadir todo al contenedor
    instructionsLayer.add([
      bg,
      instructionsPanel,
      iceDetails,
      instructionsTitle,
      instructionsText,
      backButtonBg,
      backButtonGlow,
      arrowGraphic,
      backArrowButton,
      animButtonBg,
      animButtonGlow,
      animButtonBorder,
      animText,
      animButton,
      ...instructionSnowflakes
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
    // Al ser parte del mainMenuContainer, heredará su depth, pero por si acaso lo configuramos también
    recordContainer.setDepth(10);

    // Fondo del panel con gradiente - Estilo de hielo
    const recordPanel = this.add.graphics();
    recordPanel.fillGradientStyle(0x2c85c1, 0x2c85c1, 0x88c1dd, 0x88c1dd, 1);
    recordPanel.fillRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 10);

    // Borde brillante
    const panelBorder = this.add.graphics();
    panelBorder.lineStyle(2, 0xffaa00, 1);
    panelBorder.strokeRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 10);

    // Efecto de brillo interno - mismo estilo que los botones
    const innerGlow = this.add.graphics();
    innerGlow.fillStyle(0xe8f4fc, 0.3);
    innerGlow.fillRoundedRect(-panelWidth/2 + 5, -panelHeight/2 + 5, panelWidth - 10, panelHeight - 10, 5);

    // Título "BEST DISTANCE"
    const recordTitle = this.add.text(0, -panelHeight/4, "BEST DISTANCE", {
      fontFamily: 'Impact',
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#003366',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Valor del récord
    const recordValue = this.add.text(0, panelHeight/5, `${this.bestDistance} m`, {
      fontFamily: 'Impact',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#003366',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Añadir todo al contenedor
    recordContainer.add([recordPanel, innerGlow, panelBorder, recordTitle, recordValue]);

    // Agregar un brillo animado al borde
    this.tweens.add({
      targets: innerGlow,
      alpha: 0.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Añadir el contenedor al menú principal
    this.mainMenuContainer.add(recordContainer);
  }
}
