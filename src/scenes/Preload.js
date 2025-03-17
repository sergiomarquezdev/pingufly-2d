/**
 * Escena Preload - Se encarga de cargar todos los recursos del juego
 * y mostrar una pantalla de carga mientras se completa este proceso
 */

import Phaser from 'phaser';

export default class Preload extends Phaser.Scene {
  constructor() {
    super('Preload');

    // Variables para la barra de progreso
    this.progressBar = null;
    this.progressBox = null;
    this.loadingText = null;
    this.percentText = null;
    this.assetText = null;
  }

  preload() {
    this.createLoadingUI();

    // Registrar eventos de carga
    this.registerLoadingEvents();

    // En esta fase inicial del desarrollo, no tenemos assets definitivos.
    // Usaremos assets básicos para configurar el juego.

    // Placeholder para fondos (temporales)
    this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
    this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');

    // Placeholder para personajes (temporales)
    this.load.image('yeti', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    this.load.image('penguin', 'https://labs.phaser.io/assets/sprites/phaser-ship.png');
    this.load.image('flamingo', 'https://labs.phaser.io/assets/sprites/asteroids_ship.png');

    // Elementos de UI
    this.load.image('button', 'https://labs.phaser.io/assets/sprites/button-bg.png');

    // Tiempo mínimo de carga (para simular carga con pocos assets)
    this.simulateLoading();
  }

  create() {
    // Transición a la siguiente escena después de una breve pausa
    this.time.delayedCall(500, () => {
      this.scene.start('Menu');
    });
  }

  /**
   * Crea la interfaz de usuario para la pantalla de carga
   */
  createLoadingUI() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Fondo negro
    this.cameras.main.setBackgroundColor('#000000');

    // Caja de progreso
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    // Textos
    this.loadingText = this.add.text(width / 2, height / 2 - 50, 'CARGANDO...', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.percentText = this.add.text(width / 2, height / 2, '0%', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.assetText = this.add.text(width / 2, height / 2 + 50, '', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Barra de progreso
    this.progressBar = this.add.graphics();
  }

  /**
   * Registra eventos para actualizar la UI de carga
   */
  registerLoadingEvents() {
    // Evento de progreso
    this.load.on('progress', (value) => {
      this.updateProgressBar(value);
    });

    // Evento de archivo cargado
    this.load.on('fileprogress', (file) => {
      this.assetText.setText(`Cargando: ${file.key}`);
    });

    // Evento de carga completa
    this.load.on('complete', () => {
      this.progressBar.clear();
      this.progressBox.destroy();
      this.loadingText.destroy();
      this.percentText.destroy();
      this.assetText.destroy();
    });
  }

  /**
   * Actualiza la barra de progreso
   */
  updateProgressBar(value) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.progressBar.clear();
    this.progressBar.fillStyle(0xffffff, 1);
    this.progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);

    const percent = Math.floor(value * 100);
    this.percentText.setText(`${percent}%`);
  }

  /**
   * Simula tiempo de carga adicional para mejorar experiencia UX
   * en la fase inicial con pocos assets
   */
  simulateLoading() {
    // Añadimos pausas artificiales para ver la pantalla de carga
    // (solo mientras tengamos pocos assets)
    for (let i = 0; i < 100; i++) {
      this.load.image(`dummy${i}`, 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    }
  }
}
