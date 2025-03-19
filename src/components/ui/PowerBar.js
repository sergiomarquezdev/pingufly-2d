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
      colors: config.colors || [0xff0000, 0xffff00, 0x00ff00, 0xffff00, 0xff0000] // rojo, amarillo, verde, amarillo, rojo
    };

    // Valores internos
    this.animValue = 0; // Valor de la animación (0-1)
    this.power = 0;     // Valor real de potencia (0-1)
    this.powerText = null;
    this.percentageTexts = [];
    this.powerAnimation = null;
    this.direction = -1;  // 1: hacia abajo, -1: hacia arriba
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

    // Crear la animación para la barra de potencia con efecto rebote
    this.powerAnimation = this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 500,
      ease: 'Linear',
      repeat: -1,
      yoyo: true,  // Rebote de la animación
      onUpdate: () => {
        // Obtener el valor de la animación (0-1)
        this.animValue = this.powerAnimation.getValue();

        // Calcular el poder real (0-1) basado en la distancia al punto central (0.5)
        // Cuando animValue = 0.5, power = 1.0 (máximo)
        // Cuando animValue = 0 o 1, power = 0 (mínimo)
        this.power = 1 - Math.abs(this.animValue - 0.5) * 2;

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

    // Dibujar secciones de colores (simétrico desde los bordes hacia el centro)
    const sections = colors.length;
    const sectionHeight = barHeight / sections;

    for (let i = 0; i < sections; i++) {
      this.graphics.fillStyle(colors[i], 1);
      this.graphics.fillRect(
        barX,
        barY - barHeight / 2 + (i * sectionHeight),
        barWidth,
        sectionHeight
      );
    }

    // Calcular la posición del indicador basado en animValue (no en power)
    const indicatorPosition = this.animValue;
    const indicatorY = barY - barHeight / 2 + (indicatorPosition * barHeight);

    // Dibujar el indicador (línea horizontal que muestra la posición actual)
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

    // Añadir marcas principales en la barra
    this.graphics.lineStyle(2, 0xffffff, 0.8);

    // 0% (Superior)
    let markY = barY - barHeight / 2;
    this.graphics.beginPath();
    this.graphics.moveTo(barX - 10, markY);
    this.graphics.lineTo(barX + barWidth + 10, markY);
    this.graphics.strokePath();

    // 50% (1/4 desde arriba)
    markY = barY - barHeight / 2 + barHeight / 4;
    this.graphics.beginPath();
    this.graphics.moveTo(barX - 8, markY);
    this.graphics.lineTo(barX + barWidth + 8, markY);
    this.graphics.strokePath();

    // 100% (Medio)
    markY = barY;
    this.graphics.lineStyle(3, 0xffffff, 1);
    this.graphics.beginPath();
    this.graphics.moveTo(barX - 12, markY);
    this.graphics.lineTo(barX + barWidth + 12, markY);
    this.graphics.strokePath();

    // 50% (3/4 desde arriba)
    this.graphics.lineStyle(2, 0xffffff, 0.8);
    markY = barY - barHeight / 2 + (barHeight * 3 / 4);
    this.graphics.beginPath();
    this.graphics.moveTo(barX - 8, markY);
    this.graphics.lineTo(barX + barWidth + 8, markY);
    this.graphics.strokePath();

    // 0% (Inferior)
    markY = barY + barHeight / 2;
    this.graphics.beginPath();
    this.graphics.moveTo(barX - 10, markY);
    this.graphics.lineTo(barX + barWidth + 10, markY);
    this.graphics.strokePath();

    // Añadir marcas secundarias
    this.graphics.lineStyle(1, 0xffffff, 0.4);
    for (let i = 1; i < 10; i++) {
      if (i !== 2 && i !== 5 && i !== 8) { // Excluir las marcas principales que ya dibujamos
        markY = barY - barHeight / 2 + (i * barHeight / 10);
        this.graphics.beginPath();
        this.graphics.moveTo(barX - 5, markY);
        this.graphics.lineTo(barX + barWidth + 5, markY);
        this.graphics.strokePath();
      }
    }

    // Actualizar el texto con el porcentaje
    if (this.powerText) {
      this.powerText.destroy();
    }

    // Mostrar el porcentaje de potencia real
    this.powerText = this.scene.add.text(barX + barWidth / 2, barY - barHeight / 2 - 20, `${Math.round(this.power * 100)}%`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0);

    // Añadir etiquetas de porcentaje a los lados de la barra
    if (this.percentageTexts.length === 0) {
      // 0% Superior
      let text = this.scene.add.text(barX + barWidth + 25, barY - barHeight / 2, "0%", {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0, 0.5).setScrollFactor(0);
      this.percentageTexts.push(text);

      // 50% Superior
      text = this.scene.add.text(barX + barWidth + 25, barY - barHeight / 2 + barHeight / 4, "50%", {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0, 0.5).setScrollFactor(0);
      this.percentageTexts.push(text);

      // 100% Medio
      text = this.scene.add.text(barX + barWidth + 25, barY, "100%", {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#00ff00',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0, 0.5).setScrollFactor(0);
      this.percentageTexts.push(text);

      // 50% Inferior
      text = this.scene.add.text(barX + barWidth + 25, barY - barHeight / 2 + barHeight * 3 / 4, "50%", {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0, 0.5).setScrollFactor(0);
      this.percentageTexts.push(text);

      // 0% Inferior
      text = this.scene.add.text(barX + barWidth + 25, barY + barHeight / 2, "0%", {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0, 0.5).setScrollFactor(0);
      this.percentageTexts.push(text);
    }
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
