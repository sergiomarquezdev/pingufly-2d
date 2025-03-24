/**
 * Configuración de animaciones para el yeti
 * Define todas las secuencias de animación necesarias para el juego
 */

const yetiAnimations = {
  // Animación para la aparición del yeti
  appear: {
    key: 'yeti_appear',
    frames: [29, 30, 31, 32, 1],
    frameRate: 8,
    repeat: 0,
    flipX: true
  },

  // Animación para el estado idle (estático)
  idle: {
    key: 'yeti_idle',
    frames: [1, 2, 3, 4, 5, 6, 7, 8],
    frameRate: 6,
    repeat: -1,
    flipX: true
  },

  // Animación para la preparación del lanzamiento
  prepare: {
    key: 'yeti_prepare',
    frames: [45, 46, 47, 48, 1, 2, 3, 4],
    frameRate: 6,
    repeat: 0,
    flipX: true
  },

  // Animación para el momento del lanzamiento
  launch: {
    key: 'yeti_launch',
    frames: [17, 42],
    frameRate: 10,
    repeat: 0,
    flipX: true
  }
};

export default yetiAnimations;
