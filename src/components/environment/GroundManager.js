/**
 * Clase GroundManager - Gestiona la creación y configuración del suelo
 */
import Phaser from 'phaser';

export default class GroundManager {
  /**
   * Constructor
   * @param {Phaser.Scene} scene - La escena donde se añadirá el suelo
   * @param {Object} config - Configuración opcional
   */
  constructor(scene, config = {}) {
    this.scene = scene;

    // Configuraciones por defecto
    this.config = {
      width: config.width || 200,
      height: config.height || 1,
      friction: config.friction || 0.001,
      frictionStatic: config.frictionStatic || 0.001,
      y: config.y || 580
    };

    this.ground = null;
  }

  /**
   * Crea el suelo con las propiedades físicas adecuadas
   */
  create() {
    // Crear suelo físico extendido hacia la izquierda
    this.ground = this.scene.matter.add.image(0, this.config.y, 'ground');
    this.ground.setScale(this.config.width, this.config.height);
    this.ground.setStatic(true);

    // Propiedades del suelo - reducir la fricción para simular hielo
    this.ground.setFriction(this.config.friction);
    this.ground.setFrictionStatic(this.config.frictionStatic);

    return this;
  }

  /**
   * Obtiene la referencia al objeto del suelo
   * @returns {Phaser.Physics.Matter.Image} El objeto del suelo
   */
  getGround() {
    return this.ground;
  }

  /**
   * Destruye el suelo si existe
   */
  destroy() {
    if (this.ground && this.ground.destroy) {
      this.ground.destroy();
      this.ground = null;
    }
  }
}
