/**
 * Escena Game - Escena principal donde ocurre la jugabilidad
 * Controla el flujo de juego, la física y las interacciones
 */

import Phaser from 'phaser';
import physicsConfig from '../config/physicsConfig';

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
      bestTotalDistance: this.loadBestDistance() // Mejor distancia de todas las partidas
    };

    // Ángulo y potencia
    this.angle = 45; // Ángulo inicial
    this.power = 0;  // Potencia inicial

    // Referencias a objetos del juego
    this.yeti = null;
    this.penguin = null;
    this.flamingo = null;
    this.ground = null;

    // Interfaz
    this.angleIndicator = null;
    this.powerBar = null;
    this.distanceText = null;
    this.attemptsText = null;
    this.totalDistanceText = null;

    // Punto de inicio del lanzamiento (ahora a la derecha)
    this.launchPositionX = 700;
    this.launchPositionY = 510;

    // Control de cámara
    this.isCameraFollowing = false;
    this.initialCameraX = 400; // Posición inicial X de la cámara
    this.cameraLeftBoundary = 200; // Límite izquierdo para activar seguimiento de cámara
  }

  create() {
    // Configurar el mundo físico con límites extendidos hacia la izquierda (valores negativos de X)
    this.matter.world.setBounds(-10000, 0, 20000, 600);
    // Reducir la gravedad para un vuelo más lento y mayor deslizamiento
    this.matter.world.setGravity(0, 0.3);

    // Crear el fondo
    this.createBackground();

    // Crear los personajes
    this.createCharacters();

    // Crear el suelo
    this.createGround();

    // Configurar la cámara
    this.configureCamera();

    // Crear la interfaz de usuario
    this.createUI();

    // Configurar la entrada de usuario
    this.setupInput();

    // Iniciar el juego
    this.startGame();
  }

  update() {
    // Actualizar la distancia si el pingüino está en el aire
    if (this.gameState.currentState === 'FLYING' && this.penguin && this.penguin.body) {
      this.updateDistance();

      // Gestionar el seguimiento de la cámara basado en la posición del pingüino
      this.updateCameraFollow();
    }
  }

  /**
   * Actualiza el seguimiento de la cámara basado en la posición del pingüino
   */
  updateCameraFollow() {
    // Solo seguir si el pingüino está en movimiento
    if (this.gameState.currentState === 'FLYING') {
      // Obtener el centro de la pantalla
      const centerX = this.initialScrollX + (this.cameras.main.width / 2);

      // Verificar si el pingüino ha sobrepasado el centro de la pantalla
      if (this.penguin.x < centerX) {
        // Calcular la posición de la cámara para mantener al pingüino centrado
        const targetScrollX = this.penguin.x - (this.cameras.main.width / 2);

        // Suavizar el movimiento de la cámara con interpolación lineal
        const smoothness = 0.08; // Factor de suavizado (valores más bajos = más suave)

        // Aplicar interpolación para un movimiento más suave
        const newScrollX = Phaser.Math.Linear(
          this.cameras.main.scrollX,
          targetScrollX,
          smoothness
        );

        // Asegurarnos de que la cámara no retroceda más allá de su posición inicial
        if (newScrollX <= this.initialScrollX) {
          this.cameras.main.scrollX = newScrollX;
        }
      }
    }
  }

  /**
   * Obtiene el borde izquierdo visible de la cámara
   */
  getCameraLeftEdge() {
    return this.cameras.main.scrollX;
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
   * Crea los personajes (Yeti y Pingüino)
   */
  createCharacters() {
    // Crear el Yeti (por ahora, es un placeholder estático)
    this.yeti = this.add.image(this.launchPositionX + 30, this.launchPositionY + 20, 'yeti');

    // Voltear el Yeti para que mire hacia la izquierda
    this.yeti.setFlipX(true);

    // Crear el flamingo (por ahora, es un placeholder estático)
    this.flamingo = this.add.image(this.launchPositionX, this.launchPositionY + 20, 'flamingo');

    // Voltear el flamingo para que apunte hacia la izquierda
    this.flamingo.setFlipX(true);

    // Crear el pingüino con física
    this.penguin = this.matter.add.image(this.launchPositionX, this.launchPositionY, 'penguin');

    // Voltear el pingüino para que su "frente" mire hacia la izquierda
    this.penguin.setFlipX(true);

    this.penguin.setBody({
      type: 'circle',
      radius: 10
    });

    // Configurar propiedades físicas del pingüino
    this.penguin.setFrictionAir(0.005); // Reducir aún más la fricción del aire para vuelo más lento
    this.penguin.setFriction(0.001);    // Fricción casi nula para máximo deslizamiento
    this.penguin.setBounce(0.7);        // Aumentar rebote para más deslizamiento
    this.penguin.setDensity(0.001);     // Reducir densidad para que sea más ligero

    // Inicialmente, el pingüino está estático
    this.penguin.setStatic(true);
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
   * Configura la cámara para seguir al pingüino
   */
  configureCamera() {
    // Configurar los límites de la cámara extendidos hacia la izquierda
    this.cameras.main.setBounds(-10000, 0, 20000, 600);

    // Inicialmente, la cámara se enfoca en la posición de inicio
    this.cameras.main.centerOn(this.initialCameraX, 300);

    // Guardar la posición inicial de la cámara para el seguimiento personalizado
    this.initialScrollX = this.cameras.main.scrollX;
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
    const gameTitle = this.add.text(titlePosX, 15, "PINGU GO!", {
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

    // Indicador de ángulo (flecha)
    this.angleIndicator = this.add.graphics().setScrollFactor(0);
    this.angleIndicator.setVisible(false);

    // Barra de potencia
    this.powerBar = this.add.graphics().setScrollFactor(0);
    this.powerBar.setVisible(false);
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
    this.cameras.main.fade(500, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Detener las físicas para evitar problemas
      this.matter.world.pause();

      // Volver a la escena del menú
      this.scene.start('Menu');
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
    if (this.penguin && this.penguin.body) {
      this.penguin.setVelocity(0, 0);
      this.penguin.setAngularVelocity(0);
    }

    // Retrasar 200 ms el flash:
    setTimeout(() => {
      // Efecto de transición con flash blanco (más corto)
      this.cameras.main.flash(200, 255, 255, 255);

      // Restablecer la posición de la cámara inmediatamente
      this.cameras.main.scrollX = this.initialScrollX;

      // Reiniciar todos los valores del juego
      this.gameState.currentState = 'READY';
      this.gameState.launchAttempts = 0;
      this.gameState.currentDistance = 0;
      this.gameState.totalDistance = 0;

      // Actualizar textos de distancia
      this.distanceText.setText('0 m');

      // Actualizar la UI de intentos
      this.updateAttemptsUI();

      // Eliminar textos existentes de fin de juego o instrucciones
      this.children.list
        .filter(child => child.type === 'Text' &&
          (child.text.includes('JUEGO TERMINADO') ||
            child.text.includes('Distancia total') ||
            child.text.includes('Haz clic para') ||
            child.text.includes('NUEVO RÉCORD')))
          .forEach(text => text.destroy());

      // Reiniciar posición del pingüino
      this.penguin.setPosition(this.launchPositionX, this.launchPositionY);
      this.penguin.setAngle(0);
      this.penguin.setStatic(true);

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

    // Mostrar el indicador de ángulo
    this.angleIndicator.setVisible(true);

    // Animación para mover el indicador de ángulo
    this.angleAnimation = this.tweens.addCounter({
      from: physicsConfig.angle.min,
      to: physicsConfig.angle.max,
      duration: 600,
      ease: 'Linear',
      repeat: -1,
      yoyo: true,
      onUpdate: () => {
        // Actualizar el ángulo
        this.angle = this.angleAnimation.getValue();

        // Actualizar el gráfico
        this.updateAngleIndicator();
      }
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
    // Detener la animación del ángulo
    if (this.angleAnimation) {
      this.angleAnimation.stop();
    }

    // Eliminar el texto de instrucción
    this.children.list
      .filter(child => child.name === 'angleInstructionText')
      .forEach(text => text.destroy());

    // Limpiar el texto del ángulo si existe
    if (this.angleText) {
      this.angleText.destroy();
    }

    // Guardar el ángulo seleccionado
    this.selectedAngle = this.angle;
  }

  /**
   * Inicia la selección de potencia
   */
  startPowerSelection() {
    this.gameState.currentState = 'POWER_SELECTION';

    // Ocultar el indicador de ángulo y mostrar la barra de potencia
    this.angleIndicator.setVisible(false);
    this.powerBar.setVisible(true);

    // Animación para la barra de potencia
    this.powerAnimation = this.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 1500,
      ease: 'Linear',
      repeat: -1,
      yoyo: true,
      onUpdate: () => {
        // Actualizar la potencia
        this.power = this.powerAnimation.getValue() / 100;

        // Actualizar el gráfico
        this.updatePowerBar();
      }
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
    // Detener la animación de potencia
    if (this.powerAnimation) {
      this.powerAnimation.stop();
    }

    // Eliminar el texto de instrucción
    this.children.list
      .filter(child => child.name === 'powerInstructionText')
      .forEach(text => text.destroy());

    // Ocultar la barra de potencia
    this.powerBar.setVisible(false);

    // Limpiar textos de porcentaje si existen
    if (this.percentageTexts && this.percentageTexts.length > 0) {
      this.percentageTexts.forEach(text => text.destroy());
      this.percentageTexts = [];
    }

    // Eliminar el texto de potencia si existe
    if (this.powerText) {
      this.powerText.destroy();
    }

    // Guardar la potencia seleccionada
    this.selectedPower = this.power;
  }

  /**
   * Actualiza el indicador visual del ángulo
   */
  updateAngleIndicator() {
    // Limpiar el gráfico
    this.angleIndicator.clear();

    // Origen (posición del lanzamiento)
    const originX = this.launchPositionX;
    const originY = this.launchPositionY;

    // Configuración del arco
    const radius = 80;
    const thickness = 10;
    const startAngle = 180; // Ángulo izquierdo (en grados)
    const endAngle = 270;   // Ángulo superior (en grados)

    // Para la dirección izquierda, la flecha debe apuntar entre 180° (izquierda) y 270° (arriba)
    // Convertir el ángulo actual (0-90) al rango necesario (180-270)
    const mappedAngle = 180 + this.angle;

    // Convertir los ángulos a radianes para dibujar el arco
    const startRad = Phaser.Math.DegToRad(startAngle);
    const endRad = Phaser.Math.DegToRad(endAngle);
    const currentRad = Phaser.Math.DegToRad(mappedAngle);

    // Dibujar el arco de fondo
    this.angleIndicator.lineStyle(thickness, 0x444444, 0.8);
    this.angleIndicator.beginPath();
    this.angleIndicator.arc(originX, originY, radius, startRad, endRad, false);
    this.angleIndicator.strokePath();

    // Dibujar el arco de progreso (desde el inicio hasta el ángulo actual)
    this.angleIndicator.lineStyle(thickness, 0xffaa00, 1);
    this.angleIndicator.beginPath();
    this.angleIndicator.arc(originX, originY, radius, startRad, currentRad, false);
    this.angleIndicator.strokePath();

    // Dibujar marcas de grados en el arco
    this.angleIndicator.lineStyle(2, 0xffffff, 0.7);
    for (let angle = 0; angle <= 90; angle += 15) {
      const markAngle = Phaser.Math.DegToRad(180 + angle);
      const markStartX = originX + (radius - thickness / 2) * Math.cos(markAngle);
      const markStartY = originY + (radius - thickness / 2) * Math.sin(markAngle);
      const markEndX = originX + (radius + thickness / 2) * Math.cos(markAngle);
      const markEndY = originY + (radius + thickness / 2) * Math.sin(markAngle);

      this.angleIndicator.beginPath();
      this.angleIndicator.moveTo(markStartX, markStartY);
      this.angleIndicator.lineTo(markEndX, markEndY);
      this.angleIndicator.strokePath();
    }

    // Calcular la posición de la flecha (en el extremo del arco actual)
    const arrowX = originX + radius * Math.cos(currentRad);
    const arrowY = originY + radius * Math.sin(currentRad);

    // Dibujar la flecha
    this.angleIndicator.fillStyle(0xffff00, 1);
    this.angleIndicator.beginPath();

    // Calcular la dirección tangente al arco en el punto actual
    const tangentAngle = currentRad + Math.PI / 2; // 90 grados más que el radio
    const arrowSize = 15;

    // Puntos de la flecha
    const point1X = arrowX + arrowSize * Math.cos(tangentAngle);
    const point1Y = arrowY + arrowSize * Math.sin(tangentAngle);

    const point2X = arrowX + arrowSize * Math.cos(currentRad - Math.PI);
    const point2Y = arrowY + arrowSize * Math.sin(currentRad - Math.PI);

    const point3X = arrowX + arrowSize * Math.cos(tangentAngle - Math.PI);
    const point3Y = arrowY + arrowSize * Math.sin(tangentAngle - Math.PI);

    // Dibujar el triángulo de la flecha
    this.angleIndicator.moveTo(point1X, point1Y);
    this.angleIndicator.lineTo(point2X, point2Y);
    this.angleIndicator.lineTo(point3X, point3Y);
    this.angleIndicator.closePath();
    this.angleIndicator.fillPath();

    // Dibujar un punto en el centro del arco
    this.angleIndicator.fillStyle(0xffffff, 1);
    this.angleIndicator.fillCircle(originX, originY, 5);

    // Texto con el ángulo actual
    if (this.angleText) {
      this.angleText.destroy();
    }

    this.angleText = this.add.text(originX, originY - radius - 30, `Ángulo: ${Math.round(this.angle)}°`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0);
  }

  /**
   * Actualiza la barra visual de potencia
   */
  updatePowerBar() {
    // Limpiar el gráfico
    this.powerBar.clear();

    // Tamaño del canvas
    const width = this.scale.width;

    // Configuración de la barra
    const barWidth = 15;
    const barHeight = 150;
    const barX = width - 35; // Colocado al borde derecho de la pantalla
    const barY = this.launchPositionY - 40; // Centrado verticalmente en la pantalla
    const padding = 4;

    // Dibujar el marco de la barra (fondo)
    this.powerBar.fillStyle(0x333333, 0.9);
    this.powerBar.fillRect(barX - padding, barY - barHeight / 2 - padding, barWidth + padding * 2, barHeight + padding * 2);

    // Dibujar el fondo de la barra
    this.powerBar.fillStyle(0x666666, 1);
    this.powerBar.fillRect(barX, barY - barHeight / 2, barWidth, barHeight);

    // Gradiente de color para la barra (verde-amarillo-rojo)
    const colors = [0x00ff00, 0xffff00, 0xff0000]; // verde, amarillo, rojo
    const sections = colors.length;
    const sectionHeight = barHeight / sections;

    // Dibujar las secciones de colores
    for (let i = 0; i < sections; i++) {
      this.powerBar.fillStyle(colors[i], 1);
      this.powerBar.fillRect(
        barX,
        barY - barHeight / 2 + (i * sectionHeight),
        barWidth,
        sectionHeight
      );
    }

    // Posición actual del indicador (con efecto de fill de abajo hacia arriba)
    const fillHeight = barHeight * this.power;

    // Rellenar la barra desde abajo hasta el nivel actual
    this.powerBar.fillStyle(0xaaaaaa, 0.3);
    this.powerBar.fillRect(
      barX,
      barY + barHeight / 2 - fillHeight,
      barWidth,
      fillHeight
    );

    // Dibujar el indicador (línea horizontal que muestra la posición actual)
    const indicatorY = barY + barHeight / 2 - fillHeight;
    this.powerBar.fillStyle(0xffffff, 1);
    this.powerBar.fillRect(
      barX - 10,
      indicatorY - 2,
      barWidth + 20,
      4
    );

    // Dibujar triángulos a los lados del indicador
    this.powerBar.fillStyle(0xffffff, 1);

    // Triángulo izquierdo
    this.powerBar.beginPath();
    this.powerBar.moveTo(barX - 15, indicatorY);
    this.powerBar.lineTo(barX - 5, indicatorY - 6);
    this.powerBar.lineTo(barX - 5, indicatorY + 6);
    this.powerBar.closePath();
    this.powerBar.fillPath();

    // Triángulo derecho
    this.powerBar.beginPath();
    this.powerBar.moveTo(barX + barWidth + 15, indicatorY);
    this.powerBar.lineTo(barX + barWidth + 5, indicatorY - 6);
    this.powerBar.lineTo(barX + barWidth + 5, indicatorY + 6);
    this.powerBar.closePath();
    this.powerBar.fillPath();

    // Añadir marcas de nivel en la barra
    this.powerBar.lineStyle(2, 0xffffff, 0.5);
    for (let i = 0; i <= 10; i++) {
      const markY = barY + barHeight / 2 - (i * barHeight / 10);
      const markWidth = (i % 5 === 0) ? 10 : 5; // Marcas más largas cada 50%

      this.powerBar.beginPath();
      this.powerBar.moveTo(barX - markWidth, markY);
      this.powerBar.lineTo(barX, markY);
      this.powerBar.strokePath();

      this.powerBar.beginPath();
      this.powerBar.moveTo(barX + barWidth, markY);
      this.powerBar.lineTo(barX + barWidth + markWidth, markY);
      this.powerBar.strokePath();

      // Añadir porcentajes para las marcas principales
      if (i % 5 === 0) {
        this.powerBar.fillStyle(0xffffff, 1);
        const percentText = i * 10 + '%';
        const textX = barX + barWidth + 15;
        const textY = markY;

        // Añadir texto directamente aquí en lugar de usar Text
        this.powerBar.fillStyle(0xffffff, 1);
        const percentageText = this.add.text(textX, textY, percentText, {
          fontFamily: 'Arial',
          fontSize: '12px',
          color: '#ffffff'
        }).setOrigin(0, 0.5).setScrollFactor(0);

        // Almacenar la referencia para poder eliminarla después
        if (!this.percentageTexts) {
          this.percentageTexts = [];
        }
        this.percentageTexts.push(percentageText);
      }
    }

    // Texto con el porcentaje
    if (this.powerText) {
      this.powerText.destroy();
    }

    if (this.percentageTexts && this.percentageTexts.length > 0) {
      // Eliminar todos los textos de porcentaje anteriores
      this.percentageTexts.forEach(text => text.destroy());
      this.percentageTexts = [];
    }

    this.powerText = this.add.text(barX + barWidth / 2, barY - barHeight / 2 - 20, `${Math.round(this.power * 100)}%`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0);
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

    // Hacer que el pingüino sea dinámico para que la física lo afecte
    this.penguin.setStatic(false);

    // Calcular el vector de velocidad basado en ángulo y potencia
    // Para lanzar hacia la izquierda, invertimos el ángulo
    const invertedAngle = 180 - this.selectedAngle;
    const angleRad = Phaser.Math.DegToRad(invertedAngle);

    // Aumentamos el rango de potencia para golpeos más fuertes
    const minPower = 5;
    const maxPower = 15;
    const powerNormalized = minPower + this.selectedPower * (maxPower - minPower);

    // Reducir el multiplicador para vuelo más lento pero manteniendo alcance
    const powerMultiplier = 0.8;
    const powerMultiplied = powerNormalized * powerMultiplier;

    // Aplicamos velocidades más bajas para vuelo más lento
    const velocityX = powerMultiplied * Math.cos(angleRad);
    const velocityY = -powerMultiplied * Math.sin(angleRad); // Negativo porque en pantalla Y+ es hacia abajo

    // Aplicar la velocidad al pingüino
    this.penguin.setVelocity(velocityX, velocityY);

    // Cambiar inmediatamente al estado FLYING sin esperar a la animación
    this.gameState.currentState = 'FLYING';

    // Reiniciar distancia actual inmediatamente
    this.gameState.currentDistance = 0;

    // Comenzar a registrar la última posición X del pingüino
    this.lastPenguinX = this.penguin.x;
    this.penguinStoppedFrames = 0;

    // Animar el golpe (versión simple) - ahora la animación ocurre en paralelo
    this.tweens.add({
      targets: this.flamingo,
      angle: -100, // Ángulo más pronunciado para dar sensación de mayor golpe
      duration: 200,
      yoyo: true
    });
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
        this.attemptIcons[i].setAlpha(1); // Más transparente
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
   * Actualiza la distancia recorrida por el pingüino y comprueba si se ha detenido
   */
  updateDistance() {
    // Calcular la distancia desde el punto de lanzamiento
    const distanceInPixels = this.launchPositionX - this.penguin.x;

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

    // Añadimos rotación para simular deslizamiento sobre hielo
    if (this.penguin.body.velocity.x < -1 && this.penguin.y > 550) {
      // Solo añadir rotación si está en movimiento horizontal y cerca del suelo
      this.penguin.setAngularVelocity(-0.02);
    }

    // Comprobar si el pingüino se ha detenido - valores extremadamente bajos
    if (Math.abs(this.penguin.x - this.lastPenguinX) < 0.1 &&
      Math.abs(this.penguin.body.velocity.x) < 0.02 &&
      Math.abs(this.penguin.body.velocity.y) < 0.02) {
      this.penguinStoppedFrames++;

      // Aumentar mucho el tiempo para considerar detenido
      if (this.penguinStoppedFrames > 120) { // 2 segundos a 60 FPS
        this.endLaunch();
      }
    } else {
      // Si se mueve, reiniciar el contador
      this.penguinStoppedFrames = 0;
      this.lastPenguinX = this.penguin.x;
    }
  }

  /**
   * Finaliza el lanzamiento actual
   */
  endLaunch() {
    // Acumular la distancia actual al total
    this.gameState.totalDistance += this.gameState.currentDistance;

    // No necesitamos actualizar el texto aquí, ya lo estamos actualizando en tiempo real en updateDistance()

    // Animar actualización del total (opcional, para dar feedback visual)
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

    // Comprobar si hemos batido el récord
    if (this.gameState.totalDistance > this.gameState.bestTotalDistance) {
      // Actualizar mejor distancia total
      this.gameState.bestTotalDistance = this.gameState.totalDistance;

      // Guardar en localStorage
      this.saveBestDistance(this.gameState.bestTotalDistance);

      // Actualizar el texto de mejor distancia
      this.bestDistanceText.setText(this.gameState.bestTotalDistance + ' m');

      // Mostrar mensaje de nueva mejor distancia
      this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, '¡NUEVO RÉCORD!', {
        fontFamily: 'Impact',
        fontSize: '36px',
        color: '#ffdd00',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);
    }

    // Mostrar resultados y mensaje de fin
    this.add.text(this.scale.width / 2, this.scale.height / 2 - 50, 'JUEGO TERMINADO', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(this.scale.width / 2, this.scale.height / 2, 'Distancia total: ' + this.gameState.totalDistance + 'm', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(this.scale.width / 2, this.scale.height / 2 + 40, 'Haz clic para volver al menú', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
  }

  /**
   * Reinicia la posición para un nuevo lanzamiento
   */
  resetLaunch() {
    // Restablecer la posición de la cámara con una animación
    this.tweens.add({
      targets: this.cameras.main,
      scrollX: this.initialScrollX,
      duration: 800,
      ease: 'Power2'
    });

    // Colocar el yeti y el pingüino fuera de la vista inicialmente (por debajo de la pantalla)
    this.yeti.setPosition(this.launchPositionX + 30, this.launchPositionY + 200);
    this.flamingo.setPosition(this.launchPositionX, this.launchPositionY + 200);
    this.penguin.setPosition(this.launchPositionX, this.launchPositionY + 200);

    // Restablecer propiedades del pingüino
    this.penguin.setVelocity(0, 0);
    this.penguin.setAngularVelocity(0);
    this.penguin.setAngle(0);
    this.penguin.setStatic(true);

    // Reiniciamos solo la distancia actual para el nuevo intento
    // La distancia total acumulada no se reinicia
    this.gameState.currentDistance = 0;

    // Eliminar todos los textos temporales
    this.children.list
      .filter(child => child.type === 'Text' &&
        (child.text === 'Haz clic para el siguiente lanzamiento' ||
          child.text.includes('¡Nuevo récord!')))
      .forEach(text => text.destroy());

    // Añadir mensaje "Preparando el lanzamiento..."
    const width = this.cameras.main.width;
    const preparingText = this.add.text(width / 2, 170, 'Preparando el lanzamiento...', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setName('preparingText');

    // Animar la entrada del yeti y el pingüino desde abajo
    this.tweens.add({
      targets: [this.yeti, this.flamingo, this.penguin],
      y: { from: this.launchPositionY + 200, to: this.launchPositionY + 20 },
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Ajustar la posición final exacta del pingüino
        this.penguin.setPosition(this.launchPositionX, this.launchPositionY);

        // Eliminar texto "Preparando el lanzamiento..."
        preparingText.destroy();

        // Añadir un pequeño efecto de rebote al yeti y al flamingo
        this.tweens.add({
          targets: [this.yeti, this.flamingo],
          y: '-=10',
          duration: 150,
          yoyo: true,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            // Iniciar la selección de ángulo solo después de que los personajes hayan entrado
            this.startAngleSelection();
          }
        });
      }
    });
  }

  /**
   * Crea el estado del juego
   */
  createGameState() {
    this.gameState = {
      currentState: 'READY', // READY, ANGLE_SELECTION, POWER_SELECTION, LAUNCHING, FLYING, ENDED
      launchAttempts: 0,
      maxLaunchAttempts: 5,
      currentDistance: 0, // Distancia del lanzamiento actual
      totalDistance: 0,   // Distancia acumulada total de esta partida
      bestTotalDistance: this.loadBestDistance() // Mejor distancia de todas las partidas
    };
  }

  /**
   * Carga la mejor distancia desde localStorage
   */
  loadBestDistance() {
    const stored = localStorage.getItem('pinguGo_bestDistance');
    return stored ? parseInt(stored, 10) : 0;
  }

  /**
   * Guarda la mejor distancia en localStorage
   */
  saveBestDistance(distance) {
    localStorage.setItem('pinguGo_bestDistance', distance.toString());
  }
}
