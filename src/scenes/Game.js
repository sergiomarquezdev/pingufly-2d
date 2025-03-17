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
      bestDistance: 0,
      currentDistance: 0
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

    // Punto de inicio del lanzamiento (ahora a la derecha)
    this.launchPositionX = 650;
    this.launchPositionY = 480;

    // Control de cámara
    this.isCameraFollowing = false;
    this.initialCameraX = 400; // Posición inicial X de la cámara
    this.cameraLeftBoundary = 200; // Límite izquierdo para activar seguimiento de cámara
  }

  create() {
    // Configurar el mundo físico con límites extendidos hacia la izquierda (valores negativos de X)
    this.matter.world.setBounds(-10000, 0, 20000, 600);
    this.matter.world.setGravity(physicsConfig.world.gravity.x, physicsConfig.world.gravity.y);

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
      // Si el pingüino se mueve hacia la izquierda más allá del límite visible
      if (this.penguin.x < this.getCameraLeftEdge() + this.cameraLeftBoundary) {
        // Hacer que la cámara siga al pingüino manteniendo una distancia constante
        // desde el borde izquierdo de la pantalla
        this.cameras.main.scrollX = this.penguin.x - this.cameraLeftBoundary;

        // Asegurarnos de que la cámara no retroceda si el pingüino rebota hacia la derecha
        if (this.cameras.main.scrollX > this.initialScrollX) {
          this.cameras.main.scrollX = this.initialScrollX;
        }

        // Eliminar la limitación que impedía ir más allá de x=0
        // Ahora la cámara puede seguir al pingüino hasta el límite extendido
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
    this.yeti = this.add.image(this.launchPositionX + 50, this.launchPositionY + 20, 'yeti');

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
    this.penguin.setFrictionAir(physicsConfig.penguin.frictionAir);
    this.penguin.setFriction(physicsConfig.penguin.friction);
    this.penguin.setBounce(physicsConfig.penguin.restitution);
    this.penguin.setDensity(physicsConfig.penguin.density);

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

    // Propiedades del suelo
    this.ground.setFriction(physicsConfig.collision.ground.friction);
    this.ground.setFrictionStatic(physicsConfig.collision.ground.friction);
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
    // Textos para intentos y distancia
    this.attemptsText = this.add.text(16, 16, 'Intentos: 0/' + this.gameState.maxLaunchAttempts, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setScrollFactor(0);

    this.distanceText = this.add.text(16, 50, 'Distancia: 0m', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setScrollFactor(0);

    // Indicador de ángulo (flecha)
    this.angleIndicator = this.add.graphics().setScrollFactor(0);
    this.angleIndicator.setVisible(false);

    // Barra de potencia
    this.powerBar = this.add.graphics().setScrollFactor(0);
    this.powerBar.setVisible(false);
  }

  /**
   * Configura la entrada de usuario (clics/toques)
   */
  setupInput() {
    this.input.on('pointerdown', this.handlePlayerInput, this);
  }

  /**
   * Inicia el juego
   */
  startGame() {
    this.gameState.currentState = 'READY';
    this.gameState.launchAttempts = 0;
    this.gameState.bestDistance = 0;

    // Mostrar mensaje de inicio
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const startPrompt = this.add.text(width / 2, height / 2, 'Haz clic para comenzar', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0);

    // Animar el texto
    this.tweens.add({
      targets: startPrompt,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Establecer flag para saber que estamos esperando el primer clic
    this.waitingForFirstClick = true;
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
        // Si el juego ha terminado, volver al menú
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
      duration: 2000,
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

    // Guardar la potencia seleccionada
    this.selectedPower = this.power;
  }

  /**
   * Actualiza el indicador visual del ángulo
   */
  updateAngleIndicator() {
    // Limpiar el gráfico
    this.angleIndicator.clear();

    // Dibujar la flecha indicadora con el ángulo actual
    this.angleIndicator.lineStyle(4, 0xffff00, 1);

    // Origen (posición del pingüino)
    const originX = this.launchPositionX;
    const originY = this.launchPositionY;

    // Para la dirección izquierda, necesitamos invertir el ángulo (180 + ángulo)
    // Para que la flecha apunte hacia la izquierda en vez de la derecha
    const invertedAngle = 180 - this.angle;

    // Convertir de grados a radianes
    const angleRad = Phaser.Math.DegToRad(invertedAngle);

    // Calcular el punto final
    const length = 50;
    const endX = originX + length * Math.cos(angleRad);
    const endY = originY - length * Math.sin(angleRad);

    // Dibujar la línea
    this.angleIndicator.moveTo(originX, originY);
    this.angleIndicator.lineTo(endX, endY);

    // Dibujar texto con el ángulo
    if (this.angleText) {
      this.angleText.destroy();
    }

    this.angleText = this.add.text(originX - 50, originY - 40, `Ángulo: ${Math.round(this.angle)}°`, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setScrollFactor(0);
  }

  /**
   * Actualiza la barra visual de potencia
   */
  updatePowerBar() {
    // Limpiar el gráfico
    this.powerBar.clear();

    // Dibujar fondo de la barra
    this.powerBar.fillStyle(0x666666, 1);
    this.powerBar.fillRect(550, 450, 200, 30);

    // Dibujar barra de progreso
    this.powerBar.fillStyle(0xff0000, 1);
    this.powerBar.fillRect(550, 450, 200 * this.power, 30);

    // Texto con el porcentaje
    if (this.powerText) {
      this.powerText.destroy();
    }

    this.powerText = this.add.text(650, 465, `Potencia: ${Math.round(this.power * 100)}%`, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0);
  }

  /**
   * Lanza al pingüino con el ángulo y potencia seleccionados
   */
  launchPenguin() {
    this.gameState.currentState = 'LAUNCHING';

    // Incrementar contador de intentos
    this.gameState.launchAttempts++;
    this.attemptsText.setText('Intentos: ' + this.gameState.launchAttempts + '/' + this.gameState.maxLaunchAttempts);

    // Hacer que el pingüino sea dinámico para que la física lo afecte
    this.penguin.setStatic(false);

    // Calcular el vector de velocidad basado en ángulo y potencia
    // Para lanzar hacia la izquierda, invertimos el ángulo
    const invertedAngle = 180 - this.selectedAngle;
    const angleRad = Phaser.Math.DegToRad(invertedAngle);

    const powerNormalized = physicsConfig.hitForce.min + this.selectedPower * (physicsConfig.hitForce.max - physicsConfig.hitForce.min);
    const powerMultiplied = powerNormalized * physicsConfig.hitForce.multiplier;

    const velocityX = powerMultiplied * Math.cos(angleRad);
    const velocityY = -powerMultiplied * Math.sin(angleRad); // Negativo porque en pantalla Y+ es hacia abajo

    // Aplicar la velocidad al pingüino
    this.penguin.setVelocity(velocityX, velocityY);

    // Animar el golpe (versión simple)
    this.tweens.add({
      targets: this.flamingo,
      angle: -90, // Ángulo negativo para girar hacia la izquierda
      duration: 200,
      yoyo: true,
      onComplete: () => {
        // Cambiar estado
        this.gameState.currentState = 'FLYING';

        // Reiniciar distancia actual
        this.gameState.currentDistance = 0;

        // Comenzar a registrar la última posición X del pingüino
        this.lastPenguinX = this.penguin.x;
        this.penguinStoppedFrames = 0;
      }
    });
  }

  /**
   * Actualiza la distancia recorrida por el pingüino y comprueba si se ha detenido
   */
  updateDistance() {
    // Calcular la distancia desde el punto de lanzamiento
    // Ahora hacia la izquierda, así que es negativa (distancia = punto inicial - punto actual)
    const distanceInPixels = this.launchPositionX - this.penguin.x;

    // Convertir a metros (escala arbitraria para el juego) y asegurar que sea positiva
    const distanceInMeters = Math.floor(distanceInPixels / 10);

    // Actualizar la distancia actual (solo si es positiva, para evitar distancias negativas si va a la derecha)
    this.gameState.currentDistance = Math.max(0, distanceInMeters);

    // Actualizar el texto de distancia
    this.distanceText.setText('Distancia: ' + this.gameState.currentDistance + 'm');

    // Comprobar si el pingüino se ha detenido
    // Comparamos la posición actual con la última posición registrada
    if (Math.abs(this.penguin.x - this.lastPenguinX) < 0.5 &&
        Math.abs(this.penguin.body.velocity.x) < 0.2 &&
        Math.abs(this.penguin.body.velocity.y) < 0.2) {
      this.penguinStoppedFrames++;

      // Si ha estado detenido durante varios frames, considerar que ha parado
      if (this.penguinStoppedFrames > 60) { // aproximadamente 1 segundo a 60 FPS
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
    // Actualizar mejor distancia si corresponde
    if (this.gameState.currentDistance > this.gameState.bestDistance) {
      this.gameState.bestDistance = this.gameState.currentDistance;

      // Mostrar celebración
      this.showCelebration();
    }

    // Verificar si hemos alcanzado el número máximo de intentos
    if (this.gameState.launchAttempts >= this.gameState.maxLaunchAttempts) {
      this.endGame();
    } else {
      // Preparar para el siguiente lanzamiento
      this.showNextLaunchPrompt();
    }
  }

  /**
   * Muestra celebración por nuevo récord
   */
  showCelebration() {
    // Texto de felicitación
    const celebrationText = this.add.text(this.penguin.x, this.penguin.y - 50, '¡Nuevo récord!', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Animación
    this.tweens.add({
      targets: celebrationText,
      y: celebrationText.y - 100,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        celebrationText.destroy();
      }
    });
  }

  /**
   * Muestra mensaje para el siguiente lanzamiento
   */
  showNextLaunchPrompt() {
    this.gameState.currentState = 'ENDED';

    // Mensaje para el siguiente lanzamiento
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const nextLaunchText = this.add.text(width / 2, height / 2, 'Haz clic para el siguiente lanzamiento', {
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
  }

  /**
   * Finaliza el juego después del número máximo de intentos
   */
  endGame() {
    this.gameState.currentState = 'ENDED';

    // Mensaje de fin de juego
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Crear una capa para los resultados
    const resultsLayer = this.add.container(0, 0).setScrollFactor(0);

    // Fondo semi-transparente
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
      .setScrollFactor(0);

    // Textos de resultados
    const gameOverText = this.add.text(width / 2, height / 3, 'JUEGO TERMINADO', {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0);

    const bestDistanceText = this.add.text(width / 2, height / 2, `Mejor distancia: ${this.gameState.bestDistance}m`, {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0);

    // Botón para volver al menú
    const menuButton = this.add.image(width / 2, height * 2/3, 'button').setScale(2).setScrollFactor(0);
    const menuText = this.add.text(width / 2, height * 2/3, 'MENÚ PRINCIPAL', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0);

    // Hacer interactivo el botón
    menuButton.setInteractive();
    menuButton.on('pointerover', () => {
      menuButton.setTint(0xaaaaff);
    });
    menuButton.on('pointerout', () => {
      menuButton.clearTint();
    });
    menuButton.on('pointerdown', () => {
      // Volver al menú principal
      this.scene.start('Menu');
    });

    // Añadir todo a la capa
    resultsLayer.add([bg, gameOverText, bestDistanceText, menuButton, menuText]);
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

    // Restablecer la posición del pingüino
    this.penguin.setPosition(this.launchPositionX, this.launchPositionY);
    this.penguin.setVelocity(0, 0);
    this.penguin.setAngularVelocity(0);
    this.penguin.setAngle(0);
    this.penguin.setStatic(true);

    // Eliminar todos los textos temporales
    this.children.list
      .filter(child => child.type === 'Text' &&
              (child.text === 'Haz clic para el siguiente lanzamiento' ||
               child.text.includes('¡Nuevo récord!')))
      .forEach(text => text.destroy());

    // Iniciar la selección de ángulo para el nuevo lanzamiento
    this.startAngleSelection();
  }
}
