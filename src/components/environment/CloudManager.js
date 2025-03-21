/**
 * Clase CloudManager - Gestiona la creación, renderizado y movimiento de nubes
 * Permite desacoplar la lógica de nubes de la escena principal
 */
import Phaser from 'phaser';

export default class CloudManager {
  /**
   * Constructor
   * @param {Phaser.Scene} scene - La escena donde se añadirán las nubes
   * @param {Object} config - Configuración opcional
   */
  constructor(scene, config = {}) {
    this.scene = scene;
    this.clouds = [];
    this.updateEvent = null;

    // Configuraciones por defecto
    this.config = {
      cloudCount: config.cloudCount || 6,
      minScrollFactor: config.minScrollFactor || 0.2,
      maxScrollFactor: config.maxScrollFactor || 0.4,
      minSpeed: config.minSpeed || 0.5,
      maxSpeed: config.maxSpeed || 1.5,
      minScale: config.minScale || 0.6,
      maxScale: config.maxScale || 1.2,
      minAltitude: config.minAltitude || 0,
      maxAltitude: config.maxAltitude || 200,
      visibilityMargin: config.visibilityMargin || 800  // Aumentado de 300 a 800 para mayor margen
    };

    // Valores de control para depuración
    this.debug = {
      lastCameraX: 0,
      cameraMoveSpeed: 0
    };
  }

  /**
   * Crea las nubes iniciales y configura el evento de actualización
   */
  create() {
    this.createClouds();
    this.setupUpdateEvent();
    return this;
  }

  /**
   * Crea las nubes basadas en la configuración
   */
  createClouds() {
    const { cloudCount } = this.config;

    // Crear mapa de posiciones para evitar solapamientos
    const cloudPositions = [];

    // Anchos de pantalla para mejor distribución
    const screenWidth = this.scene.scale.width;
    const halfScreenWidth = screenWidth / 2;

    for (let i = 0; i < cloudCount; i++) {
      const cloudIndex = (i % 4) + 1; // 1-4
      const cloudKey = `cloud_0${cloudIndex}`;

      // Calcular un scrollFactor aleatorio para cada nube
      // Valores más estables y diferenciados para evitar vibración
      const scrollFactor = Phaser.Math.FloatBetween(
        this.config.minScrollFactor,
        this.config.maxScrollFactor
      );

      // Calcular posición X estratégica para una distribución más uniforme
      let x;

      if (i < 3) {
        // Primeras tres nubes distribuidas uniformemente a lo largo de la pantalla visible
        // Dividimos la pantalla en tres secciones y posicionamos en cada sección
        const sectionWidth = screenWidth / 3;
        const sectionCenter = sectionWidth * (i + 0.5);
        // Desviación controlada para evitar distribución demasiado uniforme
        const deviation = Phaser.Math.Between(-sectionWidth * 0.25, sectionWidth * 0.25);
        x = sectionCenter + deviation;
      } else if (i < 5) {
        // Nubes 4 y 5 fuera de pantalla a la izquierda, esperando entrar
        // Se escalonan para no entrar todas al mismo tiempo
        x = -300 - (i - 3) * 400;
      } else {
        // La última nube muy a la izquierda para crear una entrada más espaciada
        x = -1200;
      }

      // Distribuir nubes verticalmente con separación para evitar solapamientos
      const preferredY = (i % 3) * 60 + Phaser.Math.Between(50, 80);

      // Velocidades ligeramente diferentes para evitar agrupamientos
      // Nubes más cercanas (mayor scrollFactor) se mueven más rápido naturalmente
      const baseSpeed = Phaser.Math.FloatBetween(this.config.minSpeed, this.config.maxSpeed);
      // Ajustar velocidad según posición para crear movimiento natural
      const speedVariation = (i % 3) * 0.2;
      const speed = baseSpeed + speedVariation;

      // Escala variada pero no extrema
      const scale = Phaser.Math.FloatBetween(this.config.minScale, this.config.maxScale);

      // Crear nube
      const cloud = this.scene.add.image(x, preferredY, cloudKey)
        .setScale(scale)
        .setScrollFactor(scrollFactor)
        .setAlpha(0.9)
        .setDepth(-8);

      // Guardar propiedades personalizadas
      cloud.speed = speed;
      // Inicializar el flag de transición como false
      cloud.isTransitioning = false;
      // Añadir contador para evitar reciclado prematuro
      cloud.cyclesAfterReset = 0;

      // Guardar referencia
      this.clouds.push(cloud);
    }
  }

  /**
   * Configura el evento de actualización de nubes
   */
  setupUpdateEvent() {
    // Crear un evento de tiempo para actualizar las nubes
    // Usamos un intervalo fijo para evitar problemas de timing
    this.updateEvent = this.scene.time.addEvent({
      delay: 16, // 60 FPS aproximadamente
      callback: this.update,
      callbackScope: this,
      loop: true
    });

    // Guardar referencia a la cámara para evitar buscarla en cada frame
    this.camera = this.scene.cameras.main;
    this.debug.lastCameraX = this.camera.scrollX;

    // Configurar un evento para pausar la actualización de nubes cuando la escena está en pausa
    this.scene.events.on('pause', () => {
      if (this.updateEvent) {
        this.updateEvent.paused = true;
      }
    });

    // Configurar un evento para reanudar la actualización de nubes cuando la escena se reanuda
    this.scene.events.on('resume', () => {
      if (this.updateEvent) {
        this.updateEvent.paused = false;
      }
    });
  }

  /**
   * Actualiza la posición de las nubes y recicla las que salen de la pantalla
   * Este método debe llamarse en cada frame
   */
  update() {
    // Usar la referencia guardada para evitar buscar la cámara en cada frame
    const camera = this.camera || this.scene.cameras.main;
    const cameraLeftEdge = camera.scrollX;
    const cameraRightEdge = camera.scrollX + camera.width;

    // Calcular la velocidad de movimiento de la cámara
    this.debug.cameraMoveSpeed = Math.abs(cameraLeftEdge - this.debug.lastCameraX);
    this.debug.lastCameraX = cameraLeftEdge;

    // Ajustar el margen de visibilidad según la velocidad de la cámara
    // Cuando la cámara se mueve rápido, necesitamos márgenes más grandes
    let dynamicMargin = this.config.visibilityMargin;
    if (this.debug.cameraMoveSpeed > 1) {
        // Aumentar el margen proporcionalmente a la velocidad de la cámara
        dynamicMargin += this.debug.cameraMoveSpeed * 200;
    }

    this.clouds.forEach(cloud => {
      // Obtener el scrollFactor actual de la nube (con valor por defecto por seguridad)
      const scrollFactor = cloud.scrollFactor || 0.1;

      // Ajustar la velocidad según el scrollFactor - usando un factor más estable
      // Evitamos multiplicar por 2 que podría causar velocidades muy diferentes
      const adjustedSpeed = cloud.speed * (scrollFactor * 1.5);

      // Actualizar posición basada en la velocidad ajustada
      cloud.x += adjustedSpeed;

      // Incrementar el contador de ciclos después de un reset
      if (cloud.cyclesAfterReset < 60) { // Proteger por ~1 segundo
        cloud.cyclesAfterReset++;
        // Si está protegido contra reciclaje, saltar este ciclo
        if (cloud.cyclesAfterReset < 30) {
          return;
        }
      }

      // Cálculos para determinar si la nube debe ser reciclada
      const cloudWidth = cloud.width * cloud.scale;

      // Usamos valores más conservadores para los bordes
      // El borde izquierdo está ligeramente más a la izquierda para evitar transiciones bruscas
      const cloudLeftEdge = cloud.x - (cloudWidth * 0.65);
      // El borde derecho está ligeramente más a la derecha para evitar transiciones bruscas
      const cloudRightEdge = cloud.x + (cloudWidth * 0.65);

      // Margen de visibilidad dinámico para asegurar transiciones suaves
      const visibilityMargin = cloudWidth + dynamicMargin;

      // Verificar si la nube tiene marcada una transición en progreso para evitar doble reciclaje
      if (cloud.isTransitioning) {
        return; // No procesar más este ciclo si está en transición
      }

      // Reciclar si ha salido completamente por la derecha con un margen amplio
      if (cloudLeftEdge > cameraRightEdge + visibilityMargin) {
        // Marcar que está en transición para evitar múltiples reciclajes
        cloud.isTransitioning = true;

        // Usar un umbral extra para evitar reciclajes en el borde exacto
        const transitionThreshold = 50;

        // Verificar que realmente ha salido completamente (previene reposicionamientos prematuros)
        if (cloudLeftEdge > cameraRightEdge + visibilityMargin + transitionThreshold) {
          this.recycleCloudToLeft(cloud, cameraLeftEdge, visibilityMargin);

          // Programar la eliminación del flag de transición después de un breve tiempo
          // Esto evita que la nube sea reciclada nuevamente durante unos frames
          this.scene.time.delayedCall(200, () => {
            cloud.isTransitioning = false;
            // Reiniciar el contador de ciclos
            cloud.cyclesAfterReset = 0;
          });
        } else {
          cloud.isTransitioning = false; // No se cumplió el umbral extra, continuar normalmente
        }
      }
      // Recolocar si se ha quedado muy atrás con un margen amplio
      else if (cloudRightEdge < cameraLeftEdge - visibilityMargin) {
        // Marcar que está en transición
        cloud.isTransitioning = true;

        // Umbral extra para reposicionamiento
        const transitionThreshold = 50;

        // Verificar que realmente se ha quedado atrás (previene reposicionamientos prematuros)
        if (cloudRightEdge < cameraLeftEdge - visibilityMargin - transitionThreshold) {
          this.recycleCloudToRight(cloud, cameraRightEdge, visibilityMargin);

          // Programar la eliminación del flag de transición después de un breve tiempo
          this.scene.time.delayedCall(200, () => {
            cloud.isTransitioning = false;
            // Reiniciar el contador de ciclos
            cloud.cyclesAfterReset = 0;
          });
        } else {
          cloud.isTransitioning = false; // No se cumplió el umbral extra, continuar normalmente
        }
      }
    });
  }

  /**
   * Recicla una nube moviéndola al lado izquierdo del área visible
   * @param {Phaser.GameObjects.Image} cloud - La nube a reciclar
   * @param {number} cameraLeftEdge - Borde izquierdo de la cámara
   * @param {number} visibilityMargin - Margen de visibilidad
   */
  recycleCloudToLeft(cloud, cameraLeftEdge, visibilityMargin) {
    // Posicionamos la nube con un margen más grande para evitar apariciones abruptas
    // Distancia aleatoria más grande para distribuir mejor
    const randomOffset = Phaser.Math.Between(800, 1600); // Aumentado considerablemente

    // Aseguramos que se posiciona bien lejos de la pantalla
    cloud.x = cameraLeftEdge - visibilityMargin - randomOffset;

    // Actualizar propiedades con valores más estables
    this.randomizeCloudProperties(cloud);

    // Reiniciar el contador de ciclos para protección contra reciclaje prematuro
    cloud.cyclesAfterReset = 0;
  }

  /**
   * Recicla una nube moviéndola al lado derecho del área visible
   * @param {Phaser.GameObjects.Image} cloud - La nube a reciclar
   * @param {number} cameraRightEdge - Borde derecho de la cámara
   * @param {number} visibilityMargin - Margen de visibilidad
   */
  recycleCloudToRight(cloud, cameraRightEdge, visibilityMargin) {
    // Posicionamos la nube con un margen más grande para evitar apariciones abruptas
    // Distancia aleatoria más grande para distribuir mejor
    const randomOffset = Phaser.Math.Between(800, 1200); // Aumentado considerablemente

    // Aseguramos que se posiciona bien lejos de la pantalla
    cloud.x = cameraRightEdge + visibilityMargin + randomOffset;

    // Actualizar propiedades con valores más estables
    this.randomizeCloudProperties(cloud);

    // Reiniciar el contador de ciclos para protección contra reciclaje prematuro
    cloud.cyclesAfterReset = 0;
  }

  /**
   * Asigna propiedades aleatorias a una nube existente
   * @param {Phaser.GameObjects.Image} cloud - La nube a modificar
   */
  randomizeCloudProperties(cloud) {
    // Mantener el scrollFactor original para evitar cambios bruscos
    const originalScrollFactor = cloud.scrollFactor;

    // Mantener la altura cercana a la original para evitar saltos visuales
    const currentY = cloud.y;
    const minY = Math.max(this.config.minAltitude, currentY - 30);
    const maxY = Math.min(this.config.maxAltitude, currentY + 30);

    // Actualizar altura con un cambio más sutil
    cloud.y = Phaser.Math.Between(minY, maxY);

    // Escala y velocidad con rangos más acotados para evitar cambios drásticos
    const minScale = Math.max(this.config.minScale, cloud.scale * 0.8);
    const maxScale = Math.min(this.config.maxScale, cloud.scale * 1.2);
    cloud.setScale(Phaser.Math.FloatBetween(minScale, maxScale));

    // La velocidad nunca debe ser demasiado diferente de la anterior
    const currentSpeed = cloud.speed;
    const minSpeed = Math.max(this.config.minSpeed, currentSpeed * 0.8);
    const maxSpeed = Math.min(this.config.maxSpeed, currentSpeed * 1.2);
    cloud.speed = Phaser.Math.FloatBetween(minSpeed, maxSpeed);
  }

  /**
   * Destruye todos los recursos y detiene eventos
   */
  destroy() {
    // Destruir el evento de actualización
    if (this.updateEvent) {
      this.updateEvent.destroy();
      this.updateEvent = null;
    }

    // Limpiar los event listeners
    this.scene.events.off('pause');
    this.scene.events.off('resume');

    // Destruir cada nube
    this.clouds.forEach(cloud => {
      if (cloud && cloud.destroy) {
        cloud.destroy();
      }
    });

    // Limpiar el array de nubes
    this.clouds = [];

    // Limpiar referencia a la cámara
    this.camera = null;
  }
}
