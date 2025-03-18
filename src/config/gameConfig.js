/**
 * Configuración principal del juego Pingu GO!
 * Define los parámetros básicos para la inicialización de Phaser
 */
const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB', // Color del cielo
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 0.5 }, // Gravedad más suave que la normal para tiros más largos
      debug: false
    }
  },
  // Desactivar el menú contextual para mejorar la experiencia de juego
  disableContextMenu: true,
  // Configuración para dispositivos móviles
  input: {
    activePointers: 1,
    touch: {
      capture: true
    }
  },
  // Configuración para mejorar rendimiento
  render: {
    pixelArt: false, // Mejor calidad para arte no pixelado
    antialias: true,
    roundPixels: false,
    transparent: false,
    clearBeforeRender: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    failIfMajorPerformanceCaveat: false,
    powerPreference: 'high-performance'
  },
  // Activar FPS solo en desarrollo
  fps: {
    min: 30,
    target: 60,
    forceSetTimeOut: false,
    deltaHistory: 10
  },
  // Inicialmente no definimos escenas aquí, las cargaremos dinámicamente
  // Versión del juego para registro y depuración
  gameVersion: '1.0.0'
};

export default gameConfig;
