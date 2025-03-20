import Phaser from 'phaser';

/**
 * Clase que maneja la pantalla de fin de juego
 */
export default class GameOverScreen {
  /**
   * Constructor de la clase GameOverScreen
   * @param {Phaser.Scene} scene - La escena a la que pertenece la pantalla
   */
  constructor(scene) {
    this.scene = scene;
    this.container = null;
    this.buttons = [];
    this.isVisible = false;
  }

  /**
   * Muestra la pantalla de fin de juego
   * @param {Object} config - Configuración de la pantalla
   * @param {number} config.totalDistance - Distancia total recorrida
   * @param {number} config.bestDistance - Mejor distancia histórica
   * @param {Function} config.onRestart - Función a llamar cuando se hace clic en "Volver a Jugar"
   * @param {Function} config.onMainMenu - Función a llamar cuando se hace clic en "Menú Principal"
   */
  show(config) {
    // Guardar las referencias a los callbacks
    this.onRestartCallback = config.onRestart;
    this.onMainMenuCallback = config.onMainMenu;

    // Activar flag
    this.isVisible = true;

    const { totalDistance, bestDistance } = config;
    const isNewRecord = totalDistance > bestDistance;

    // Tamaño del canvas
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    // Limpiar elementos previos si existen
    this.destroy();

    // Crear nuevo contenedor
    this.container = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(100);

    // Fondo oscuro semitransparente para toda la pantalla
    this.overlay = this.scene.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7)
      .setScrollFactor(0);
    this.container.add(this.overlay);

    // Calcular altura del panel
    const panelHeight = isNewRecord ? 440 : 380;
    const panelWidth = 440;

    // Crear el panel principal
    this.panel = this.scene.add.rectangle(width/2, height/2, panelWidth, panelHeight, 0x104080, 0.95)
      .setStrokeStyle(4, 0xffdd00, 1);
    this.container.add(this.panel);

    // Título
    const title = this.scene.add.text(width/2, height/2 - panelHeight/2 + 50, 'JUEGO TERMINADO', {
      fontFamily: 'Impact',
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5);
    this.container.add(title);

    // Texto de distancia
    const distanceLabel = this.scene.add.text(width/2, height/2 - 70, 'DISTANCIA TOTAL', {
      fontFamily: 'Impact',
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    this.container.add(distanceLabel);

    const distanceText = this.scene.add.text(width/2, height/2 - 30, totalDistance + ' m', {
      fontFamily: 'Impact',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#104080',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5);
    this.container.add(distanceText);

    // Añadir mensaje de récord si es necesario
    if (isNewRecord) {
      // Fondo del récord
      const recordBg = this.scene.add.rectangle(width/2, height/2 + 30, 300, 40, 0x000000, 0.4)
        .setStrokeStyle(2, 0xffdd00);
      this.container.add(recordBg);

      // Texto del récord
      const recordText = this.scene.add.text(width/2, height/2 + 30, '¡NUEVO RÉCORD!', {
        fontFamily: 'Impact',
        fontSize: '32px',
        color: '#ffdd00',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center'
      }).setOrigin(0.5);
      this.container.add(recordText);

      // Animación para el texto
      this.scene.tweens.add({
        targets: recordText,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1
      });

      // Brillo
      const glow = this.scene.add.graphics();
      glow.fillStyle(0xffdd00, 0.2);
      glow.fillCircle(width/2, height/2 - 30, 110);
      this.container.add(glow);

      // Asegurar que el texto de distancia esté encima del brillo
      this.container.bringToTop(distanceText);

      // Efecto de destello
      this.scene.tweens.add({
        targets: glow,
        alpha: { from: 0.3, to: 0 },
        duration: 800,
        yoyo: true,
        repeat: -1
      });
    }

    // Determinar la posición vertical de los botones
    const buttonY = isNewRecord ? height/2 + 90 : height/2 + 50;

    // BOTÓN VOLVER A JUGAR - implementado directamente sin ButtonFactory
    this.createSimpleButton(width/2, buttonY, 'VOLVER A JUGAR', () => {
      this.handleRestart();
    });

    // BOTÓN MENÚ PRINCIPAL - implementado directamente sin ButtonFactory
    this.createSimpleButton(width/2, buttonY + 70, 'MENÚ PRINCIPAL', () => {
      this.handleMainMenu();
    });

    // Animar entrada
    this.container.setScale(0.5);
    this.container.setAlpha(0);

    this.scene.tweens.add({
      targets: this.container,
      scale: 1,
      alpha: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });
  }

  /**
   * Crea un botón simple directamente en la escena
   */
  createSimpleButton(x, y, text, callback) {
    // Grupo para el botón
    const width = 240;
    const height = 60;

    // Fondo del botón
    const bg = this.scene.add.rectangle(x, y, width, height, 0x1e90ff)
      .setStrokeStyle(3, 0xffdd00)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        bg.setFillStyle(0x3aa3ff);
        buttonText.setScale(1.05);
      })
      .on('pointerout', () => {
        bg.setFillStyle(0x1e90ff);
        buttonText.setScale(1);
      })
      .on('pointerdown', () => {
        bg.setFillStyle(0x0c6cbb);
        buttonText.setScale(0.95);
      })
      .on('pointerup', () => {
        bg.setFillStyle(0x1e90ff);
        buttonText.setScale(1);

        if (this.isVisible && callback) {
          callback();
        }
      });

    // Efecto de esquinas brillantes
    const cornerSize = 8;
    this.scene.add.rectangle(x - width/2, y - height/2, cornerSize, cornerSize, 0xffffff, 0.8);
    this.scene.add.rectangle(x + width/2 - cornerSize, y - height/2, cornerSize, cornerSize, 0xffffff, 0.8);
    this.scene.add.rectangle(x - width/2, y + height/2 - cornerSize, cornerSize, cornerSize, 0xffffff, 0.8);
    this.scene.add.rectangle(x + width/2 - cornerSize, y + height/2 - cornerSize, cornerSize, cornerSize, 0xffffff, 0.8);

    // Texto del botón
    const buttonText = this.scene.add.text(x, y, text, {
      fontFamily: 'Impact',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#104080',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5);

    // Añadir al contenedor principal
    this.container.add([bg, buttonText]);

    // Guardar referencia al botón
    this.buttons.push({ bg, text: buttonText, callback });

    return { bg, text: buttonText };
  }

  /**
   * Manejador para el botón de reinicio
   */
  handleRestart() {
    if (!this.isVisible) return;

    // Desactivar la pantalla
    this.isVisible = false;

    // Ocultar la pantalla
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      scale: 0.8,
      duration: 200,
      onComplete: () => {
        // Asegurarse que el modal está cerrado antes de reiniciar
        if (this.scene.stateManager) {
          this.scene.stateManager.setModalState(false);
        }

        // Destruir el contenedor
        this.destroy();

        // Llamar al callback original después de un breve retraso
        this.scene.time.delayedCall(50, () => {
          if (this.onRestartCallback) {
            this.onRestartCallback();
          }
        });
      }
    });
  }

  /**
   * Manejador para el botón de menú principal
   */
  handleMainMenu() {
    if (!this.isVisible) return;

    // Desactivar la pantalla
    this.isVisible = false;

    // Ocultar la pantalla
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      scale: 0.8,
      duration: 200,
      onComplete: () => {
        // Asegurarse que el modal está cerrado antes de ir al menú
        if (this.scene.stateManager) {
          this.scene.stateManager.setModalState(false);
        }

        // Destruir el contenedor
        this.destroy();

        // Llamar al callback original después de un breve retraso
        this.scene.time.delayedCall(50, () => {
          if (this.onMainMenuCallback) {
            this.onMainMenuCallback();
          }
        });
      }
    });
  }

  /**
   * Destruye todos los elementos de la pantalla
   */
  destroy() {
    if (this.container) {
      // Asegurarse que todos los tweens se detengan
      if (this.scene.tweens) {
        const elements = this.container.getAll();
        elements.forEach(element => {
          this.scene.tweens.killTweensOf(element);
        });
      }

      this.container.destroy();
      this.container = null;
    }

    this.buttons = [];
  }

  /**
   * Oculta la pantalla
   */
  hide() {
    // Ya no es necesario, hide se maneja dentro de los handlers de botones
    if (this.isVisible) {
      this.isVisible = false;

      if (this.scene.stateManager) {
        this.scene.stateManager.setModalState(false);
      }

      this.destroy();
    }
  }
}
