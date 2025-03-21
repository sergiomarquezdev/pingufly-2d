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
// Importar los nuevos componentes
import CloudManager from '../components/environment/CloudManager';
import BackgroundManager from '../components/environment/BackgroundManager';
import GroundManager from '../components/environment/GroundManager';
// Importar configuración de animaciones del pingüino
import penguinAnimations from '../config/penguinAnimations';
// import UIManager from '../components/ui/UIManager'; // File doesn't exist
// import CollisionManager from '../utils/CollisionManager'; // File doesn't exist

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

    // PASO 1: Inicializar gestores principales
    this.stateManager = new GameStateManager();
    this.scoreManager = new ScoreManager(this, {
      pixelToMeterRatio: 10 // Escala arbitraria para el juego
    });

    // PASO 2: Inicializar los gestores de entorno
    this.backgroundManager = new BackgroundManager(this);
    this.backgroundManager.create();

    this.groundManager = new GroundManager(this);
    this.groundManager.create();

    this.cloudManager = new CloudManager(this);
    this.cloudManager.create();

    // PASO 3: Crear animaciones del pingüino
    this.createPenguinAnimations();

    // PASO 4: Inicializar gestor de personajes
    this.characterManager = new CharacterManager(this, {
      launchPositionX: this.launchPositionX,
      launchPositionY: this.launchPositionY
    });
    this.characterManager.createCharacters();

    // PASO 5: Inicializar controlador de cámara
    this.cameraController = new CameraController(this, {
      worldBounds: { x: -10000, y: 0, width: 20000, height: 600 },
      initialCenterX: this.initialCameraX,
      initialCenterY: 300
    });

    // PASO 6: Inicializar componentes UI
    this.angleIndicator = new AngleIndicator(this, {
      originX: this.launchPositionX,
      originY: this.launchPositionY + 5,
      minAngle: physicsConfig.angle.min,
      maxAngle: physicsConfig.angle.max
    });

    this.powerBar = new PowerBar(this, {
      barX: this.scale.width - 35,
      barY: this.launchPositionY - 65
    });

    this.gameOverScreen = new GameOverScreen(this);

    // PASO 7: Crear interfaz de usuario
    this.gameUI = new GameUI(this);
    this.gameUI.createUI();

    // PASO 8: Inicializar controlador de lanzamiento
    this.launchManager = new LaunchManager(this);

    // Registrar el CharacterManager como observador del estado del juego
    this.stateManager.addStateObserver((newState) => {
      // Cuando cambie el estado del juego, actualizar la animación del pingüino
      if (this.characterManager) {
        this.characterManager.setAnimationByState(newState, {
          // Determinar si es un lanzamiento exitoso
          success: this.scoreManager && this.scoreManager.currentDistance > 500
        });
      }
    });

    // PASO 9: Configurar la entrada de usuario
    this.setupInput();

    // PASO 10: Iniciar el juego
    this.startGame();
  }

  /**
   * Crea las animaciones del pingüino basadas en el sprite sheet
   */
  createPenguinAnimations() {
    // Verificar que el sprite sheet está cargado
    if (!this.textures.exists('penguin_sheet')) {
      console.error('❌ El sprite sheet "penguin_sheet" no está cargado');
      return;
    }

    try {
      // Recorrer todas las animaciones definidas y crearlas
      Object.values(penguinAnimations).forEach(animConfig => {
        // Verificar si la animación ya existe y eliminarla para evitar duplicados
        if (this.anims.exists(animConfig.key)) {
          this.anims.remove(animConfig.key);
        }

        // Crear la animación
        this.anims.create({
          key: animConfig.key,
          frames: this.anims.generateFrameNumbers('penguin_sheet', {
            frames: animConfig.frames
          }),
          frameRate: animConfig.frameRate,
          repeat: animConfig.repeat
        });
      });

      // Verificar que todas las animaciones se han creado correctamente
      const animsCreated = Object.keys(this.anims.anims.entries);

      // Verificar si hay alguna animación que no se ha creado
      const expectedAnims = Object.values(penguinAnimations).map(anim => anim.key);
      const missingAnims = expectedAnims.filter(key => !animsCreated.includes(key));

      if (missingAnims.length > 0) {
        console.warn('⚠️ Algunas animaciones no se crearon correctamente:', missingAnims);
      }
    } catch (error) {
      console.error('❌ Error al crear animaciones del pingüino:', error);
    }
  }

  update() {
    // Obtener el estado actual del juego
    const gameState = this.stateManager.getState();

    // En estado FLYING, actualizar a estado GAME_OVER si el pingüino se detiene
    if (gameState === 'FLYING') {
      // Asegurar que el pingüino no rota en cada frame
      if (this.characterManager && this.characterManager.penguin) {
        this.characterManager.penguin.setAngularVelocity(0);
      }

      if (this.characterManager.updatePenguinPhysics()) {
        this.endLaunch();
      }

      // Verificar si el pingüino está fuera de los límites del mundo y ajustar la cámara
      // Esta verificación adicional ayuda con las nubes y el comportamiento de cámara
      const penguin = this.characterManager.penguin;
      if (penguin && penguin.x < this.cameraController.getInitialScrollX() - 5000) {
        // Si el pingüino se ha ido demasiado lejos, forzar la detención del vuelo
        this.endLaunch();
      }
    }

    // Actualizar la distancia si el pingüino está en el aire
    if (gameState === 'FLYING') {
      // Actualizar la puntuación
      this.scoreManager.updateDistance(this.characterManager.getPenguinCurrentX(), this.launchPositionX);

      // Actualizar UI
      this.gameUI.updateDistanceText(this.scoreManager.currentDistance, this.scoreManager.totalDistance);

      // Gestionar el seguimiento de la cámara basado en la posición del pingüino
      this.cameraController.followTarget(this.characterManager.penguin, true);
    }
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
    // Asegurarse de que el estado de modal está cerrado
    if (this.stateManager) {
      this.stateManager.setModalState(false);
    }

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

    // Asegurarse de que el modal está cerrado
    this.stateManager.setModalState(false);

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
    try {
      // Restaurar posiciones de personajes
      if (this.characterManager && typeof this.characterManager.resetPositions === 'function') {
        this.characterManager.resetPositions();
      }

      // Establecer estado inicial
      if (this.stateManager && typeof this.stateManager.reset === 'function') {
        this.stateManager.reset();
      }

      // Iniciar con el controlador de ángulo
      if (this.launchManager && typeof this.launchManager.startAngleSelection === 'function') {
        this.launchManager.startAngleSelection();
      } else {
        console.error("Error: No se pudo iniciar la selección de ángulo, launchManager no disponible");
      }

      // Configurar la cámara para seguir al pingüino cuando se lance
      if (this.cameraController &&
          this.characterManager &&
          this.characterManager.penguin &&
          typeof this.cameraController.followTarget === 'function') {
        this.cameraController.followTarget(this.characterManager.penguin, true);
      }
    } catch (error) {
      console.error("Error al iniciar el juego:", error);
    }
  }

  /**
   * Maneja la entrada del jugador según el estado del juego
   */
  handlePlayerInput() {
    // Si hay un modal abierto, ignorar completamente la entrada
    if (this.stateManager && this.stateManager.isModalOpen) {
      return;
    }

    // Si estamos en proceso de reiniciar, ignorar la entrada
    if (this.stateManager && this.stateManager.isResetting) {
      return;
    }

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

      // Asegurarnos que los componentes existen antes de usarlos
      if (this.launchManager) {
        if (typeof this.launchManager.endAngleSelection === 'function') {
          this.launchManager.endAngleSelection();
        }

        if (typeof this.launchManager.startPowerSelection === 'function') {
          this.launchManager.startPowerSelection();
        }
      }
      return;
    }

    // Verificar que tenemos los componentes necesarios
    if (!this.stateManager || !this.launchManager) {
      console.error("Error: Componentes necesarios no inicializados (stateManager o launchManager)");
      return;
    }

    // Basado en el estado actual del juego
    try {
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
          if (this.stateManager.isResetting) {
            return;
          }

          // Establecer el flag de reinicio
          this.stateManager.isResetting = true;

          // Eliminar el contenedor de controles si existe
          const controlsInfo = this.children.getByName('controlsInfo');
          if (controlsInfo) controlsInfo.destroy();

          this.resetLaunch();
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Error en handlePlayerInput:", error);
    }
  }

  /**
   * Finaliza el lanzamiento actual
   */
  endLaunch() {
    // Detener el pingüino completamente antes de procesar el final del lanzamiento
    if (this.characterManager && this.characterManager.penguin) {
      this.characterManager.penguin.setVelocity(0, 0);
      this.characterManager.penguin.setAngularVelocity(0); // Asegurar que se detiene cualquier rotación
      this.characterManager.penguin.setAngle(0); // Asegurar que el ángulo vuelve a cero
    }

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
    // Cambiar estado y abrir modal
    this.stateManager.setState('ENDED');
    this.stateManager.setModalState(true);

    // Comprobar si hemos batido el récord
    const isNewRecord = this.scoreManager.checkAndUpdateBestDistance();

    if (isNewRecord) {
      // Actualizar el texto de mejor distancia
      this.gameUI.updateBestDistanceText(this.scoreManager.bestTotalDistance);
    }

    // Definir los callbacks para depurar y asegurar ejecución
    const handleRestart = () => {
      // Verificar que podemos reiniciar
      this.stateManager.setModalState(false);

      // Llamar a restartGame después de un breve retraso
      this.time.delayedCall(100, () => {
        this.restartGame();
      });
    };

    const handleMainMenu = () => {
      // Verificar que podemos ir al menú
      this.stateManager.setModalState(false);

      // Llamar a backToMenu después de un breve retraso
      this.time.delayedCall(100, () => {
        this.backToMenu();
      });
    };

    // Desactivar input brevemente para evitar clics accidentales
    this.input.enabled = false;

    // Después de un breve retraso, mostrar la pantalla de fin de juego
    this.time.delayedCall(200, () => {
      // Reactivar input para permitir clics en los botones
      this.input.enabled = true;

      // Mostrar pantalla de fin de juego con los callbacks
      this.gameOverScreen.show({
        totalDistance: this.scoreManager.totalDistance,
        bestDistance: this.scoreManager.bestTotalDistance,
        onRestart: handleRestart,
        onMainMenu: handleMainMenu
      });
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

  /**
   * Limpia los recursos cuando la escena es destruida
   */
  shutdown() {
    // Limpiar eventos y recursos
    if (this.cloudManager) {
      this.cloudManager.destroy();
    }

    // Llamar a shutdown de la clase padre
    super.shutdown();
  }

  /**
   * Limpia los recursos cuando la escena es destruida
   * (La API de Phaser llama a este método)
   */
  destroy() {
    this.launchManager = null;
    this.stateManager = null;
    this.characterManager = null;
    this.cameraController = null;
    this.scoreManager = null;

    super.destroy();
  }
}
