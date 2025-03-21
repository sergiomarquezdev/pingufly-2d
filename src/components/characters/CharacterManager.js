import Phaser from 'phaser';
import penguinAnimations from '../../config/penguinAnimations';

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

    // Estado de tracking de distancia y animaciones
    this.maxDistanceReached = false;
    this.maxDistance = 0;
    this.hasHitGround = false;
    this.hasShownStopAnimation = false;

    // Estado actual de la animación del pingüino
    this.currentAnimation = 'idle';
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
    ).setDepth(5);

    // Voltear el Yeti para que mire hacia la izquierda
    this.yeti.setFlipX(true);

    // Crear el flamingo - Reposicionado cerca de la mano del Yeti
    this.flamingo = this.scene.add.image(
      this.getFlamingoX(),
      this.getFlamingoY(),
      'flamingo'
    ).setDepth(5);

    // Voltear el flamingo para que apunte hacia la izquierda
    this.flamingo.setFlipX(true);
    // Rotar ligeramente para posición de inicio
    this.flamingo.setAngle(20);

    // Crear el pingüino - intentamos primero con el sprite, con fallback a imagen estática
    try {
      // Verificar primero si el sprite sheet está disponible
      if (this.scene.textures.exists('penguin_sheet')) {
        // Crear directamente un sprite con Matter physics
        this.penguin = this.scene.matter.add.sprite(
          this.getPenguinX(),
          this.getPenguinY(),
          'penguin_sheet',
          0  // Frame inicial
        ).setDepth(5);

        // Recortar 1px de la parte superior para eliminar la línea extraña
        this.penguin.setCrop(0, 1, 32, 31);

        // Configurar el cuerpo circular aquí para evitar problemas
        this.penguin.setBody({
          type: 'circle',
          radius: 12
        });

        // Hacer que el pingüino sea estático inicialmente
        this.penguin.setStatic(true);

        // Esperar un poco antes de iniciar animaciones para asegurar que todo está listo
        this.scene.time.delayedCall(500, () => {
          try {
            if (this.penguin && this.penguin.anims) {
              // Verificar si la animación existe antes de reproducirla
              if (this.scene.anims.exists('penguin_idle')) {
                this.penguin.play('penguin_idle');
                this.currentAnimation = 'penguin_idle';
              } else {
                console.error('❌ La animación penguin_idle no existe');
              }
            } else {
              console.error('❌ El pingüino no tiene componente de animaciones');
            }
          } catch (error) {
            console.error('Error al iniciar la animación del pingüino:', error);
          }
        });
      } else {
        // Usar imagen estática como fallback
        this.penguin = this.scene.matter.add.image(
          this.getPenguinX(),
          this.getPenguinY(),
          'penguin'
        ).setDepth(5);
      }
    } catch (error) {
      console.error('Error al crear el personaje pingüino:', error);

      // Si falla todo, asegurarnos de tener al menos un pingüino básico
      if (!this.penguin) {
        this.penguin = this.scene.matter.add.image(
          this.getPenguinX(),
          this.getPenguinY(),
          'penguin'
        ).setDepth(5);
      }
    }

    // Voltear el pingüino para que su "frente" mire hacia la izquierda
    this.penguin.setFlipX(true);

    // Ajustar tamaño del sprite
    this.penguin.setScale(1.5);

    // Configurar propiedades físicas del pingüino
    const { frictionAir, friction, bounce, density } = this.config.penguinPhysicsConfig;
    this.penguin.setFrictionAir(frictionAir);
    this.penguin.setFriction(friction);
    this.penguin.setBounce(bounce);
    this.penguin.setDensity(density);

    return this;
  }

  /**
   * Reproduce una animación específica en el pingüino
   * @param {string} key - Clave de la animación a reproducir
   * @param {boolean} ignoreIfPlaying - Si es true, no cambiará si ya está reproduciendo esta animación
   */
  playPenguinAnimation(key, ignoreIfPlaying = true) {
    // Verificar si el pingüino existe
    if (!this.penguin) {
      return;
    }

    // Verificar si el pingüino tiene componente de animaciones
    if (!this.penguin.anims) {
      return;
    }

    // Comprobar si la animación existe en la escena
    if (!this.scene.anims.exists(key)) {
      return;
    }

    try {
      // Si queremos ignorar si ya está reproduciéndose, verificar el estado actual
      if (ignoreIfPlaying) {
        // Obtener la animación actual con manejo de errores
        const currentAnim = this.penguin.anims.currentAnim;
        const currentKey = currentAnim ? currentAnim.key : null;

        if (currentKey === key) {
          return;
        }
      }

      // Obtener la configuración de esta animación para aplicar propiedades especiales
      const animConfig = Object.values(penguinAnimations).find(anim => anim.key === key);

      if (animConfig) {
        // Aplicar flipX si está definido en la configuración
        if (animConfig.flipX !== undefined) {
          this.penguin.setFlipX(animConfig.flipX);
        }
      }

      // Reproducir la animación
      this.penguin.play(key, true);
      this.currentAnimation = key;
    } catch (error) {
      console.error(`Error al reproducir la animación ${key}:`, error);
    }
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

    // Asegurar que no hay rotación
    this.penguin.setAngularVelocity(0);
    this.penguin.setAngle(0);
    this.penguin.rotation = 0; // Establecer la propiedad rotation a cero explícitamente

    this.penguin.setStatic(true);
    this.penguin.clearTint();
    this.penguin.setAlpha(1);
    this.penguin.setVisible(true);
    this.penguin.setScale(1.5);

    // Detener cualquier animación en curso y reproducir animación idle
    if (this.penguin.anims) {
      this.penguin.anims.stop();
      // Pequeño retraso para asegurar que se cambia la animación
      this.scene.time.delayedCall(50, () => {
        this.playPenguinAnimation('penguin_idle', false);
      });
    }

    // Resetear propiedades físicas a sus valores por defecto
    const { friction, frictionAir, bounce, density } = this.config.penguinPhysicsConfig;
    this.penguin.setFriction(friction);
    this.penguin.setFrictionAir(frictionAir);
    this.penguin.setBounce(bounce);
    this.penguin.setDensity(density);

    // Resetear estado de deslizamiento
    this.isOnIce = false;
    this.lastGroundContact = 0;
    this.maxDistanceReached = false;
    this.maxDistance = 0;
    this.hasHitGround = false;
    this.hasShownStopAnimation = false;

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
    this.penguin.setScale(1.5);

    // Reiniciar la animación del pingüino
    if (this.penguin.anims) {
      this.penguin.anims.stop();
      this.playPenguinAnimation('penguin_idle', false);
    }

    // Detener cualquier animación previa
    if (this.scene.tweens) {
      this.scene.tweens.killTweensOf(this.penguin);
    }

    // Resetear el estado de impacto
    this.hasHitGround = false;
    this.hasShownStopAnimation = false;

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

    // Asegurar que no hay rotación desde el inicio
    this.penguin.setAngularVelocity(0);
    this.penguin.setAngle(0);
    this.penguin.rotation = 0;

    // Reproducir la animación de preparación y luego la de lanzamiento
    this.playPenguinAnimation('penguin_prepare', false);

    // Esperar a que termine la animación de preparación antes de lanzar
    this.scene.time.delayedCall(200, () => {
      // Reproducir la animación de lanzamiento
      this.playPenguinAnimation('penguin_launch', false);

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

      // Asegurar explícitamente que no hay rotación
      this.penguin.setAngularVelocity(0);

      // Después de un breve retraso, cambiar a la animación de vuelo
      this.scene.time.delayedCall(200, () => {
        this.playPenguinAnimation('penguin_fly', false);
        // Reforzar que no haya rotación
        this.penguin.setAngularVelocity(0);
      });

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
    });

    return this;
  }

  /**
   * Actualiza la física del pingüino durante el vuelo
   * @returns {boolean} - true si el pingüino se ha detenido, false en caso contrario
   */
  updatePenguinPhysics() {
    // Detectar si el pingüino está en contacto con el suelo (aproximación)
    const isNearGround = this.penguin.y > 550;
    const velocity = this.penguin.body.velocity;
    const absVelocityX = Math.abs(velocity.x);
    const absVelocityY = Math.abs(velocity.y);
    const isMovingSignificantly = absVelocityX > 0.5 || absVelocityY > 0.5;

    // Si está cerca del suelo y moviéndose, consideramos que está deslizando sobre hielo
    if (isNearGround && isMovingSignificantly) {
      if (!this.isOnIce) {
        // Preservar momento con fricción adecuada
        this.penguin.setFriction(0.0001);
        this.isOnIce = true;
        this.lastGroundContact = this.scene.time.now;

        // Cambiar directamente a la animación de deslizamiento
        this.playPenguinAnimation('penguin_slide', false);

        // Asegurar que no hay rotación
        this.penguin.setAngularVelocity(0);
      }

      // Asegurar que el pengüino NO rota mientras está deslizando
      this.penguin.setAngularVelocity(0);

      // Si la velocidad es muy baja pero no cero, aplicar micro-impulsos
      if (absVelocityX < 0.5 && absVelocityX > 0.05) {
        const direction = this.penguin.body.velocity.x < 0 ? -1 : 1;
        const currentTime = this.scene.time.now;

        if (currentTime - this.lastGroundContact > 600) {
          this.penguin.setVelocityX(this.penguin.body.velocity.x * 1.05);
          this.lastGroundContact = currentTime;
        }
      }
    } else if (!isNearGround) {
      // Restaurar propiedades de física para el vuelo
      const { frictionAir, friction } = this.config.penguinPhysicsConfig;
      this.penguin.setFrictionAir(frictionAir);
      this.penguin.setFriction(friction);
      this.isOnIce = false;

      // Asegurar que no hay rotación en el aire tampoco
      this.penguin.setAngularVelocity(0);

      // Si está en el aire y no tiene la animación de vuelo, ponerla
      if (this.currentAnimation !== 'penguin_fly' && isMovingSignificantly) {
        this.playPenguinAnimation('penguin_fly', false);
      }

      // Tracking de distancia máxima
      if (!this.maxDistanceReached && this.penguin.x < this.lastPenguinX) {
        this.maxDistance = Math.min(this.lastPenguinX - this.getPenguinX(), 5000);
      }
    }

    // Umbral para considerar detenido
    const movementThreshold = 0.02;

    // Comprobar si el pingüino se ha detenido
    if (Math.abs(this.penguin.x - this.lastPenguinX) < movementThreshold &&
        absVelocityX < movementThreshold &&
        absVelocityY < movementThreshold) {
      this.penguinStoppedFrames++;

      // Si se ha detenido por suficientes frames
      if (this.penguinStoppedFrames > 55) {
        // Detener cualquier rotación residual
        this.penguin.setAngularVelocity(0);
        this.penguin.setAngle(0);

        // Primero mostrar la animación de parada
        if (this.currentAnimation !== 'penguin_stop' && !this.hasShownStopAnimation) {
          this.playPenguinAnimation('penguin_stop', false);
          this.hasShownStopAnimation = true;

          // Esperar a que termine la animación de parada antes de mostrar la animación final
          this.scene.time.delayedCall(500, () => {
            // Marcar que ha alcanzado la distancia máxima
            this.maxDistanceReached = true;

            // Elegir animación final según el rendimiento
            if (this.maxDistance > 500) {
              // Buena distancia, mostrar celebración
              this.playPenguinAnimation('penguin_celebrate', false);
            } else {
              // Distancia corta, mostrar animación de mareado
              this.playPenguinAnimation('penguin_dizzy', false);
            }
          });
        }

        return this.hasShownStopAnimation && this.maxDistanceReached; // El pingüino se ha detenido
      }
    } else {
      // Si se mueve, reiniciar el contador
      this.penguinStoppedFrames = 0;
      this.lastPenguinX = this.penguin.x;
      this.hasShownStopAnimation = false;
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

  /**
   * Establece la animación del pingüino según el estado del juego
   * @param {string} gameState - Estado actual del juego
   * @param {object} options - Opciones adicionales
   */
  setAnimationByState(gameState, options = {}) {
    if (!this.penguin || !this.penguin.anims) {
      return;
    }

    // Mapear estados del juego a animaciones
    const stateAnimMap = {
      'READY': 'penguin_idle',
      'ANGLE_SELECTION': 'penguin_idle',
      'POWER_SELECTION': 'penguin_prepare',
      'LAUNCHING': 'penguin_launch',
      'FLYING': 'penguin_fly',
      'SLIDING': 'penguin_slide',
      'STOPPED': 'penguin_stop',
      'ENDED': options.success ? 'penguin_celebrate' : 'penguin_dizzy',
      'RESETTING': 'penguin_idle'
    };

    // Obtener la animación para el estado actual
    const animKey = stateAnimMap[gameState] || 'penguin_idle';

    // Reproducir la animación correspondiente
    this.playPenguinAnimation(animKey, options.ignoreIfPlaying !== false);

    return this;
  }
}
