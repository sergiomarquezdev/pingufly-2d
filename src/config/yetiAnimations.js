/**
 * Configuración de animaciones para el yeti
 * Define todas las secuencias de animación necesarias para el juego
 */

const yetiAnimations = {
  // Animación para la aparición del yeti
  appear: {
    key: 'yeti_appear',
    frames: [28,20,30,31,1],
    frameRate: 8,
    repeat: 0,
    flipX: true
  },

  // Animación para el estado idle (estático)
  idle: {
    key: 'yeti_idle',
    frames: [0,1,2,3,4,5,6,7],
    frameRate: 6,
    repeat: -1,
    flipX: true
  },

  // Animación para la preparación del lanzamiento
  prepare: {
    key: 'yeti_prepare',
    frames: [44, 45, 46, 47, 0, 1, 2, 3],
    frameRate: 6,
    repeat: 0,
    flipX: true
  },

  // Animación para el momento del lanzamiento
  launch: {
    key: 'yeti_launch',
    frames: [16, 41, 42, 43],
    frameRate: 10,
    repeat: 0,
    flipX: true
  }
};

export default yetiAnimations;
