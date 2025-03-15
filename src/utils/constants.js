// Fases del juego
export const GAME_PHASES = {
  WAITING: 'waiting',
  PENGUIN_FALLING: 'penguin_falling',
  YETI_HITTING: 'yeti_hitting',
  PENGUIN_FLYING: 'penguin_flying',
  GAME_OVER: 'game_over'
};

// Constantes físicas
export const PHYSICS = {
  GRAVITY: 9.8,
  FRICTION: 0.95,
  AIR_RESISTANCE: 0.99,
  GROUND_FRICTION: 0.98,
  MAX_LAUNCH_FORCE: 30,
  MIN_LAUNCH_FORCE: 5,
  PENGUIN_MASS: 1,
  OPTIMAL_HIT_ZONE_SIZE: 0.5,
  PENGUIN_STOPPING_THRESHOLD: 0.01
};

// Constantes de posición
export const POSITIONS = {
  YETI_X: 5,
  YETI_Y: 0,
  YETI_Z: 2,
  PENGUIN_START_X: 8,
  PENGUIN_START_Y: 11.3,
  PENGUIN_START_Z: 0,
  GROUND_Y: -0.5
};

// Constantes para cámara
export const CONSTANTS = {
  CAMERA_INITIAL_X: 0,
  CAMERA_INITIAL_Y: 3,
  CAMERA_INITIAL_Z: 15,
  CAMERA_LOOK_AT_X: 0,
  CAMERA_LOOK_AT_Y: 2,
  CAMERA_LOOK_AT_Z: 0,
  FOV: 80,
  NEAR: 0.1,
  FAR: 1000
};

// Colores
export const COLORS = {
  SKY: 0x87CEEB,
  SNOW: 0xFFFFFF,
  ICE: 0xADD8E6,
  YETI: 0xF0F0F0,
  PENGUIN_BODY: 0x000000,
  PENGUIN_BELLY: 0xFFFFFF,
  PENGUIN_BEAK: 0xFFA500,
  TREE: 0x228B22
};
