/**
 * Clase BackgroundManager - Gestiona la creación y renderizado de todos los elementos del fondo
 * Incluye cielo, sol, montañas, árboles y rocas
 */
import Phaser from 'phaser';

export default class BackgroundManager {
  /**
   * Constructor
   * @param {Phaser.Scene} scene - La escena donde se añadirán los elementos de fondo
   * @param {Object} config - Configuración opcional
   */
  constructor(scene, config = {}) {
    this.scene = scene;

    // Configuraciones por defecto
    this.config = {
      mountainCount: config.mountainCount || 5,
      treeCount: config.treeCount || 4,
      rockCount: config.rockCount || 12
    };
  }

  /**
   * Crea todos los elementos del fondo
   */
  create() {
    this.createSky();
    this.createSun();
    this.createMountains();
    this.createTrees();
    this.createRocks();
    return this;
  }

  /**
   * Crea el cielo de fondo
   */
  createSky() {
    this.scene.add.image(0, 0, 'background_sky')
      .setOrigin(0, 0)
      .setScale(1.1)
      .setScrollFactor(0); // Fijo, no se mueve con la cámara
  }

  /**
   * Crea el sol
   */
  createSun() {
    this.scene.add.image(200, 100, 'background_sun')
      .setScrollFactor(0.1); // Movimiento muy lento
  }

  /**
   * Crea las montañas en el horizonte
   */
  createMountains() {
    const { mountainCount } = this.config;

    for (let i = 0; i < mountainCount; i++) {
      const x = -500 + (i * 600) + Phaser.Math.Between(-100, 100);
      const y = this.scene.scale.height - 50;
      const scale = Phaser.Math.FloatBetween(0.6, 1.4);

      this.scene.add.image(x, y, 'background_mountain')
        .setOrigin(0.5, 1)
        .setScale(scale)
        .setScrollFactor(0.3); // Movimiento lento para efecto parallax
    }
  }

  /**
   * Crea los árboles
   */
  createTrees() {
    const { treeCount } = this.config;

    for (let i = 0; i < treeCount; i++) {
      const x = -600 + (i * 800) + Phaser.Math.Between(-100, 100);
      const y = this.scene.scale.height - 40; // Muy cerca del suelo
      const scale = Phaser.Math.FloatBetween(0.02, 0.05); // Escala reducida por el tamaño grande del sprite
      const scrollFactor = Phaser.Math.FloatBetween(0.6, 0.8);

      this.scene.add.image(x, y, 'tree')
        .setOrigin(0.5, 1)
        .setScale(scale)
        .setScrollFactor(scrollFactor); // Movimiento más rápido (más cercano)
    }
  }

  /**
   * Crea las rocas dispersas por el terreno
   */
  createRocks() {
    const { rockCount } = this.config;

    for (let i = 0; i < rockCount; i++) {
      // Distribuir rocas a lo largo del terreno
      const x = -1000 + (i * 350) + Phaser.Math.Between(-150, 150);
      const y = this.scene.scale.height - 35; // En el nivel del suelo
      const scale = Phaser.Math.FloatBetween(0.5, 1); // Variación de tamaños
      const scrollFactor = Phaser.Math.FloatBetween(0.5, 0.7);

      this.scene.add.image(x, y, 'rocks')
        .setOrigin(0.8, 0.8)
        .setScale(scale)
        .setScrollFactor(scrollFactor); // Movimiento rápido (están en primer plano)
    }
  }
}
