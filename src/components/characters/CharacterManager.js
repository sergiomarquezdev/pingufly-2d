import Phaser from 'phaser';

/**
 * Clase que maneja los personajes del juego
 */
export default class CharacterManager {
  /**
   * Constructor de la clase CharacterManager
   * @param {Phaser.Scene} scene - La escena a la que pertenecen los personajes
   * @param {Object} config - Configuración de los personajes
   */
  constructor(scene, config = {}) {
    this.scene = scene;

    // Propiedades de configuración con valores por defecto
    this.config = {
      launchPositionX: config.launchPositionX || 710,
      launchPositionY: config.launchPositionY || 540,
      penguinPhysicsConfig: config.penguinPhysicsConfig || {
        frictionAir: 0.005,  // Ajustado: Aumentado ligeramente para un vuelo más controlado
        friction: 0.0005,     // Ajustado: Aumentado ligeramente para mejor control en hielo
        bounce: 0.7,        // Ajustado: Reducido ligeramente para vuelos más predecibles
        density: 0.001       // Ajustado: Incrementado para que no vuele demasiado lejos
      }
    };

    // Definimos offsets relativos para cada personaje (respecto a la posición de lanzamiento)
    // Esto permitirá mantener las posiciones relativas cuando cambie la posición de lanzamiento
    this.offsets = {
      yeti: {
        x: 20,       // Offset X respecto a launchPositionX
        y: -10       // Offset Y respecto a launchPositionY
      },
      flamingo: {
        x: 8,        // Offset X respecto a launchPositionX
        y: 0         // Offset Y respecto a launchPositionY
      },
      // El pingüino estará en la posición de lanzamiento exacta
      penguin: {
        x: 0,
        y: 0
      }
    };

    // Referencias a objetos del juego
    this.yeti = null;
    this.penguin = null;
    this.flamingo = null;

    // Estado de movimiento del pingüino
    this.lastPenguinX = 0;
    this.penguinStoppedFrames = 0;

    // Control de deslizamiento en hielo
    this.isOnIce = false;
    this.lastGroundContact = 0;

    // Agregar un estado para el tracking del movimiento máximo
    this.maxDistanceReached = false;
    this.maxDistance = 0;
  }

  /**
   * Obtiene la posición X del Yeti
   */
  getYetiX() {
    return this.config.launchPositionX + this.offsets.yeti.x;
  }

  /**
   * Obtiene la posición Y del Yeti
   */
  getYetiY() {
    return this.config.launchPositionY + this.offsets.yeti.y;
  }

  /**
   * Obtiene la posición X del flamenco
   */
  getFlamingoX() {
    return this.config.launchPositionX + this.offsets.flamingo.x;
  }

  /**
   * Obtiene la posición Y del flamenco
   */
  getFlamingoY() {
    return this.config.launchPositionY + this.offsets.flamingo.y;
  }

  /**
   * Obtiene la posición X del pingüino
   */
  getPenguinX() {
    return this.config.launchPositionX + this.offsets.penguin.x;
  }

  /**
   * Obtiene la posición Y del pingüino
   */
  getPenguinY() {
    return this.config.launchPositionY + this.offsets.penguin.y;
  }

  /**
   * Crea los personajes del juego
   */
  createCharacters() {
    // Crear el Yeti
    this.yeti = this.scene.add.image(
      this.getYetiX(),
      this.getYetiY(),
      'yeti'
    );

    // Voltear el Yeti para que mire hacia la izquierda
    this.yeti.setFlipX(true);

    // Crear el flamingo - Reposicionado cerca de la mano del Yeti
    this.flamingo = this.scene.add.image(
      this.getFlamingoX(),
      this.getFlamingoY(),
      'flamingo'
    );

    // Voltear el flamingo para que apunte hacia la izquierda
    this.flamingo.setFlipX(true);
    // Rotar ligeramente para posición de inicio
    this.flamingo.setAngle(20);

    // Crear el pingüino con física
    this.penguin = this.scene.matter.add.image(
      this.getPenguinX(),
      this.getPenguinY(),
      'penguin'
    );

    // Voltear el pingüino para que su "frente" mire hacia la izquierda
    this.penguin.setFlipX(true);

    // Configurar cuerpo circular para el pingüino
    this.penguin.setBody({
      type: 'circle',
      radius: 10
    });

    // Configurar propiedades físicas del pingüino
    const { frictionAir, friction, bounce, density } = this.config.penguinPhysicsConfig;
    this.penguin.setFrictionAir(frictionAir);
    this.penguin.setFriction(friction);
    this.penguin.setBounce(bounce);
    this.penguin.setDensity(density);

    // Inicialmente, el pingüino está estático
    this.penguin.setStatic(true);

    return this;
  }

  /**
   * Reinicia la posición de los personajes
   */
  resetPositions() {
    // Colocar los personajes en sus posiciones iniciales
    this.yeti.setPosition(this.getYetiX(), this.getYetiY());

    // Reposicionar el flamingo cerca de la mano del Yeti
    this.flamingo.setPosition(this.getFlamingoX(), this.getFlamingoY());

    // Restablecer ángulo inicial
    this.flamingo.setAngle(20);

    // Restablecer completamente el pingüino y sus propiedades visuales
    this.penguin.setPosition(this.getPenguinX(), this.getPenguinY());
    this.penguin.setVelocity(0, 0);
    this.penguin.setAngularVelocity(0);
    this.penguin.setAngle(0);
    this.penguin.setStatic(true);
    this.penguin.clearTint();
    this.penguin.setAlpha(1);
    this.penguin.setVisible(true);
    this.penguin.setScale(1);

    // Resetear propiedades físicas a sus valores por defecto
    const { friction, frictionAir, bounce, density } = this.config.penguinPhysicsConfig;
    this.penguin.setFriction(friction);
    this.penguin.setFrictionAir(frictionAir);
    this.penguin.setBounce(bounce);
    this.penguin.setDensity(density);

    // Resetear estado de deslizamiento
    this.isOnIce = false;
    this.lastGroundContact = 0;

    // Asegurarnos que no hay efectos residuales
    if (this.scene.tweens) {
      this.scene.tweens.killTweensOf(this.penguin);
    }

    return this;
  }

  /**
   * Posiciona los personajes fuera de la pantalla (para animación de entrada)
   */
  positionOffscreen() {
    const { launchPositionY } = this.config;
    const offsetY = 200; // Desplazamiento vertical para colocar fuera de pantalla

    // Colocar el yeti y el flamingo fuera de la vista inicialmente (por debajo de la pantalla)
    this.yeti.setPosition(this.getYetiX(), launchPositionY + offsetY);
    this.flamingo.setPosition(this.getFlamingoX(), launchPositionY + offsetY);

    // Establecer el pingüino fuera de pantalla pero con propiedades visuales correctas
    this.penguin.setPosition(this.getPenguinX(), launchPositionY + offsetY);
    this.penguin.clearTint();
    this.penguin.setAlpha(1);
    this.penguin.setVisible(true);
    this.penguin.setScale(1);

    // Detener cualquier animación previa
    if (this.scene.tweens) {
      this.scene.tweens.killTweensOf(this.penguin);
    }

    return this;
  }

  /**
   * Anima la entrada de los personajes
   * @param {Function} onComplete - Función a llamar cuando la animación se completa
   */
  animateEntrance(onComplete = null) {
    const { launchPositionY } = this.config;
    const offsetY = 200;
    const bounceY = 10;

    // Primero asegurarnos que el pingüino tiene una posición y propiedades correctas
    this.penguin.clearTint();
    this.penguin.setAlpha(1);
    this.penguin.setVisible(true);

    // Animar la entrada del yeti y el pingüino desde abajo
    this.scene.tweens.add({
      targets: [this.yeti, this.flamingo, this.penguin],
      y: { from: launchPositionY + offsetY, to: launchPositionY - bounceY },
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Ajustar las posiciones finales exactas
        this.penguin.setPosition(this.getPenguinX(), this.getPenguinY());
        this.flamingo.setPosition(this.getFlamingoX(), this.getFlamingoY());
        this.yeti.setPosition(this.getYetiX(), this.getYetiY());

        // Asegurarnos que el pingüino está completamente visible y sin efectos extras
        this.penguin.clearTint();
        this.penguin.setAlpha(1);

        // Añadir un pequeño efecto de rebote al yeti y al flamingo
        this.scene.tweens.add({
          targets: [this.yeti, this.flamingo],
          y: '-=10',
          duration: 150,
          yoyo: true,
          ease: 'Sine.easeInOut',
          onComplete: onComplete
        });
      }
    });

    return this;
  }

  /**
   * Anima el golpe del flamingo al pingüino
   */
  animateHit() {
    // Animar el golpe con el flamingo - cambiar a animación hacia abajo
    this.scene.tweens.add({
      targets: this.flamingo,
      angle: 90, // Ángulo positivo para que gire hacia abajo
      duration: 200,
      yoyo: true
    });

    return this;
  }

  /**
   * Lanza al pingüino con un ángulo y potencia específicos
   * @param {number} angle - Ángulo de lanzamiento (0-90)
   * @param {number} power - Potencia de lanzamiento (0-1)
   */
  launchPenguin(angle, power) {
    // Asegurarnos que el pingüino tiene las propiedades visuales correctas
    this.penguin.clearTint();
    this.penguin.setAlpha(1);
    this.penguin.setVisible(true);

    // Hacer que el pingüino sea dinámico para que la física lo afecte
    this.penguin.setStatic(false);

    // Para lanzar hacia la izquierda, invertimos el ángulo
    const invertedAngle = 180 - angle;
    const angleRad = Phaser.Math.DegToRad(invertedAngle);

    // Ajustar rango de potencia para mantener buen control y distancia adecuada
    const minPower = 5;  // Reducido ligeramente para mayor control en potencias bajas
    const maxPower = 15; // Reducido para evitar movimientos demasiado extremos
    const powerNormalized = minPower + power * (maxPower - minPower);

    // Ajustar multiplicador con un valor más equilibrado
    const powerMultiplier = 0.8; // Reducido ligeramente para mejor control
    const powerMultiplied = powerNormalized * powerMultiplier;

    // Aplicamos velocidades más equilibradas
    const velocityX = powerMultiplied * Math.cos(angleRad);
    const velocityY = -powerMultiplied * Math.sin(angleRad); // Negativo porque en pantalla Y+ es hacia abajo

    // Aplicar la velocidad al pingüino
    this.penguin.setVelocity(velocityX, velocityY);

    // Reiniciar estado de deslizamiento
    this.isOnIce = false;
    this.lastGroundContact = 0;

    // Reiniciar tracking de distancia
    this.maxDistanceReached = false;
    this.maxDistance = 0;

    // Comenzar a registrar la última posición X del pingüino
    this.lastPenguinX = this.penguin.x;
    this.penguinStoppedFrames = 0;

    // Restaurar propiedades de física para el lanzamiento
    const { frictionAir, friction, bounce, density } = this.config.penguinPhysicsConfig;
    this.penguin.setFrictionAir(frictionAir);
    this.penguin.setFriction(friction);
    this.penguin.setBounce(bounce);
    this.penguin.setDensity(density);

    // Animar el golpe del flamingo
    this.animateHit();

    return this;
  }

  /**
   * Actualiza la física del pingüino durante el vuelo
   * @returns {boolean} - true si el pingüino se ha detenido, false en caso contrario
   */
  updatePenguinPhysics() {
    // Detectar si el pingüino está en contacto con el suelo (aproximación)
    const isNearGround = this.penguin.y > 550;

    // Si está cerca del suelo y moviéndose, consideramos que está deslizando sobre hielo
    if (isNearGround && Math.abs(this.penguin.body.velocity.x) > 0.05) {
      if (!this.isOnIce) {
        // Al tocar hielo por primera vez, preservar momento con fricción adecuada
        // Valor ligeramente aumentado pero aún muy bajo para buen deslizamiento
        this.penguin.setFriction(0.0001); // Ajustado para mejor balance
        this.isOnIce = true;
        this.lastGroundContact = this.scene.time.now;
      }

      // Añadimos rotación para simular deslizamiento sobre hielo - más natural
      if (this.penguin.body.velocity.x < 0) {
        // Ajustar la rotación según la velocidad para un efecto más realista
        // Factor reducido ligeramente para movimiento más controlado
        const rotationFactor = Math.min(Math.abs(this.penguin.body.velocity.x) * 0.008, 0.04);
        this.penguin.setAngularVelocity(-rotationFactor);
      }

      // Si está deslizándose muy lentamente, dar un pequeño impulso ocasional para mantener el movimiento
      if (Math.abs(this.penguin.body.velocity.x) < 0.5 && Math.abs(this.penguin.body.velocity.x) > 0.05) {
        // Preservar la dirección del movimiento
        const direction = this.penguin.body.velocity.x < 0 ? -1 : 1;
        const currentTime = this.scene.time.now;

        // Aplicar micro-impulsos con menos frecuencia para un deslizamiento más natural
        // Simulamos el deslizamiento sobre hielo con una física más realista
        if (currentTime - this.lastGroundContact > 600) { // Incrementado para impulsos menos frecuentes
          this.penguin.setVelocityX(this.penguin.body.velocity.x * 1.05); // Reducido para menor aceleración
          this.lastGroundContact = currentTime;
        }
      }
    } else if (!isNearGround) {
      // Restaurar propiedades de física para el vuelo si está en el aire
      const { frictionAir, friction } = this.config.penguinPhysicsConfig;
      this.penguin.setFrictionAir(frictionAir);
      this.penguin.setFriction(friction);
      this.isOnIce = false;

      // Cuando está en vuelo, mantener un seguimiento de la distancia máxima
      if (!this.maxDistanceReached && this.penguin.x < this.lastPenguinX) {
        this.maxDistance = Math.min(this.lastPenguinX - this.getPenguinX(), 5000); // Limitar la distancia máxima
      }
    }

    // Umbral de detección más conservador
    const movementThreshold = 0.02; // Ajustado para mejor detección de parada

    // Comprobar si el pingüino se ha detenido
    if (Math.abs(this.penguin.x - this.lastPenguinX) < movementThreshold &&
        Math.abs(this.penguin.body.velocity.x) < movementThreshold &&
        Math.abs(this.penguin.body.velocity.y) < movementThreshold) {
      this.penguinStoppedFrames++;

      // Tiempo mejorado para considerar detenido (aproximadamente 1 segundo a 60 FPS)
      // Esto evita que el juego considere demasiado pronto como detenido
      if (this.penguinStoppedFrames > 55) {
        // Si llegamos aquí, ya alcanzamos la distancia máxima
        this.maxDistanceReached = true;
        return true; // El pingüino se ha detenido
      }
    } else {
      // Si se mueve, reiniciar el contador y actualizar la última posición
      this.penguinStoppedFrames = 0;
      this.lastPenguinX = this.penguin.x;
    }

    return false; // El pingüino sigue en movimiento
  }

  /**
   * Obtiene la posición X actual del pingüino
   * @returns {number} - La posición X del pingüino
   */
  getPenguinCurrentX() {
    return this.penguin ? this.penguin.x : this.getPenguinX();
  }

  /**
   * Obtiene la posición Y actual del pingüino
   * @returns {number} - La posición Y del pingüino
   */
  getPenguinCurrentY() {
    return this.penguin ? this.penguin.y : this.getPenguinY();
  }

  /**
   * Obtiene la posición X inicial de lanzamiento
   * @returns {number} - La posición X inicial
   */
  getLaunchPositionX() {
    return this.config.launchPositionX;
  }

  /**
   * Obtiene la posición Y inicial de lanzamiento
   * @returns {number} - La posición Y inicial
   */
  getLaunchPositionY() {
    return this.config.launchPositionY;
  }
}
