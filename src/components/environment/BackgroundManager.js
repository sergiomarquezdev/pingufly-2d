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
    this.createClouds();
    this.createTrees();
    this.createSnowmen();
    this.createIgloo();
    this.createSnowflakes();
    return this;
  }

  /**
   * Crea el cielo de fondo
   */
  createSky() {
    // Obtenemos las dimensiones de la pantalla
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Crear el cielo centrado en la pantalla
    this.scene.add.image(width / 2, height / 2, 'background_sky')
      .setScale(1.2)
      .setDepth(-10) // Profundidad muy baja para el fondo
      .setScrollFactor(0); // Fijo, no se mueve con la cámara
  }

  /**
   * Crea el sol
   */
  createSun() {
    // Obtenemos las dimensiones de la pantalla
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Crear el sol
    const sun = this.scene.add.image(width * 0.2, height * 0.1, 'background_sun')
      .setScale(0.2)
      .setDepth(-9) // Profundidad muy baja, pero por encima del cielo
      .setScrollFactor(0.1); // Movimiento muy lento con la cámara

    // Animar el brillo del sol
    this.scene.tweens.add({
      targets: sun,
      alpha: 0.8,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Crea las montañas en el horizonte y la textura de nieve en el suelo
   */
  createMountains() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const { mountainCount } = this.config;

    // Añadir montaña principal centrada
    this.scene.add.image(width / 2, height * 0.8, 'background_mountain_01')
      .setScale(0.4)
      .setDepth(-9) // Misma profundidad que el sol
      .setScrollFactor(0.3); // Movimiento lento para efecto parallax

    // Añadir montañas adicionales para crear profundidad
    for (let i = 0; i < mountainCount - 1; i++) {
      const x = -500 + (i * 600) + Phaser.Math.Between(-100, 100);
      const y = height - 50;
      const scale = Phaser.Math.FloatBetween(0.3, 0.5);

      this.scene.add.image(x, y, 'background_mountain_01')
        .setOrigin(0.5, 1)
        .setScale(scale)
        .setDepth(-9) // Misma profundidad que el sol y la montaña principal
        .setScrollFactor(0.3); // Movimiento lento para efecto parallax
    }

    // Añadir textura de nieve en el suelo - ampliada para cubrir mejor el área
    const snowGround = this.scene.add.tileSprite(width / 2, height - 5, width * 4, 140, 'snow_texture')
      .setAlpha(1) // Aumentada a opacidad completa
      .setDepth(-9) // Misma profundidad que el sol y las montañas
      .setScrollFactor(0.5); // Se mueve más rápido que las montañas pero más lento que objetos cercanos
  }

  /**
   * Crea los árboles
   */
  createTrees() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const { treeCount } = this.config;

    // Posiciones base para los árboles, similar al menú pero adaptado al juego
    const baseTreePositions = [
      { key: 'snow_tree_01', xRatio: 0.14, yRatio: 0.91, scale: 0.5, depth: -6 }, // Ajustado a -6
      { key: 'snow_tree_01', xRatio: 0.92, yRatio: 0.94, scale: 0.35, depth: -6 }, // Ajustado a -6
      { key: 'snow_tree_01', xRatio: 0.3, yRatio: 0.93, scale: 0.5, depth: -5 }, // Ajustado a -5
      { key: 'snow_tree_01', xRatio: 0.7, yRatio: 0.92, scale: 0.4, depth: -5 } // Ajustado a -5
    ];

    // Utilizar posiciones base y añadir árboles adicionales con variación de posición
    for (let i = 0; i < treeCount; i++) {
      // Alternar entre posiciones base y posiciones aleatorias
      let treeConfig;
      if (i < baseTreePositions.length) {
        treeConfig = { ...baseTreePositions[i] };
      } else {
        // Para árboles adicionales, crear posiciones aleatorias
        treeConfig = {
          key: 'snow_tree_01',
          xRatio: Phaser.Math.FloatBetween(0.1, 0.9),
          yRatio: Phaser.Math.FloatBetween(0.9, 0.97),
          scale: Phaser.Math.FloatBetween(0.3, 0.5),
          depth: Phaser.Math.Between(-6, -5) // Ajustado a valores negativos
        };
      }

      // Calcular posición actual y añadir variación para el juego
      const xOffset = Phaser.Math.Between(-1000, 1000); // Más variación para cubrir el área del juego
      const x = (width * treeConfig.xRatio) + xOffset;
      const y = height * treeConfig.yRatio;

      // Determinar factor de desplazamiento basado en la profundidad
      const scrollFactor = treeConfig.depth === -6 ? 0.6 : 0.7;

      this.scene.add.image(x, y, treeConfig.key)
        .setOrigin(0.5, 1)
        .setScale(treeConfig.scale)
        .setDepth(treeConfig.depth)
        .setScrollFactor(scrollFactor);
    }
  }

  /**
   * Crea nubes decorativas con efecto de movimiento
   */
  createClouds() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Configuración de las nubes, similar al menú
    const cloudConfigs = [
      { key: 'cloud_01', xRatio: 0.2, yRatio: 0.3, scale: 0.8, duration: 20000 },
      { key: 'cloud_02', xRatio: 0.5, yRatio: 0.2, scale: 0.6, duration: 25000 },
      { key: 'cloud_03', xRatio: 0.8, yRatio: 0.25, scale: 0.7, duration: 21000 },
      { key: 'cloud_04', xRatio: 0.1, yRatio: 0.15, scale: 0.5, duration: 22000 }
    ];

    // Crear y animar cada nube
    cloudConfigs.forEach(config => {
      // Posición inicial fuera de la pantalla para entrar gradualmente
      const x = (width * config.xRatio) - 1500; // Comenzar fuera de la vista
      const y = height * config.yRatio;

      const cloud = this.scene.add.image(x, y, config.key)
        .setScale(config.scale)
        .setAlpha(0.8)
        .setDepth(-8) // Por encima de montañas y sol
        .setScrollFactor(0.2); // Las nubes se mueven lentamente con la cámara

      // Animar movimiento horizontal continuo
      this.scene.tweens.add({
        targets: cloud,
        x: x + 3000, // Mover a través de una gran distancia
        duration: config.duration,
        ease: 'Linear',
        repeat: -1, // Repetir indefinidamente
        onRepeat: () => {
          // Reiniciar posición
          cloud.x = x - 500;
        }
      });
    });
  }

  /**
   * Crea muñecos de nieve decorativos
   */
  createSnowmen() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Posiciones para los muñecos de nieve
    const snowmanPositions = [
      { xRatio: 0.75, yRatio: 0.92, scale: 0.6 },
      { xRatio: 0.23, yRatio: 0.9, scale: 0.5 }
    ];

    // Crear cada muñeco de nieve con una posición absoluta para el juego
    snowmanPositions.forEach((pos, index) => {
      // Para el juego, distribuimos los muñecos a lo largo del recorrido
      const xOffset = index * 2000;
      const x = (width * pos.xRatio) + xOffset;
      const y = height * pos.yRatio;

      const snowman = this.scene.add.image(x, y, 'snowman')
        .setOrigin(0.5, 1)
        .setScale(pos.scale)
        .setDepth(-4) // Por encima de árboles, ajustado a -4
        .setScrollFactor(0.8); // Se mueven casi a la misma velocidad que el personaje

      // Recortar 1px de la parte superior para eliminar la línea extraña
      snowman.setCrop(0, 1, 64, 63);
    });
  }

  /**
   * Crea un iglú decorativo
   */
  createIgloo() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Posición del iglú, similar al menú pero adaptado para el juego
    const x = width * 0.2 + 1500; // Colocado más adelante en el recorrido
    const y = height * 0.88;

    const igloo = this.scene.add.image(x, y, 'igloo')
      .setScale(0.2)
      .setDepth(-7) // Por encima de nubes
      .setScrollFactor(0.75); // Movimiento intermedio
  }

  /**
   * Crea copos de nieve flotando en la pantalla
   */
  createSnowflakes() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Grupo para los copos de nieve
    const snowflakes = this.scene.add.group();

    // Crear copos de nieve pequeños
    for (let i = 0; i < 35; i++) {
      const x = Phaser.Math.Between(-500, width + 500);
      const y = Phaser.Math.Between(-100, height);
      const scale = Phaser.Math.FloatBetween(0.1, 0.2);
      const rotationSpeed = Phaser.Math.FloatBetween(0.1, 0.3);

      // Crear copo de nieve con el sprite
      const snowflake = this.scene.add.image(x, y, 'snowflake')
        .setScale(scale)
        .setAlpha(Phaser.Math.FloatBetween(0.5, 0.9))
        .setDepth(-3) // Por encima de muñecos, ajustado a -3
        .setScrollFactor(0.1); // Muy poco movimiento con la cámara para dar sensación de atmósfera

      snowflakes.add(snowflake);

      // Animación de caída con rotación
      this.scene.tweens.add({
        targets: snowflake,
        y: height + 100,
        x: x + Phaser.Math.Between(-100, 100),
        rotation: snowflake.rotation + rotationSpeed * 10,
        duration: Phaser.Math.Between(8000, 20000),
        ease: 'Linear',
        repeat: -1,
        onRepeat: () => {
          // Reiniciar posición cuando se repita
          snowflake.y = Phaser.Math.Between(-100, -20);
          snowflake.x = Phaser.Math.Between(-500, width + 500);
          snowflake.alpha = Phaser.Math.FloatBetween(0.5, 0.9);
          snowflake.rotation = 0;
        }
      });
    }

    // Añadir copos grandes en primer plano
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(-500, width + 500);
      const y = Phaser.Math.Between(-100, height);
      const scale = Phaser.Math.FloatBetween(0.3, 0.5);
      const rotationSpeed = Phaser.Math.FloatBetween(0.05, 0.15);

      const largeSnowflake = this.scene.add.image(x, y, 'snowflake')
        .setScale(scale)
        .setAlpha(Phaser.Math.FloatBetween(0.7, 1))
        .setDepth(-2) // Por encima de los pequeños, ajustado a -2
        .setScrollFactor(0.2); // Un poco más de movimiento que los pequeños

      snowflakes.add(largeSnowflake);

      // Animación de caída más rápida
      this.scene.tweens.add({
        targets: largeSnowflake,
        y: height + 100,
        x: x + Phaser.Math.Between(-150, 150),
        rotation: largeSnowflake.rotation + rotationSpeed * 10,
        duration: Phaser.Math.Between(6000, 10000),
        ease: 'Linear',
        repeat: -1,
        onRepeat: () => {
          largeSnowflake.y = Phaser.Math.Between(-100, -20);
          largeSnowflake.x = Phaser.Math.Between(-500, width + 500);
          largeSnowflake.alpha = Phaser.Math.FloatBetween(0.7, 1);
          largeSnowflake.rotation = 0;
        }
      });
    }

    return snowflakes;
  }
}
