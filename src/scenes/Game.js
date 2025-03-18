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
      currentDistance: 0,
      totalDistance: 0  // Nueva propiedad para acumular la distancia total
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

    // Texto para la distancia total acumulada
    this.totalDistanceText = this.add.text(16, 84, 'Total: 0m', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffff00',
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
    this.gameState.totalDistance = 0; // Reiniciar la distancia total al comenzar

    // Actualizar texto de distancia total
    this.totalDistanceText.setText('Total: 0m');

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
      const markStartX = originX + (radius - thickness/2) * Math.cos(markAngle);
      const markStartY = originY + (radius - thickness/2) * Math.sin(markAngle);
      const markEndX = originX + (radius + thickness/2) * Math.cos(markAngle);
      const markEndY = originY + (radius + thickness/2) * Math.sin(markAngle);

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
    const tangentAngle = currentRad + Math.PI/2; // 90 grados más que el radio
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

    // Configuración de la barra
    const barWidth = 30;
    const barHeight = 150;
    const barX = this.launchPositionX + 50;
    const barY = this.launchPositionY - barHeight/2;
    const padding = 4;

    // Dibujar el marco de la barra (fondo)
    this.powerBar.fillStyle(0x333333, 0.9);
    this.powerBar.fillRect(barX - padding, barY - padding, barWidth + padding*2, barHeight + padding*2);

    // Dibujar el fondo de la barra
    this.powerBar.fillStyle(0x666666, 1);
    this.powerBar.fillRect(barX, barY, barWidth, barHeight);

    // Gradiente de color para la barra (verde-amarillo-rojo)
    const colors = [0x00ff00, 0xffff00, 0xff0000]; // verde, amarillo, rojo
    const sections = colors.length;
    const sectionHeight = barHeight / sections;

    // Dibujar las secciones de colores
    for (let i = 0; i < sections; i++) {
      this.powerBar.fillStyle(colors[i], 1);
      this.powerBar.fillRect(
        barX,
        barY + barHeight - (i+1) * sectionHeight,
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
      barY + barHeight - fillHeight,
      barWidth,
      fillHeight
    );

    // Dibujar el indicador (línea horizontal que muestra la posición actual)
    const indicatorY = barY + barHeight - fillHeight;
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
      const markY = barY + barHeight - (i * barHeight / 10);
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

    this.powerText = this.add.text(barX + barWidth/2, barY - 20, `${Math.round(this.power * 100)}%`, {
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
    this.attemptsText.setText('Intentos: ' + this.gameState.launchAttempts + '/' + this.gameState.maxLaunchAttempts);

    // Hacer que el pingüino sea dinámico para que la física lo afecte
    this.penguin.setStatic(false);

    // Guardar la distancia anterior como referencia (ya no necesitamos reiniciar aquí)
    // No reiniciamos la distancia actual al lanzar, solo al resetear para el siguiente intento

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

    // Acumular la distancia actual al total
    this.gameState.totalDistance += this.gameState.currentDistance;

    // Actualizar el texto de distancia total
    this.totalDistanceText.setText('Total: ' + this.gameState.totalDistance + 'm');

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

    const bestDistanceText = this.add.text(width / 2, height / 2 - 30, `Mejor distancia: ${this.gameState.bestDistance}m`, {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0);

    const totalDistanceText = this.add.text(width / 2, height / 2 + 30, `Distancia total: ${this.gameState.totalDistance}m`, {
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
    resultsLayer.add([bg, gameOverText, bestDistanceText, totalDistanceText, menuButton, menuText]);
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

    // Reiniciamos la distancia actual para el nuevo intento
    this.gameState.currentDistance = 0;

    // Actualizamos el texto de distancia actual
    this.distanceText.setText('Distancia: 0m');

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
