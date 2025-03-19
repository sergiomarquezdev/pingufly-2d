import Phaser from 'phaser';

/**
 * Clase que proporciona funcionalidad para controlar la cámara del juego
 */
export default class CameraController {
  /**
   * Constructor de la clase CameraController
   * @param {Phaser.Scene} scene - La escena a la que pertenece la cámara
   * @param {Object} config - Configuración de la cámara
   */
  constructor(scene, config = {}) {
    this.scene = scene;
    this.camera = scene.cameras.main;

    // Propiedades de configuración con valores por defecto
    this.config = {
      worldBounds: config.worldBounds || { x: -10000, y: 0, width: 20000, height: 600 },
      initialCenterX: config.initialCenterX || 400,
      initialCenterY: config.initialCenterY || 300,
      smoothness: config.smoothness || 0.08 // Factor de suavizado (valores más bajos = más suave)
    };

    // Guardar la posición inicial
    this.initialScrollX = null;

    // Inicializar la cámara
    this.initialize();
  }

  /**
   * Inicializa la configuración de la cámara
   */
  initialize() {
    const { worldBounds, initialCenterX, initialCenterY } = this.config;

    // Configurar los límites de la cámara
    this.camera.setBounds(worldBounds.x, worldBounds.y, worldBounds.width, worldBounds.height);

    // Inicialmente, la cámara se enfoca en la posición de inicio
    this.camera.centerOn(initialCenterX, initialCenterY);

    // Guardar la posición inicial de la cámara para el seguimiento personalizado
    this.initialScrollX = this.camera.scrollX;

    return this;
  }

  /**
   * Obtiene la posición inicial X de la cámara
   * @returns {number} - La posición inicial X de la cámara
   */
  getInitialScrollX() {
    return this.initialScrollX;
  }

  /**
   * Obtiene el borde izquierdo visible de la cámara
   * @returns {number} - La posición X del borde izquierdo de la cámara
   */
  getLeftEdge() {
    return this.camera.scrollX;
  }

  /**
   * Restaura la posición inicial de la cámara con una animación
   * @param {Object} options - Opciones de la animación
   */
  resetToInitial(options = {}) {
    const duration = options.duration || 800;
    const ease = options.ease || 'Power2';

    // Restablecer la posición de la cámara con una animación
    this.scene.tweens.add({
      targets: this.camera,
      scrollX: this.initialScrollX,
      duration: duration,
      ease: ease
    });

    return this;
  }

  /**
   * Establece inmediatamente la posición de la cámara
   * @param {number} x - Posición X a establecer
   */
  setScrollX(x) {
    this.camera.scrollX = x;
    return this;
  }

  /**
   * Actualiza la cámara para seguir a un objeto de juego si cumple ciertas condiciones
   * @param {Phaser.GameObjects.GameObject} target - El objeto a seguir
   * @param {boolean} shouldFollow - Si debe seguir al objeto o no
   */
  followTarget(target, shouldFollow) {
    if (!target || !shouldFollow) return;

    // Obtener el centro de la pantalla
    const centerX = this.initialScrollX + (this.camera.width / 2);

    // Verificar si el objetivo ha sobrepasado el centro de la pantalla
    if (target.x < centerX) {
      // Calcular la posición de la cámara para mantener al objetivo centrado
      const targetScrollX = target.x - (this.camera.width / 2);

      // Suavizar el movimiento de la cámara con interpolación lineal
      const newScrollX = Phaser.Math.Linear(
        this.camera.scrollX,
        targetScrollX,
        this.config.smoothness
      );

      // Asegurarnos de que la cámara no retroceda más allá de su posición inicial
      if (newScrollX <= this.initialScrollX) {
        this.camera.scrollX = newScrollX;
      }
    }

    return this;
  }

  /**
   * Realiza un efecto de flash en la cámara
   * @param {Object} options - Opciones del efecto
   */
  flash(options = {}) {
    const duration = options.duration || 250;
    const color = options.color || 0xffffff;
    const callback = options.callback || null;

    this.camera.flash(duration, color, color, color);

    if (callback) {
      this.camera.once('cameraflashcomplete', callback);
    }

    return this;
  }

  /**
   * Realiza un efecto de fade en la cámara
   * @param {Object} options - Opciones del efecto
   */
  fade(options = {}) {
    const duration = options.duration || 500;
    const color = options.color || 0x000000;
    const callback = options.callback || null;

    this.camera.fade(duration, color, color, color);

    if (callback) {
      this.camera.once('camerafadeoutcomplete', callback);
    }

    return this;
  }
}
