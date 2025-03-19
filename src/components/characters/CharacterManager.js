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
        frictionAir: 0.005,  // Reducir aún más la fricción del aire para vuelo más lento
        friction: 0.001,     // Fricción casi nula para máximo deslizamiento
        bounce: 0.7,         // Aumentar rebote para más deslizamiento
        density: 0.001       // Reducir densidad para que sea más ligero
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

    // Aumentamos el rango de potencia para golpeos más fuertes
    const minPower = 5;
    const maxPower = 15;
    const powerNormalized = minPower + power * (maxPower - minPower);

    // Reducir el multiplicador para vuelo más lento pero manteniendo alcance
    const powerMultiplier = 0.8;
    const powerMultiplied = powerNormalized * powerMultiplier;

    // Aplicamos velocidades más bajas para vuelo más lento
    const velocityX = powerMultiplied * Math.cos(angleRad);
    const velocityY = -powerMultiplied * Math.sin(angleRad); // Negativo porque en pantalla Y+ es hacia abajo

    // Aplicar la velocidad al pingüino
    this.penguin.setVelocity(velocityX, velocityY);

    // Comenzar a registrar la última posición X del pingüino
    this.lastPenguinX = this.penguin.x;
    this.penguinStoppedFrames = 0;

    // Animar el golpe del flamingo
    this.animateHit();

    return this;
  }

  /**
   * Actualiza la física del pingüino durante el vuelo
   * @returns {boolean} - true si el pingüino se ha detenido, false en caso contrario
   */
  updatePenguinPhysics() {
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
      if (this.penguinStoppedFrames > 60) { // 1 segundos a 60 FPS
        return true; // El pingüino se ha detenido
      }
    } else {
      // Si se mueve, reiniciar el contador
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
