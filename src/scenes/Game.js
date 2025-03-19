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
import StorageManager from '../utils/StorageManager';
import CharacterManager from '../components/characters/CharacterManager';

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game');

    // Estado del juego
    this.gameState = {
      currentState: 'READY', // READY, ANGLE_SELECTION, POWER_SELECTION, LAUNCHING, FLYING, ENDED
      launchAttempts: 0,
      maxLaunchAttempts: 5,
      currentDistance: 0, // Distancia del lanzamiento actual
      totalDistance: 0,   // Distancia acumulada total de esta partida
      bestTotalDistance: StorageManager.loadBestDistance() // Mejor distancia de todas las partidas
    };

    // Ángulo y potencia
    this.angle = 45; // Ángulo inicial
    this.power = 0;  // Potencia inicial

    // Componentes
    this.characterManager = null;
    this.cameraController = null;
    this.angleIndicator = null;
    this.powerBar = null;
    this.gameOverScreen = null;

    // Elementos del juego
    this.ground = null;
    this.distanceText = null;
    this.attemptsText = null;
    this.totalDistanceText = null;
    this.bestDistanceText = null;
    this.attemptIcons = [];

    // Punto de inicio del lanzamiento
    this.launchPositionX = 700;
    this.launchPositionY = 510;

    // Control de cámara
    this.initialCameraX = 400; // Posición inicial X de la cámara

    // Flag para evitar múltiples reinicios
    this.isResetting = false;

    // Flag para indicar si hay un modal abierto
    this.isModalOpen = false;
  }

  create() {
    // Configurar el mundo físico con límites extendidos hacia la izquierda (valores negativos de X)
    this.matter.world.setBounds(-10000, 0, 20000, 600);
    // Reducir la gravedad para un vuelo más lento y mayor deslizamiento
    this.matter.world.setGravity(0, 0.3);

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
      barY: this.launchPositionY - 40
    });

    this.gameOverScreen = new GameOverScreen(this);

    // Crear la interfaz de usuario
    this.createUI();

    // Configurar la entrada de usuario
    this.setupInput();

    // Iniciar el juego
    this.startGame();
  }

  update() {
    // Actualizar la distancia si el pingüino está en el aire
    if (this.gameState.currentState === 'FLYING') {
      this.updateDistance();

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
   * Crea la interfaz de usuario
   */
  createUI() {
    // Tamaño del canvas
    const width = this.scale.width;
    const height = this.scale.height;

    // Crear un footer en la parte inferior de la pantalla
    this.uiFooter = this.add.container(0, height - 30).setScrollFactor(0);

    // Fondo del footer
    const footerBg = this.add.rectangle(0, 0, width, 30, 0x104080, 0.8)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xffffff, 0.5);

    // Añadir textura al footer para hacerlo más temático
    const footerTexture = this.add.tileSprite(0, 0, width, 50, 'ground')
      .setOrigin(0, 0)
      .setAlpha(0.3)
      .setTint(0x88bbff);

    // ===== SECCIÓN DE INTENTOS (IZQUIERDA) =====
    // Contenedor para los iconos de pingüino
    const attemptsContainer = this.add.container(20, 20);

    // Crear 5 iconos de pingüino
    this.attemptIcons = [];
    const ICON_SPACING = 30;

    for (let i = 0; i < this.gameState.maxLaunchAttempts; i++) {
      const icon = this.add.image(i * ICON_SPACING, 0, 'penguin')
        .setOrigin(0.5, 0.75)
        .setScale(1.3);

      this.attemptIcons.push(icon);
      attemptsContainer.add(icon);
    }

    // Calcular posición para el título después de los iconos de pingüino
    const titlePosX = 20 + (this.gameState.maxLaunchAttempts * ICON_SPACING) + 15;

    // Título del juego justo después de los iconos de intentos (pingüinos)
    const gameTitle = this.add.text(titlePosX, 15, "PINGUFLY", {
      fontFamily: 'Impact',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#104080',
      strokeThickness: 2,
    }).setOrigin(0, 0.5);

    // ===== SECCIÓN DE DISTANCIA TOTAL ACUMULADA (CENTRO-DERECHA) =====
    const distanceLabel = this.add.text(width - 280, 15, "DISTANCE", {
      fontFamily: 'Impact',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);

    this.distanceText = this.add.text(width - 230, 15, "0 m", {
      fontFamily: 'Impact',
      fontSize: '23px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0, 0.5);

    // ===== SECCIÓN DE MEJOR DISTANCIA (RÉCORD) =====
    const bestLabel = this.add.text(width - 105, 15, "BEST", {
      fontFamily: 'Impact',
      fontSize: '16px',
      color: '#ffdd00',
    }).setOrigin(0.5, 0.5);

    this.bestDistanceText = this.add.text(width - 75, 15, this.gameState.bestTotalDistance + " m", {
      fontFamily: 'Impact',
      fontSize: '23px',
      color: '#ffdd00',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0, 0.5);

    // Añadir todo al footer
    this.uiFooter.add([
      footerBg,
      footerTexture,
      gameTitle,
      attemptsContainer,
      distanceLabel,
      this.distanceText,
      bestLabel,
      this.bestDistanceText
    ]);
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
    this.gameState.currentState = 'RESETTING';

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
      this.gameState.currentState = 'READY';
      this.gameState.launchAttempts = 0;
      this.gameState.currentDistance = 0;
      this.gameState.totalDistance = 0;

      // Actualizar textos de distancia
      this.distanceText.setText('0 m');

      // Actualizar la UI de intentos
      this.updateAttemptsUI();

      // Eliminar textos existentes de fin de juego, instrucciones, o indicadores de ángulo/potencia
      this.children.list
        .filter(child => child.type === 'Text' &&
          (child.text.includes('JUEGO TERMINADO') ||
            child.text.includes('Distancia total') ||
            child.text.includes('Haz clic para') ||
            child.text.includes('NUEVO RÉCORD') ||
            child.text.includes('Ángulo') ||  // Más genérico para incluir cualquier texto con "Ángulo"
            child.name === 'angleText'))      // Buscar por nombre también
          .forEach(text => {
            console.log("Eliminando texto:", text.text);
            text.destroy();
          });

      // Reiniciar posición del pingüino
      this.characterManager.resetPositions();

      // Reanudar físicas
      this.matter.world.resume();

      // Iniciar el juego nuevamente
      this.startGame();
    }, 100);
  }

  /**
   * Inicia el juego
   */
  startGame() {
    this.gameState.currentState = 'READY';
    this.gameState.launchAttempts = 0;
    this.gameState.currentDistance = 0;
    this.gameState.totalDistance = 0; // Reiniciar la distancia total al comenzar

    // Actualizar texto de distancia total
    this.distanceText.setText('0 m');

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
    this.showControlsInfo();

    // Establecer flag para saber que estamos esperando el primer clic
    this.waitingForFirstClick = true;
  }

  /**
   * Muestra información sobre los controles de teclado
   */
  showControlsInfo() {
    const width = this.cameras.main.width;

    // Eliminar mensaje anterior si existe
    const existingControls = this.children.getByName('controlsInfo');
    if (existingControls) existingControls.destroy();

    // Crear un contenedor para el mensaje de controles en la parte superior
    const controlsContainer = this.add.container(width / 2, 0).setScrollFactor(0).setName('controlsInfo');

    // Fondo sutil semi-transparente con forma de píldora
    const controlsBg = this.add.graphics();
    controlsBg.fillStyle(0x000000, 0.6);
    controlsBg.fillRoundedRect(-120, 0, 240, 16, 0, 0, 8, 8);

    // Texto de los controles en una sola línea
    const controlsText = this.add.text(0, 8, "ESC = Menú | R = Reiniciar", {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Añadir todo al contenedor
    controlsContainer.add([controlsBg, controlsText]);
  }

  /**
   * Maneja la entrada del jugador según el estado del juego
   */
  handlePlayerInput() {
    // Si hay un modal abierto, no procesar ninguna entrada
    if (this.isModalOpen) return;

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

      this.startAngleSelection();
      return;
    }

    // Basado en el estado actual del juego
    switch (this.gameState.currentState) {
      case 'ANGLE_SELECTION':
        this.endAngleSelection();
        this.startPowerSelection();
        break;

      case 'POWER_SELECTION':
        this.endPowerSelection();
        this.launchPenguin();
        break;

      case 'ENDED':
        // Prevenir múltiples reinicios debido a clics rápidos
        if (this.isResetting) return;

        // Establecer el flag de reinicio
        this.isResetting = true;

        // Eliminar el contenedor de controles si existe
        const controlsInfo = this.children.getByName('controlsInfo');
        if (controlsInfo) controlsInfo.destroy();

        this.resetLaunch();
        break;
    }
  }

  /**
   * Inicia la selección de ángulo
   */
  startAngleSelection() {
    this.gameState.currentState = 'ANGLE_SELECTION';

    // Antes de iniciar, destruir cualquier objeto gráfico residual que pueda estar causando el problema
    this.children.list
      .filter(child =>
        (child.name && child.name.includes('angle')) ||
        (child.type === 'Text' && child.text && child.text.includes('Ángulo'))
      )
      .forEach(obj => {
        console.log("Game: Eliminando objeto de ángulo residual:", obj.name || obj.text);
        obj.destroy();
      });

    // Asegurarnos que el pingüino esté en estado visible correcto
    this.characterManager.penguin.clearTint();
    this.characterManager.penguin.setAlpha(1);
    this.characterManager.penguin.setVisible(true);

    // Iniciar la selección de ángulo con el componente AngleIndicator
    this.angleIndicator.startAngleSelection((angle) => {
      // Actualizar el ángulo del juego cuando cambia en el indicador
      this.angle = angle;
    });

    // Mensaje de instrucción
    this.add.text(400, 100, 'Haz clic para seleccionar el ángulo', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setName('angleInstructionText');
  }

  /**
   * Finaliza la selección de ángulo
   */
  endAngleSelection() {
    // Detener la animación del ángulo usando el componente
    this.selectedAngle = this.angleIndicator.endAngleSelection();

    // Eliminar el texto de instrucción
    this.children.list
      .filter(child => child.name === 'angleInstructionText')
      .forEach(text => text.destroy());
  }

  /**
   * Inicia la selección de potencia
   */
  startPowerSelection() {
    this.gameState.currentState = 'POWER_SELECTION';

    // Iniciar la selección de potencia con el componente PowerBar
    this.powerBar.startPowerSelection((power) => {
      // Actualizar la potencia del juego cuando cambia en la barra
      this.power = power;
    });

    // Mensaje de instrucción
    this.add.text(400, 100, 'Haz clic para seleccionar la potencia', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setName('powerInstructionText');
  }

  /**
   * Finaliza la selección de potencia
   */
  endPowerSelection() {
    // Detener la animación de potencia usando el componente
    this.selectedPower = this.powerBar.endPowerSelection();

    // Eliminar el texto de instrucción
    this.children.list
      .filter(child => child.name === 'powerInstructionText')
      .forEach(text => text.destroy());
  }

  /**
   * Lanza al pingüino con el ángulo y potencia seleccionados
   */
  launchPenguin() {
    this.gameState.currentState = 'LAUNCHING';

    // Incrementar contador de intentos
    this.gameState.launchAttempts++;

    // Actualizar el contador de intentos visual
    this.updateAttemptsUI();

    // Usar el CharacterManager para lanzar el pingüino
    this.characterManager.launchPenguin(this.selectedAngle, this.selectedPower);

    // Cambiar inmediatamente al estado FLYING sin esperar a la animación
    this.gameState.currentState = 'FLYING';

    // Reiniciar distancia actual inmediatamente
    this.gameState.currentDistance = 0;
  }

  /**
   * Actualiza la interfaz gráfica de intentos
   */
  updateAttemptsUI() {
    // Actualizar los iconos de pingüino
    for (let i = 0; i < this.gameState.maxLaunchAttempts; i++) {
      if (i < this.gameState.launchAttempts) {
        // Intento usado - pingüino completo
        this.attemptIcons[i].setAlpha(0.4);
        this.attemptIcons[i].setTint(0xaaccff);
        this.attemptIcons[i].setScale(1.0); // Escala reducida para intentos usados
      } else {
        // Intento disponible - pingüino semi-transparente
        this.attemptIcons[i].setAlpha(1);
        this.attemptIcons[i].clearTint();
        this.attemptIcons[i].setScale(1.3); // Mantener escala original
      }
    }

    // Animar el icono del intento actual
    if (this.gameState.launchAttempts > 0 && this.gameState.launchAttempts <= this.gameState.maxLaunchAttempts) {
      const currentIcon = this.attemptIcons[this.gameState.launchAttempts - 1];
      this.tweens.add({
        targets: currentIcon,
        scaleX: { from: 1.5, to: 1.0 },
        scaleY: { from: 1.5, to: 1.0 },
        duration: 300,
        ease: 'Back.easeOut'
      });
    }
  }

  /**
   * Actualiza la distancia recorrida por el pingüino
   */
  updateDistance() {
    // Calcular la distancia desde el punto de lanzamiento
    const distanceInPixels = this.launchPositionX - this.characterManager.getPenguinX();

    // Convertir a metros (escala arbitraria para el juego) y asegurar que sea positiva
    const distanceInMeters = Math.floor(distanceInPixels / 10);

    // Actualizar la distancia actual (solo si es positiva, para evitar distancias negativas si va a la derecha)
    this.gameState.currentDistance = Math.max(0, distanceInMeters);

    // Calcular la distancia total (la acumulada hasta ahora + la del lanzamiento actual)
    const totalDistance = this.gameState.totalDistance + this.gameState.currentDistance;

    // Actualizar el texto de distancia con la suma total
    if (Math.abs(parseInt(this.distanceText.text) - totalDistance) >= 1) {
      this.distanceText.setText(totalDistance + ' m');

      // Pequeña animación de escala al cambiar el número
      this.tweens.add({
        targets: this.distanceText,
        scaleX: { from: 1.2, to: 1 },
        scaleY: { from: 1.2, to: 1 },
        duration: 100,
        ease: 'Sine.easeOut'
      });
    }
  }

  /**
   * Finaliza el lanzamiento actual
   */
  endLaunch() {
    // Acumular la distancia actual al total
    this.gameState.totalDistance += this.gameState.currentDistance;

    // Animar actualización del total
    this.tweens.add({
      targets: this.distanceText,
      scaleX: { from: 1.3, to: 1 },
      scaleY: { from: 1.3, to: 1 },
      duration: 300,
      ease: 'Back.easeOut'
    });

    // Verificar si hemos alcanzado el número máximo de intentos
    if (this.gameState.launchAttempts >= this.gameState.maxLaunchAttempts) {
      this.endGame();
    } else {
      // Preparar para el siguiente lanzamiento
      this.showNextLaunchPrompt();
    }
  }

  /**
   * Muestra mensaje para el siguiente lanzamiento
   */
  showNextLaunchPrompt() {
    this.gameState.currentState = 'ENDED';

    // Mensaje para el siguiente lanzamiento
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const nextLaunchText = this.add.text(width / 2, 170, 'Haz clic para el siguiente lanzamiento', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0);

    // Animación
    this.tweens.add({
      targets: nextLaunchText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Mostrar mensaje de controles
    this.showControlsInfo();
  }

  /**
   * Finaliza el juego actual
   */
  endGame() {
    this.gameState.currentState = 'ENDED';

    // Marcar que hay un modal abierto
    this.isModalOpen = true;

    // Comprobar si hemos batido el récord
    const isNewRecord = this.gameState.totalDistance > this.gameState.bestTotalDistance;
    if (isNewRecord) {
      // Actualizar mejor distancia total
      this.gameState.bestTotalDistance = this.gameState.totalDistance;

      // Guardar en localStorage usando StorageManager
      StorageManager.saveBestDistance(this.gameState.bestTotalDistance);

      // Actualizar el texto de mejor distancia
      this.bestDistanceText.setText(this.gameState.bestTotalDistance + ' m');
    }

    // Definir los callbacks como funciones de flecha
    const handleRestart = () => {
      console.log("Game: Reiniciando juego desde endGame");
      this.isModalOpen = false;
      this.restartGame();
    };

    const handleMainMenu = () => {
      console.log("Game: Volviendo al menú principal desde endGame");
      this.isModalOpen = false;
      this.backToMenu();
    };

    // Mostrar la pantalla de fin de juego usando GameOverScreen
    this.gameOverScreen.show({
      totalDistance: this.gameState.totalDistance,
      bestDistance: this.gameState.bestTotalDistance,
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
    // La distancia total acumulada no se reinicia
    this.gameState.currentDistance = 0;

    // Eliminar todos los textos temporales
    this.children.list
      .filter(child => child.type === 'Text' &&
        (child.text === 'Haz clic para el siguiente lanzamiento' ||
          child.text.includes('¡Nuevo récord!') ||
          child.text.includes('Ángulo') ||  // Más genérico para incluir cualquier texto con "Ángulo"
          child.name === 'angleText'))      // Buscar por nombre también
        .forEach(text => {
          console.log("Eliminando texto en resetLaunch:", text.text);
          text.destroy();
        });

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
      this.startAngleSelection();

      // Restablecer el flag de reinicio para permitir futuros reinicios
      this.isResetting = false;
    });
  }
}
