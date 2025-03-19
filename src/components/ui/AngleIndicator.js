import Phaser from 'phaser';

/**
 * Clase que maneja el indicador de ángulo en el juego
 */
export default class AngleIndicator {
  /**
   * Constructor de la clase AngleIndicator
   * @param {Phaser.Scene} scene - La escena a la que pertenece el indicador
   * @param {Object} config - Configuración del indicador de ángulo
   */
  constructor(scene, config = {}) {
    this.scene = scene;
    this.graphics = scene.add.graphics().setScrollFactor(0);
    this.graphics.setVisible(false);

    // Propiedades de configuración con valores por defecto
    this.config = {
      originX: config.originX || scene.launchPositionX || 710,
      originY: config.originY || scene.launchPositionY || 540,
      radius: config.radius || 80,
      thickness: config.thickness || 10,
      startAngle: config.startAngle || 180, // Ángulo izquierdo (en grados)
      endAngle: config.endAngle || 270,     // Ángulo superior (en grados)
      minAngle: config.minAngle || 0,       // Para el rango de la animación
      maxAngle: config.maxAngle || 90       // Para el rango de la animación
    };

    // Valores internos
    this.angle = 45; // Ángulo inicial
    this.angleText = null;
    this.angleAnimation = null;
  }

  /**
   * Muestra el indicador de ángulo y comienza la animación
   * @param {Function} onUpdate - Función a llamar cuando se actualiza el valor de ángulo
   */
  startAngleSelection(onUpdate) {
    // Primero limpiar cualquier gráfico residual
    this.graphics.clear();
    this.graphics.fillStyle(0, 0); // Resetear el fillStyle
    this.graphics.lineStyle(0, 0, 0); // Resetear el lineStyle

    // Asegurarse de limpiar cualquier texto previo
    this.clearTexts();

    // Buscar y eliminar cualquier objeto gráfico relacionado con el ángulo
    if (this.scene && this.scene.children) {
      this.scene.children.list
        .filter(child =>
          (child.name && child.name.includes('angle')) ||
          (child.type === 'Text' && child.text && child.text.includes('Ángulo'))
        )
        .forEach(obj => {
          obj.destroy();
        });
    }

    // Hacer visible el gráfico
    this.graphics.setVisible(true);

    // Si hay una animación previa, la detenemos
    if (this.angleAnimation) {
      this.angleAnimation.stop();
    }

    // Crear la animación para mover el indicador de ángulo
    this.angleAnimation = this.scene.tweens.addCounter({
      from: this.config.minAngle,
      to: this.config.maxAngle,
      duration: 600,
      ease: 'Linear',
      repeat: -1,
      yoyo: true,
      onUpdate: () => {
        // Actualizar el ángulo
        this.angle = this.angleAnimation.getValue();

        // Actualizar el gráfico
        this.update();

        // Llamar al callback si está definido
        if (onUpdate) {
          onUpdate(this.angle);
        }
      }
    });

    return this;
  }

  /**
   * Detiene la animación y oculta el indicador de ángulo
   */
  endAngleSelection() {
    // Detener la animación
    if (this.angleAnimation) {
      this.angleAnimation.stop();
      this.angleAnimation = null;
    }

    // Ocultar el indicador y limpiar completamente el gráfico
    this.graphics.setVisible(false);
    this.graphics.clear();
    this.graphics.fillStyle(0, 0); // Resetear el fillStyle
    this.graphics.lineStyle(0, 0, 0); // Resetear el lineStyle

    // Limpiar textos
    this.clearTexts();

    // Asegurarnos de que no queden referencias a objetos no necesarios
    if (this.scene && this.scene.children) {
      this.scene.children.list
        .filter(child => child.name && child.name.includes('angle'))
        .forEach(obj => {
          obj.destroy();
        });
    }

    return this.angle;
  }

  /**
   * Limpia los textos del indicador de ángulo
   */
  clearTexts() {
    // Limpiar el texto del ángulo si existe
    if (this.angleText) {
      this.angleText.destroy();
      this.angleText = null;
    }

    // Buscar y eliminar cualquier otro texto de ángulo que pueda estar en la escena
    if (this.scene && this.scene.children) {
      this.scene.children.list
        .filter(child => child.type === 'Text' &&
                (child.text.includes('Ángulo') || child.name === 'angleText'))
        .forEach(text => {
          text.destroy();
        });
    }
  }

  /**
   * Actualiza la visualización del indicador de ángulo
   */
  update() {
    const { originX, originY, radius, thickness, startAngle, endAngle } = this.config;

    // Limpiar el gráfico completamente para evitar efectos residuales
    this.graphics.clear();

    // Para la dirección izquierda, la flecha debe apuntar entre 180° (izquierda) y 270° (arriba)
    // Convertir el ángulo actual (0-90) al rango necesario (180-270)
    const mappedAngle = startAngle + this.angle;

    // Convertir los ángulos a radianes para dibujar el arco
    const startRad = Phaser.Math.DegToRad(startAngle);
    const endRad = Phaser.Math.DegToRad(endAngle);
    const currentRad = Phaser.Math.DegToRad(mappedAngle);

    // Dibujar el arco de fondo
    this.graphics.lineStyle(thickness, 0x444444, 0.8);
    this.graphics.beginPath();
    this.graphics.arc(originX, originY, radius, startRad, endRad, false);
    this.graphics.strokePath();

    // Dibujar el arco de progreso (desde el inicio hasta el ángulo actual)
    this.graphics.lineStyle(thickness, 0xffaa00, 1);
    this.graphics.beginPath();
    this.graphics.arc(originX, originY, radius, startRad, currentRad, false);
    this.graphics.strokePath();

    // Dibujar marcas de grados en el arco
    this.graphics.lineStyle(2, 0xffffff, 0.7);
    for (let angle = 0; angle <= 90; angle += 15) {
      const markAngle = Phaser.Math.DegToRad(startAngle + angle);
      const markStartX = originX + (radius - thickness / 2) * Math.cos(markAngle);
      const markStartY = originY + (radius - thickness / 2) * Math.sin(markAngle);
      const markEndX = originX + (radius + thickness / 2) * Math.cos(markAngle);
      const markEndY = originY + (radius + thickness / 2) * Math.sin(markAngle);

      this.graphics.beginPath();
      this.graphics.moveTo(markStartX, markStartY);
      this.graphics.lineTo(markEndX, markEndY);
      this.graphics.strokePath();
    }

    // Calcular la posición de la flecha (en el extremo del arco actual)
    const arrowX = originX + radius * Math.cos(currentRad);
    const arrowY = originY + radius * Math.sin(currentRad);

    // Dibujar la flecha
    this.graphics.fillStyle(0xffff00, 1);
    this.graphics.beginPath();

    // Calcular la dirección tangente al arco en el punto actual
    const tangentAngle = currentRad + Math.PI / 2; // 90 grados más que el radio
    const arrowSize = 15;

    // Puntos de la flecha
    const point1X = arrowX + arrowSize * Math.cos(tangentAngle);
    const point1Y = arrowY + arrowSize * Math.sin(tangentAngle);

    const point2X = arrowX + arrowSize * Math.cos(currentRad - Math.PI);
    const point2Y = arrowY + arrowSize * Math.sin(currentRad - Math.PI);

    const point3X = arrowX + arrowSize * Math.cos(tangentAngle - Math.PI);
    const point3Y = arrowY + arrowSize * Math.sin(tangentAngle - Math.PI);

    // Dibujar el triángulo de la flecha
    this.graphics.moveTo(point1X, point1Y);
    this.graphics.lineTo(point2X, point2Y);
    this.graphics.lineTo(point3X, point3Y);
    this.graphics.closePath();
    this.graphics.fillPath();

    // Texto con el ángulo actual - primero limpiar el anterior
    if (this.angleText) {
      this.angleText.destroy();
    }

    this.angleText = this.scene.add.text(originX, originY - radius - 30, `Ángulo: ${Math.round(this.angle)}°`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setName('angleText');
  }

  /**
   * Destruye el indicador de ángulo y limpia sus recursos
   */
  destroy() {
    this.clearTexts();

    if (this.angleAnimation) {
      this.angleAnimation.stop();
      this.angleAnimation = null;
    }

    if (this.graphics) {
      // Asegurarnos de limpiar completamente antes de destruir
      this.graphics.clear();
      this.graphics.destroy();
      this.graphics = null;
    }

    // Buscar cualquier objeto relacionado con el ángulo que pueda haber quedado
    if (this.scene && this.scene.children) {
      this.scene.children.list
        .filter(child =>
          (child.name && child.name.includes('angle')) ||
          (child.type === 'Text' && child.text && child.text.includes('Ángulo'))
        )
        .forEach(obj => {
          obj.destroy();
        });
    }
  }
}
