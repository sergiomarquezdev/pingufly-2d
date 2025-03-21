/**
 * Configuración de animaciones para el pingüino
 * Define todas las secuencias de animación necesarias para el juego
 */

const penguinAnimations = {
  // Animación para el estado idle (estático)
  idle: {
    key: 'penguin_idle',
    frames: [40,41,42],
    frameRate: 5,
    repeat: -1,
    flipX: true
  },

  // Animación para la preparación del lanzamiento
  prepare: {
    key: 'penguin_prepare',
    frames: [34,35,36,37,38],
    frameRate: 8,
    repeat: 0,
    flipX: true
  },

  // Animación para el momento del lanzamiento
  launch: {
    key: 'penguin_launch',
    frames: [24,25,26,27,28],
    frameRate: 10,
    repeat: 0,
    flipX: true
  },

  // Animación para el vuelo por el aire
  fly: {
    key: 'penguin_fly',
    frames: [28,29],
    frameRate: 8,
    repeat: -1,
    flipX: true
  },

  // Animación para el impacto con el suelo
  impact: {
    key: 'penguin_impact',
    frames: [30,31],
    frameRate: 12,
    repeat: 0,
    flipX: true
  },

  // Animación para el deslizamiento en el hielo
  slide: {
    key: 'penguin_slide',
    frames: [72,73,74,75],
    frameRate: 8,
    repeat: -1,
    flipX: true
  },

  // Animación para cuando se detiene
  stop: {
    key: 'penguin_stop',
    frames: [30,31],
    frameRate: 6,
    repeat: 0,
    flipX: true
  },

  // Animación para la celebración (buena distancia)
  celebrate: {
    key: 'penguin_celebrate',
    frames: [50,51],
    frameRate: 6,
    repeat: 5,
    flipX: true
  },

  // Animación para cuando está mareado (mal rendimiento)
  dizzy: {
    key: 'penguin_dizzy',
    frames: [38, 39, 40],
    frameRate: 5,
    repeat: 0,
    flipX: true
  }
};

export default penguinAnimations;
