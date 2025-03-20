import Phaser from 'phaser';

/**
 * Clase que proporciona funciones para crear botones personalizados
 */
export default class ButtonFactory {
  /**
   * Crea un botón personalizado con estilo consistente con el juego
   * @param {Phaser.Scene} scene - La escena donde se creará el botón
   * @param {number} x - Posición X del botón
   * @param {number} y - Posición Y del botón
   * @param {number} width - Ancho del botón
   * @param {number} height - Alto del botón
   * @param {string} text - Texto del botón
   * @param {Function} callback - Función a ejecutar cuando se hace clic en el botón
   * @returns {Phaser.GameObjects.Container} - El contenedor del botón
   */
  static createButton(scene, x, y, width, height, text, callback) {
    const buttonContainer = scene.add.container(x, y);

    // Crear gradiente para el botón
    const buttonBg = scene.add.graphics();
    buttonBg.fillStyle(0x1e90ff, 1);
    buttonBg.fillRect(-width/2, -height/2, width, height);

    // Añadir borde dorado
    const buttonBorder = scene.add.graphics();
    buttonBorder.lineStyle(3, 0xffdd00, 1);
    buttonBorder.strokeRect(-width/2, -height/2, width, height);

    // Añadir efecto de brillo en las esquinas
    const cornerSize = 8;

    // Esquina superior izquierda
    const topLeftCorner = scene.add.graphics();
    topLeftCorner.fillStyle(0xffffff, 0.8);
    topLeftCorner.fillRect(-width/2, -height/2, cornerSize, cornerSize);

    // Esquina superior derecha
    const topRightCorner = scene.add.graphics();
    topRightCorner.fillStyle(0xffffff, 0.8);
    topRightCorner.fillRect(width/2 - cornerSize, -height/2, cornerSize, cornerSize);

    // Esquina inferior izquierda
    const bottomLeftCorner = scene.add.graphics();
    bottomLeftCorner.fillStyle(0xffffff, 0.8);
    bottomLeftCorner.fillRect(-width/2, height/2 - cornerSize, cornerSize, cornerSize);

    // Esquina inferior derecha
    const bottomRightCorner = scene.add.graphics();
    bottomRightCorner.fillStyle(0xffffff, 0.8);
    bottomRightCorner.fillRect(width/2 - cornerSize, height/2 - cornerSize, cornerSize, cornerSize);

    // Añadir texto del botón
    const buttonText = scene.add.text(0, 0, text, {
      fontFamily: 'Impact',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#104080',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5);

    // Añadir todos los elementos al contenedor
    buttonContainer.add([buttonBg, buttonBorder, topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner, buttonText]);

    // Flag para prevenir múltiples clicks rápidos
    let isProcessingClick = false;

    // Hacer que el botón sea interactivo con prioridad alta para recibir eventos primero
    buttonContainer.setSize(width, height);
    buttonContainer.setInteractive({ useHandCursor: true, priority: 1 })
      .on('pointerover', () => {
        buttonBg.clear();
        buttonBg.fillStyle(0x3aa3ff, 1);
        buttonBg.fillRect(-width/2, -height/2, width, height);
        buttonText.setScale(1.05);
      })
      .on('pointerout', () => {
        buttonBg.clear();
        buttonBg.fillStyle(0x1e90ff, 1);
        buttonBg.fillRect(-width/2, -height/2, width, height);
        buttonText.setScale(1);
        // Reiniciar el flag cuando el puntero sale del botón
        isProcessingClick = false;
      })
      .on('pointerdown', (pointer) => {
        // Detener completamente la propagación del evento
        if (pointer.event) {
          pointer.event.stopPropagation();
          pointer.event.preventDefault();
        }

        buttonBg.clear();
        buttonBg.fillStyle(0x0c6cbb, 1);
        buttonBg.fillRect(-width/2, -height/2, width, height);
        buttonText.setScale(0.95);
      })
      .on('pointerup', (pointer) => {
        // Evitar múltiples clicks rápidos
        if (isProcessingClick) return;
        isProcessingClick = true;

        // Detener completamente la propagación del evento
        if (pointer.event) {
          pointer.event.stopPropagation();
          pointer.event.preventDefault();
        }

        buttonBg.clear();
        buttonBg.fillStyle(0x1e90ff, 1);
        buttonBg.fillRect(-width/2, -height/2, width, height);
        buttonText.setScale(1);

        // Ejecutar el callback inmediatamente si es válido
        if (callback && typeof callback === 'function') {
          // Efecto visual de click
          buttonContainer.setAlpha(0.8);

          // Ejecutar el callback directamente sin delay
          callback();

          // Restaurar el aspecto visual del botón
          scene.time.delayedCall(100, () => {
            if (buttonContainer && buttonContainer.active) {
              buttonContainer.setAlpha(1);
              // Permitir nuevos clicks después del efecto visual
              isProcessingClick = false;
            }
          });
        } else {
          // Si no hay callback, restablecer el flag
          isProcessingClick = false;
        }
      });

    return buttonContainer;
  }
}
