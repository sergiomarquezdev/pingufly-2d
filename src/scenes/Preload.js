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

    // Cargar archivos de audio
    this.loadAudioFiles();

    // Cargar assets UI
    this.load.image('gear_icon', 'assets/images/ui/gear_icon.png');

    // Cargar assets de fondo
    this.load.image('background_sky', 'assets/images/background/background_sky.png');
    this.load.image('background_sun', 'assets/images/background/background_sun.png');
    this.load.image('background_mountain_01', 'assets/images/background/background_mountain_01.png');
    this.load.image('background_mountain_02', 'assets/images/background/background_mountain_02.png');
    // Cargar nubes
    this.load.image('cloud_01', 'assets/images/background/cloud_01.png');
    this.load.image('cloud_02', 'assets/images/background/cloud_02.png');
    this.load.image('cloud_03', 'assets/images/background/cloud_03.png');
    this.load.image('cloud_04', 'assets/images/background/cloud_04.png');

    // Cargar nuevos elementos de entorno con nieve
    this.load.image('snow_tree', 'assets/images/environment/snow_tree.png');
    this.load.image('snowman', 'assets/images/environment/snowman.png');
    this.load.image('snowflake', 'assets/images/environment/snowflake.png');
    this.load.image('igloo', 'assets/images/environment/igloo.png');
    this.load.image('snow_texture', 'assets/images/environment/snow_texture.png');

    // Cargar sprite sheet del pingüino
    this.load.spritesheet('penguin_sheet', 'assets/images/characters/penguin_sheet.png', {
      frameWidth: 32,   // Ancho de cada frame basado en la imagen real
      frameHeight: 32,  // Alto de cada frame basado en la imagen real
      spacing: 0,       // Espacio entre frames (si existe)
      margin: 0         // Margen alrededor de los frames
    });

    // Verificar si la textura se está cargando correctamente
    this.load.on('filecomplete-spritesheet-penguin_sheet', () => {
      // Sprite sheet cargado correctamente
    });

    this.load.on('fileerror', (key, file, error) => {
      if (key === 'penguin_sheet') {
        console.error('❌ Error al cargar el sprite sheet del pingüino:', error);
      }
    });

    // Placeholders temporales para elementos que aún no tienen gráficos personalizados
    this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
    this.load.image('yeti', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    // Mantenemos la imagen estática como fallback
    this.load.image('penguin', 'https://labs.phaser.io/assets/sprites/phaser-ship.png');
    this.load.image('flamingo', 'https://labs.phaser.io/assets/sprites/asteroids_ship.png');
    this.load.image('button', 'https://labs.phaser.io/assets/sprites/button-bg.png');

    // Tiempo mínimo de carga (para simular carga con pocos assets)
    this.simulateLoading();
  }

  /**
   * Carga los archivos de audio
   */
  loadAudioFiles() {
    console.log('🎵 Iniciando carga de archivos de audio...');

    // Música principal del juego
    this.load.audio('music_main', 'assets/audio/music_main.mp3');

    // Música del menú
    this.load.audio('music_menu', 'assets/audio/music_menu.mp3');

    // Música de game over
    this.load.audio('music_gameover', 'assets/audio/music_gameover.mp3');

    // Efectos de sonido
    this.load.audio('sfx_button', 'assets/audio/sfx_button.ogg');
    this.load.audio('sfx_launch', 'assets/audio/sfx_launch.ogg');
    this.load.audio('sfx_hit', 'assets/audio/sfx_hit.ogg');
    this.load.audio('sfx_land', 'assets/audio/sfx_land.ogg');
    this.load.audio('sfx_slide', 'assets/audio/sfx_slide.ogg');
    this.load.audio('sfx_record', 'assets/audio/sfx_record.ogg');
    this.load.audio('sfx_angle_power', 'assets/audio/sfx_angle_power.ogg');

    // Evento cuando un archivo de audio ha sido cargado
    this.load.on('filecomplete', (key, type, data) => {
      if (type === 'audio') {
        console.log(`✅ Audio cargado correctamente: ${key}`);
      }
    });

    // Verificar error en carga de archivos de audio
    this.load.on('fileerror', (key, file, error) => {
      if (key.startsWith('music_') || key.startsWith('sfx_')) {
        console.error(`❌ Error al cargar el audio "${key}":`, error);
        console.error(`📂 Ruta del archivo: ${file.url}`);
      }
    });
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
