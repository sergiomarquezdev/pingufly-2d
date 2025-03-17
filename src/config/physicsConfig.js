/**
 * Configuración de física para el juego Yeti Sports 5: Flamingo Drive.
 * Especifica parámetros de física para Matter.js que controlarán
 * el comportamiento del pingüino durante su vuelo.
 */
const physicsConfig = {
  // Configuración del mundo de física
  world: {
    gravity: {
      x: 0,
      y: 0.5 // Gravedad más suave para trayectorias más largas
    },
    bounds: {
      width: 10000, // Área amplia para permitir vuelos largos
      height: 1000
    }
  },

  // Propiedades del pingüino
  penguin: {
    density: 0.001, // Densidad baja para vuelos más largos
    frictionAir: 0.01, // Resistencia al aire baja para mayor distancia
    restitution: 0.6, // Rebote moderado
    friction: 0.05, // Fricción baja con superficie
    mass: 1, // Masa base del pingüino
    // Velocidades máximas para evitar comportamientos extraños
    maxVelocity: {
      x: 50,
      y: 50
    }
  },

  // Fuerza del golpe aplicada por el yeti
  hitForce: {
    min: 0.05, // Fuerza mínima (golpe débil)
    max: 0.25, // Fuerza máxima (golpe perfecto)
    multiplier: 50 // Multiplicador aplicado al valor de fuerza
  },

  // Configuración de ángulos
  angle: {
    min: 10, // Ángulo mínimo en grados
    max: 80, // Ángulo máximo en grados
    default: 45 // Ángulo por defecto
  },

  // Configuración de colisiones
  collision: {
    ground: {
      friction: 0.2,
      restitution: 0.3
    }
  },

  // Factores de penalización/bonificación para la distancia
  factors: {
    airTime: 1.0, // Multiplicador por tiempo en el aire
    bounceFactor: 0.7 // Factor de penalización por rebote
  }
};

export default physicsConfig;
