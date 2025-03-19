import Phaser from 'phaser';

/**
 * Clase que maneja la barra de potencia en el juego
 */
export default class PowerBar {
  /**
   * Constructor de la clase PowerBar
   * @param {Phaser.Scene} scene - La escena a la que pertenece la barra de potencia
   * @param {Object} config - Configuración de la barra de potencia
   */
  constructor(scene, config = {}) {
    this.scene = scene;
    this.graphics = scene.add.graphics().setScrollFactor(0);
    this.graphics.setVisible(false);

    // Propiedades de configuración con valores por defecto
    this.config = {
      barWidth: config.barWidth || 15,
      barHeight: config.barHeight || 150,
      barX: config.barX || (scene.scale.width - 35),
      barY: config.barY || 300,
      padding: config.padding || 4,
      colors: config.colors || [0x00ff00, 0xffff00, 0xff0000] // verde, amarillo, rojo
    };

    // Valores internos
    this.power = 0;
    this.powerText = null;
    this.percentageTexts = [];
    this.powerAnimation = null;
  }

  /**
   * Muestra la barra de potencia y comienza la animación
   * @param {Function} onUpdate - Función a llamar cuando se actualiza el valor de potencia
   */
  startPowerSelection(onUpdate) {
    this.graphics.setVisible(true);

    // Si hay una animación previa, la detenemos
    if (this.powerAnimation) {
      this.powerAnimation.stop();
    }

    // Crear la animación para la barra de potencia
    this.powerAnimation = this.scene.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 1500,
      ease: 'Linear',
      repeat: -1,
      yoyo: true,
      onUpdate: () => {
        // Actualizar la potencia
        this.power = this.powerAnimation.getValue() / 100;

        // Actualizar el gráfico
        this.update();

        // Llamar al callback si está definido
        if (onUpdate) {
          onUpdate(this.power);
        }
      }
    });

    return this;
  }

  /**
   * Detiene la animación y oculta la barra de potencia
   */
  endPowerSelection() {
    // Detener la animación
    if (this.powerAnimation) {
      this.powerAnimation.stop();
      this.powerAnimation = null;
    }

    // Ocultar la barra
    this.graphics.setVisible(false);

    // Limpiar textos
    this.clearTexts();

    return this.power;
  }

  /**
   * Limpia los textos de la barra de potencia
   */
  clearTexts() {
    // Eliminar el texto de potencia si existe
    if (this.powerText) {
      this.powerText.destroy();
      this.powerText = null;
    }

    // Eliminar textos de porcentaje si existen
    if (this.percentageTexts && this.percentageTexts.length > 0) {
      this.percentageTexts.forEach(text => {
        if (text && text.destroy) text.destroy();
      });
      this.percentageTexts = [];
    }
  }

  /**
   * Actualiza la visualización de la barra de potencia
   */
  update() {
    const { barWidth, barHeight, barX, barY, padding, colors } = this.config;

    // Limpiar el gráfico
    this.graphics.clear();

    // Dibujar el marco de la barra (fondo)
    this.graphics.fillStyle(0x333333, 0.9);
    this.graphics.fillRect(barX - padding, barY - barHeight / 2 - padding, barWidth + padding * 2, barHeight + padding * 2);

    // Dibujar el fondo de la barra
    this.graphics.fillStyle(0x666666, 1);
    this.graphics.fillRect(barX, barY - barHeight / 2, barWidth, barHeight);

    // Gradiente de color para la barra
    const sections = colors.length;
    const sectionHeight = barHeight / sections;

    // Dibujar las secciones de colores
    for (let i = 0; i < sections; i++) {
      this.graphics.fillStyle(colors[i], 1);
      this.graphics.fillRect(
        barX,
        barY - barHeight / 2 + (i * sectionHeight),
        barWidth,
        sectionHeight
      );
    }

    // Posición actual del indicador (con efecto de fill de abajo hacia arriba)
    const fillHeight = barHeight * this.power;

    // Rellenar la barra desde abajo hasta el nivel actual
    this.graphics.fillStyle(0xaaaaaa, 0.3);
    this.graphics.fillRect(
      barX,
      barY + barHeight / 2 - fillHeight,
      barWidth,
      fillHeight
    );

    // Dibujar el indicador (línea horizontal que muestra la posición actual)
    const indicatorY = barY + barHeight / 2 - fillHeight;
    this.graphics.fillStyle(0xffffff, 1);
    this.graphics.fillRect(
      barX - 10,
      indicatorY - 2,
      barWidth + 20,
      4
    );

    // Dibujar triángulos a los lados del indicador
    this.graphics.fillStyle(0xffffff, 1);

    // Triángulo izquierdo
    this.graphics.beginPath();
    this.graphics.moveTo(barX - 15, indicatorY);
    this.graphics.lineTo(barX - 5, indicatorY - 6);
    this.graphics.lineTo(barX - 5, indicatorY + 6);
    this.graphics.closePath();
    this.graphics.fillPath();

    // Triángulo derecho
    this.graphics.beginPath();
    this.graphics.moveTo(barX + barWidth + 15, indicatorY);
    this.graphics.lineTo(barX + barWidth + 5, indicatorY - 6);
    this.graphics.lineTo(barX + barWidth + 5, indicatorY + 6);
    this.graphics.closePath();
    this.graphics.fillPath();

    // Añadir marcas de nivel en la barra
    this.graphics.lineStyle(2, 0xffffff, 0.5);
    for (let i = 0; i <= 10; i++) {
      const markY = barY + barHeight / 2 - (i * barHeight / 10);
      const markWidth = (i % 5 === 0) ? 10 : 5; // Marcas más largas cada 50%

      this.graphics.beginPath();
      this.graphics.moveTo(barX - markWidth, markY);
      this.graphics.lineTo(barX, markY);
      this.graphics.strokePath();

      this.graphics.beginPath();
      this.graphics.moveTo(barX + barWidth, markY);
      this.graphics.lineTo(barX + barWidth + markWidth, markY);
      this.graphics.strokePath();
    }

    // Actualizar el texto con el porcentaje
    if (this.powerText) {
      this.powerText.destroy();
    }

    this.powerText = this.scene.add.text(barX + barWidth / 2, barY - barHeight / 2 - 20, `${Math.round(this.power * 100)}%`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0);
  }

  /**
   * Destruye la barra de potencia y limpia sus recursos
   */
  destroy() {
    this.clearTexts();

    if (this.powerAnimation) {
      this.powerAnimation.stop();
      this.powerAnimation = null;
    }

    if (this.graphics) {
      this.graphics.destroy();
      this.graphics = null;
    }
  }
}
