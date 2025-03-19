/**
 * Escena Game - Escena principal donde ocurre la jugabilidad
 * Controla el flujo de juego, la física y las interacciones
 */

import Phaser from 'phaser';
import physicsConfig from '../config/physicsConfig';
import PowerBar from '../components/ui/PowerBar';
import AngleIndicator from '../components/ui/AngleIndicator';
import CameraController from '../utils/CameraController';
import GameOverScreen from '../components/ui/GameOverScreen';
import CharacterManager from '../components/characters/CharacterManager';
import GameStateManager from '../utils/GameStateManager';
import ScoreManager from '../utils/ScoreManager';
import GameUI from '../components/ui/GameUI';
import LaunchManager from '../components/gameplay/LaunchManager';

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game');

    // Punto de inicio del lanzamiento
    this.launchPositionX = 710;
    this.launchPositionY = 540;

    // Control de cámara
    this.initialCameraX = 400; // Posición inicial X de la cámara

    // Flag para indicar si estamos esperando el primer clic
    this.waitingForFirstClick = false;
  }

  create() {
    // Configurar el mundo físico con límites extendidos hacia la izquierda (valores negativos de X)
    this.matter.world.setBounds(-10000, 0, 20000, 600);
    // Reducir la gravedad para un vuelo más lento y mayor deslizamiento
    this.matter.world.setGravity(0, 0.3);

    // Inicializar gestores principales
    this.stateManager = new GameStateManager();
    this.scoreManager = new ScoreManager(this, {
      pixelToMeterRatio: 10 // Escala arbitraria para el juego
    });

    // Crear el fondo
    this.createBackground();

    // Inicializar gestor de personajes
    this.characterManager = new CharacterManager(this, {
      launchPositionX: this.launchPositionX,
      launchPositionY: this.launchPositionY
    });
    this.characterManager.createCharacters();

    // Crear el suelo
    this.createGround();

    // Inicializar controlador de cámara
    this.cameraController = new CameraController(this, {
      worldBounds: { x: -10000, y: 0, width: 20000, height: 600 },
      initialCenterX: this.initialCameraX,
      initialCenterY: 300
    });

    // Inicializar componentes UI
    this.angleIndicator = new AngleIndicator(this, {
      originX: this.launchPositionX,
      originY: this.launchPositionY,
      minAngle: physicsConfig.angle.min,
      maxAngle: physicsConfig.angle.max
    });

    this.powerBar = new PowerBar(this, {
      barX: this.scale.width - 35,
      barY: this.launchPositionY - 65
    });

    this.gameOverScreen = new GameOverScreen(this);

    // Crear interfaz de usuario
    this.gameUI = new GameUI(this);
    this.gameUI.createUI();

    // Inicializar gestor de lanzamiento
    this.launchManager = new LaunchManager(this);

    // Configurar la entrada de usuario
    this.setupInput();

    // Iniciar el juego
    this.startGame();
  }

  update() {
    // Actualizar la distancia si el pingüino está en el aire
    if (this.stateManager.currentState === 'FLYING') {
      // Actualizar la puntuación
      this.scoreManager.updateDistance(this.characterManager.getPenguinX(), this.launchPositionX);

      // Actualizar UI
      this.gameUI.updateDistanceText(this.scoreManager.currentDistance, this.scoreManager.totalDistance);

      // Comprobar si el pingüino se ha detenido
      if (this.characterManager.updatePenguinPhysics()) {
        this.endLaunch();
      }

      // Gestionar el seguimiento de la cámara basado en la posición del pingüino
      this.cameraController.followTarget(this.characterManager.penguin, true);
    }
  }

  /**
   * Crea el fondo y los elementos del entorno
   */
  createBackground() {
    // Añadir cielo como fondo
    this.add.image(400, 300, 'sky').setScale(2).setScrollFactor(0);

    // En una versión más completa, añadiríamos más elementos de fondo
    // como montañas lejanas, nubes, etc.
  }

  /**
   * Crea el suelo y cualquier otra superficie de colisión
   */
  createGround() {
    // Crear suelo físico extendido hacia la izquierda
    this.ground = this.matter.add.image(0, 580, 'ground');
    this.ground.setScale(200, 1); // Suelo mucho más ancho para permitir un recorrido extenso en ambas direcciones
    this.ground.setStatic(true);

    // Propiedades del suelo - reducir la fricción para simular hielo
    this.ground.setFriction(0.001);       // Reducir casi a cero para deslizamiento extremo
    this.ground.setFrictionStatic(0.001); // Fricción estática también casi nula
  }

  /**
   * Configurar la entrada de usuario
   */
  setupInput() {
    // Configurar la entrada de clic para seleccionar ángulo y potencia
    this.input.on('pointerdown', () => {
      this.handlePlayerInput();
    });

    // Configurar la tecla Escape para volver al menú
    this.input.keyboard.on('keydown-ESC', () => {
      this.backToMenu();
    });

    // Configurar la tecla R para reiniciar el juego
    this.input.keyboard.on('keydown-R', () => {
      this.restartGame();
    });
  }

  /**
   * Vuelve al menú principal
   */
  backToMenu() {
    // Efecto de transición
    this.cameraController.fade({
      callback: () => {
        // Detener las físicas para evitar problemas
        this.matter.world.pause();

        // Volver a la escena del menú
        this.scene.start('Menu');
      }
    });
  }

  /**
   * Reinicia el juego actual
   */
  restartGame() {
    // Iniciar algunas acciones de reinicio inmediatamente
    this.stateManager.setState('RESETTING');

    // Detener físicas inmediatamente
    this.matter.world.pause();

    // Resetear velocidades inmediatamente para detener cualquier movimiento visible
    if (this.characterManager.penguin && this.characterManager.penguin.body) {
      this.characterManager.penguin.setVelocity(0, 0);
      this.characterManager.penguin.setAngularVelocity(0);
    }

    // Asegurarnos de limpiar cualquier texto del ángulo
    if (this.angleIndicator && typeof this.angleIndicator.clearTexts === 'function') {
      this.angleIndicator.clearTexts();
    }

    // Retrasar 200 ms el flash:
    setTimeout(() => {
      // Efecto de transición con flash blanco (más corto)
      this.cameraController.flash({
        duration: 200,
        color: 0xffffff
      });

      // Restablecer la posición de la cámara inmediatamente
      this.cameraController.setScrollX(this.cameraController.getInitialScrollX());

      // Reiniciar todos los valores del juego
      this.stateManager.reset();
      this.scoreManager.resetCurrentDistance();
      this.scoreManager.resetTotalDistance();

      // Actualizar textos de distancia
      this.gameUI.updateDistanceText(0, 0);

      // Actualizar la UI de intentos
      this.gameUI.updateAttemptsUI(0, this.stateManager.getMaxAttempts());

      // Eliminar textos existentes
      this.cleanupTexts();

      // Reiniciar posición del pingüino
      this.characterManager.resetPositions();

      // Reanudar físicas
      this.matter.world.resume();

      // Iniciar el juego nuevamente
      this.startGame();
    }, 100);
  }

  /**
   * Elimina textos temporales de la escena
   */
  cleanupTexts() {
    this.children.list
      .filter(child => child.type === 'Text' &&
        (child.text.includes('JUEGO TERMINADO') ||
          child.text.includes('Distancia total') ||
          child.text.includes('Haz clic para') ||
          child.text.includes('NUEVO RÉCORD') ||
          child.text.includes('Ángulo') ||  // Más genérico para incluir cualquier texto con "Ángulo"
          child.name === 'angleText'))      // Buscar por nombre también
        .forEach(text => {
          text.destroy();
        });
  }

  /**
   * Inicia el juego
   */
  startGame() {
    this.stateManager.setState('READY');

    // Mostrar mensaje de inicio
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const startPrompt = this.add.text(width / 2, 170, 'Haz clic para comenzar', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setName('startPrompt');

    // Animar el texto
    this.tweens.add({
      targets: startPrompt,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Mostrar mensaje informativo sobre los controles
    this.gameUI.showControlsInfo();

    // Establecer flag para saber que estamos esperando el primer clic
    this.waitingForFirstClick = true;
  }

  /**
   * Maneja la entrada del jugador según el estado del juego
   */
  handlePlayerInput() {
    // Si hay un modal abierto, no procesar ninguna entrada
    if (this.stateManager.isModalOpen) return;

    // Si estamos esperando el primer clic, comenzar la selección de ángulo
    if (this.waitingForFirstClick) {
      this.waitingForFirstClick = false;

      // Eliminar todos los textos de inicio
      this.children.list
        .filter(child => child.type === 'Text' && child.text === 'Haz clic para comenzar')
        .forEach(text => text.destroy());

      // Eliminar el contenedor de controles
      const controlsInfo = this.children.getByName('controlsInfo');
      if (controlsInfo) controlsInfo.destroy();

      this.launchManager.startAngleSelection();
      return;
    }

    // Basado en el estado actual del juego
    switch (this.stateManager.currentState) {
      case 'ANGLE_SELECTION':
        this.launchManager.endAngleSelection();
        this.launchManager.startPowerSelection();
        break;

      case 'POWER_SELECTION':
        this.launchManager.endPowerSelection();
        this.launchManager.launchPenguin();
        break;

      case 'ENDED':
        // Prevenir múltiples reinicios debido a clics rápidos
        if (this.stateManager.isResetting) return;

        // Establecer el flag de reinicio
        this.stateManager.isResetting = true;

        // Eliminar el contenedor de controles si existe
        const controlsInfo = this.children.getByName('controlsInfo');
        if (controlsInfo) controlsInfo.destroy();

        this.resetLaunch();
        break;
    }
  }

  /**
   * Finaliza el lanzamiento actual
   */
  endLaunch() {
    // Acumular la distancia actual al total
    this.scoreManager.addCurrentToTotal();

    // Animar actualización del total
    this.tweens.add({
      targets: this.gameUI.distanceText,
      scaleX: { from: 1.3, to: 1 },
      scaleY: { from: 1.3, to: 1 },
      duration: 300,
      ease: 'Back.easeOut'
    });

    // Verificar si hemos alcanzado el número máximo de intentos
    if (this.stateManager.isGameOver()) {
      this.endGame();
    } else {
      // Preparar para el siguiente lanzamiento
      this.gameUI.showNextLaunchPrompt();
      this.stateManager.setState('ENDED');
    }
  }

  /**
   * Finaliza el juego actual
   */
  endGame() {
    this.stateManager.setState('ENDED');
    this.stateManager.isModalOpen = true;

    // Comprobar si hemos batido el récord
    const isNewRecord = this.scoreManager.checkAndUpdateBestDistance();

    if (isNewRecord) {
      // Actualizar el texto de mejor distancia
      this.gameUI.updateBestDistanceText(this.scoreManager.bestTotalDistance);
    }

    // Definir los callbacks como funciones de flecha
    const handleRestart = () => {
      this.stateManager.isModalOpen = false;
      this.restartGame();
    };

    const handleMainMenu = () => {
      this.stateManager.isModalOpen = false;
      this.backToMenu();
    };

    // Mostrar la pantalla de fin de juego usando GameOverScreen
    this.gameOverScreen.show({
      totalDistance: this.scoreManager.totalDistance,
      bestDistance: this.scoreManager.bestTotalDistance,
      onRestart: handleRestart,
      onMainMenu: handleMainMenu
    });
  }

  /**
   * Reinicia la posición para un nuevo lanzamiento
   */
  resetLaunch() {
    // Restablecer la posición de la cámara con una animación
    this.cameraController.resetToInitial();

    // Posicionar personajes fuera de la pantalla para la animación
    this.characterManager.positionOffscreen();

    // Restablecer propiedades del pingüino
    this.characterManager.penguin.setVelocity(0, 0);
    this.characterManager.penguin.setAngularVelocity(0);
    this.characterManager.penguin.setAngle(0);
    this.characterManager.penguin.setStatic(true);

    // Asegurarnos de limpiar cualquier texto del ángulo
    if (this.angleIndicator && typeof this.angleIndicator.clearTexts === 'function') {
      this.angleIndicator.clearTexts();
    }

    // Reiniciamos solo la distancia actual para el nuevo intento
    this.scoreManager.resetCurrentDistance();

    // Eliminar todos los textos temporales
    this.cleanupTexts();

    // Añadir mensaje "Preparando el lanzamiento..."
    const width = this.cameras.main.width;
    const preparingText = this.add.text(width / 2, 170, 'Preparando el lanzamiento...', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setName('preparingText');

    // Animar la entrada de los personajes
    this.characterManager.animateEntrance(() => {
      // Eliminar texto "Preparando el lanzamiento..."
      preparingText.destroy();

      // Iniciar la selección de ángulo
      this.launchManager.startAngleSelection();

      // Restablecer el flag de reinicio para permitir futuros reinicios
      this.stateManager.isResetting = false;
    });
  }
}
