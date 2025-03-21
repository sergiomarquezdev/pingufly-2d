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
    this.animations = []; // Array para almacenar las animaciones de las nubes

    // Configuraciones por defecto
    this.config = {
      cloudCount: config.cloudCount || 8,
      minScrollFactor: config.minScrollFactor || 0.1,
      maxScrollFactor: config.maxScrollFactor || 0.3,
      minSpeed: config.minSpeed || 5000,
      maxSpeed: config.maxSpeed || 18000,
      minScale: config.minScale || 0.3,
      maxScale: config.maxScale || 0.9,
      minAltitude: config.minAltitude || 0,
      maxAltitude: config.maxAltitude || 200,
      visibilityMargin: config.visibilityMargin || 800,  // Aumentado de 300 a 800 para mayor margen
    };

    // Detector simple de dispositivo móvil
    this.isMobile = this.detectMobileDevice();

    // Reducir cantidad de nubes en dispositivos móviles
    if (this.isMobile) {
      this.config.cloudCount = Math.floor(this.config.cloudCount * 0.6);
    }

    // Valores de control para depuración
    this.debug = {
      lastCameraX: 0,
      cameraMoveSpeed: 0
    };
  }

  /**
   * Detector simple de dispositivo móvil basado en dimensiones de pantalla y user agent
   */
  detectMobileDevice() {
    // Verificar si estamos en un navegador
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }

    // Detección por user agent
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

    // Detección por tamaño de pantalla
    const smallScreen = window.innerWidth < 768;

    return mobileRegex.test(userAgent) || smallScreen;
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
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Configuración de nubes para diferentes capas (fondo, medio, primer plano)
    const cloudConfigs = [
      { key: 'cloud_01', scale: { min: 0.3, max: 0.5 }, depth: -9, scrollFactor: 0.1, alpha: 0.7, speed: { min: 5000, max: 8000 } },
      { key: 'cloud_02', scale: { min: 0.4, max: 0.6 }, depth: -8, scrollFactor: 0.2, alpha: 0.75, speed: { min: 8000, max: 12000 } },
      { key: 'cloud_03', scale: { min: 0.6, max: 0.9 }, depth: -7, scrollFactor: 0.3, alpha: 0.8, speed: { min: 12000, max: 18000 } }
    ];

    // Para dispositivos móviles, usar menos configuraciones y valores más eficientes
    if (this.isMobile) {
      // Usar solo 2 tipos de nubes en móviles
      const mobileCloudConfigs = [
        { key: 'cloud_01', scale: { min: 0.3, max: 0.5 }, depth: -9, scrollFactor: 0.1, alpha: 0.7, speed: { min: 8000, max: 12000 } },
        { key: 'cloud_03', scale: { min: 0.6, max: 0.9 }, depth: -7, scrollFactor: 0.3, alpha: 0.8, speed: { min: 15000, max: 22000 } }
      ];

      // Reemplazar configuración
      for (let i = 0; i < cloudConfigs.length && i < mobileCloudConfigs.length; i++) {
        cloudConfigs[i] = mobileCloudConfigs[i];
      }
    }

    // Crear nubes basadas en la configuración
    for (let i = 0; i < this.config.cloudCount; i++) {
      // Elegir configuración de nube aleatoria
      const configIndex = Phaser.Math.Between(0, cloudConfigs.length - 1);
      const cloudConfig = cloudConfigs[configIndex];

      // Calcular posición inicial de la nube
      const x = Phaser.Math.Between(-200, width + 200);
      const y = Phaser.Math.Between(50, height * 0.5);

      // Escala aleatoria dentro de los límites configurados
      const scale = Phaser.Math.FloatBetween(
        cloudConfig.scale.min,
        cloudConfig.scale.max
      );

      // Crear la nube con propiedades específicas
      const cloud = this.scene.add.image(x, y, cloudConfig.key)
        .setScale(scale)
        .setAlpha(cloudConfig.alpha)
        .setDepth(cloudConfig.depth)
        .setScrollFactor(cloudConfig.scrollFactor);

      this.clouds.push(cloud);

      // Crear animación horizontal para la nube
      // Móviles: movimiento más lento y menos procesamiento de animación
      const duration = Phaser.Math.Between(
        cloudConfig.speed.min,
        cloudConfig.speed.max
      );

      const tween = this.scene.tweens.add({
        targets: cloud,
        x: width + 400, // Mover fuera de la pantalla a la derecha
        ease: 'Linear',
        duration: duration,
        onComplete: () => {
          // Cuando la nube salga de la pantalla, reposicionarla a la izquierda
          cloud.x = -200;

          // Reiniciar la animación con un retraso aleatorio
          this.scene.tweens.add({
            targets: cloud,
            x: width + 400,
            ease: 'Linear',
            delay: Phaser.Math.Between(0, 2000),
            duration: duration,
            repeat: -1
          });
        }
      });

      this.animations.push(tween);
    }

    return this.clouds;
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
