import Phaser from 'phaser';

/**
 * Clase que implementa un botón de configuración con un icono de engranaje
 */
export default class SettingsButton {
  /**
   * Constructor de la clase SettingsButton
   * @param {Phaser.Scene} scene - La escena a la que pertenece el botón
   * @param {Function} onClick - Función a ejecutar cuando se hace clic en el botón
   */
  constructor(scene, onClick) {
    this.scene = scene;
    this.onClick = onClick;
    this.container = null;
    this.circleBg = null;
    this.glow = null;
    this.isPressed = false;
  }

  /**
   * Crea el botón de configuración en la escena
   * @param {number} x - Posición X opcional (por defecto 40)
   * @param {number} y - Posición Y opcional (por defecto 40)
   * @returns {Phaser.GameObjects.Container} - El contenedor del botón
   */
  create(x = 25, y = 25) {
    // Crear contenedor para el botón
    this.container = this.scene.add.container(x, y);
    this.container.setScrollFactor(0); // Fijo en la cámara
    this.container.setDepth(100); // Alta profundidad para estar por encima

    const buttonRadius = 20;

    // Círculo de fondo con gradiente
    this.circleBg = this.scene.add.graphics();
    this.circleBg.fillGradientStyle(0x2c85c1, 0x2c85c1, 0x88c1dd, 0x88c1dd, 0.9);
    this.circleBg.fillCircle(0, 0, buttonRadius);
    this.circleBg.lineStyle(3, 0xffaa00, 1);
    this.circleBg.strokeCircle(0, 0, buttonRadius);

    // Efecto de brillo interno
    this.glow = this.scene.add.graphics();
    this.glow.fillStyle(0xe8f4fc, 0.3);
    this.glow.fillCircle(0, 0, buttonRadius - 5);

    // Icono de engranaje
    const gearIcon = this.scene.add.image(0, 0, 'gear_icon')
      .setScale(0.5)
      .setTint(0xffffff);

    // Agregar objetos al contenedor
    this.container.add([this.circleBg, this.glow, gearIcon]);

    // Hacer interactivo
    const hitArea = this.scene.add.circle(0, 0, buttonRadius)
      .setInteractive({ useHandCursor: true });

    this.container.add(hitArea);

    // Eventos de interacción
    hitArea.on('pointerover', () => this.onPointerOver());
    hitArea.on('pointerout', () => this.onPointerOut());
    hitArea.on('pointerdown', (pointer, localX, localY, event) => {
      event.stopPropagation();
      this.onPointerDown();
    });
    hitArea.on('pointerup', (pointer, localX, localY, event) => {
      event.stopPropagation();
      this.onPointerUp();
    });

    return this.container;
  }

  /**
   * Cuando el puntero pasa sobre el botón
   * @private
   */
  onPointerOver() {
    this.circleBg.clear();
    this.circleBg.fillGradientStyle(0x3997d3, 0x3997d3, 0x99d2ee, 0x99d2ee, 0.9);
    this.circleBg.fillCircle(0, 0, 20);
    this.circleBg.lineStyle(3, 0xffaa00, 1);
    this.circleBg.strokeCircle(0, 0, 20);

    this.glow.clear();
    this.glow.fillStyle(0xe8f4fc, 0.5);
    this.glow.fillCircle(0, 0, 15);

    this.container.setScale(1.05);
  }

  /**
   * Cuando el puntero sale del botón
   * @private
   */
  onPointerOut() {
    if (!this.isPressed) {
      this.circleBg.clear();
      this.circleBg.fillGradientStyle(0x2c85c1, 0x2c85c1, 0x88c1dd, 0x88c1dd, 0.9);
      this.circleBg.fillCircle(0, 0, 20);
      this.circleBg.lineStyle(3, 0xffaa00, 1);
      this.circleBg.strokeCircle(0, 0, 20);

      this.glow.clear();
      this.glow.fillStyle(0xe8f4fc, 0.3);
      this.glow.fillCircle(0, 0, 15);

      this.container.setScale(1);
    }
  }

  /**
   * Cuando se presiona el botón
   * @private
   */
  onPointerDown() {
    this.isPressed = true;
    this.container.setScale(0.95);

    // Reproducir sonido de botón si está disponible
    if (this.scene.soundManager) {
      this.scene.soundManager.playSfx('sfx_button');
    }
  }

  /**
   * Cuando se libera el botón
   * @private
   */
  onPointerUp() {
    this.isPressed = false;
    this.container.setScale(1);

    if (this.onClick) {
      this.onClick();
    }
  }

  /**
   * Establece la visibilidad del botón
   * @param {boolean} visible - Si el botón debe ser visible
   */
  setVisible(visible) {
    if (this.container) {
      this.container.setVisible(visible);
    }
    return this;
  }

  /**
   * Destruye el botón y libera recursos
   */
  destroy() {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}
