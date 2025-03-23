import Phaser from 'phaser';

/**
 * Clase que maneja la pantalla de fin de juego con estilo glaciar
 */
export default class GameOverScreen {
  /**
   * Constructor de la clase GameOverScreen
   * @param {Phaser.Scene} scene - La escena a la que pertenece la pantalla
   */
  constructor(scene) {
    this.scene = scene;
    this.isVisible = false;
    this.container = null;
    this.callbacks = {
      onRestart: null,
      onMainMenu: null
    };
  }

  /**
   * Muestra la pantalla de fin de juego con estilo glaciar
   * @param {Object} options - Opciones para personalizar la pantalla
   */
  show(options = {}) {
    // Extraer opciones con valores por defecto
    const {
      totalDistance = 0,
      bestDistance = 0,
      onRestart = null,
      onMainMenu = null
    } = options;

    // Guardar los callbacks para poder usarlos más tarde
    this.callbacks.onRestart = onRestart;
    this.callbacks.onMainMenu = onMainMenu;

    // Si ya hay una pantalla visible, eliminarla primero
    this.hide();

    // Marcar como visible
    this.isVisible = true;

    // Obtener dimensiones de la pantalla
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // IMPORTANTE: Crear el contenedor en coordenadas (0,0) relativas a la pantalla, no al mundo
    // Esto es crucial para que el modal aparezca centrado en la vista actual
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(1000);

    // Asegurarnos que el contenedor siga a la cámara si esta se mueve
    this.container.setScrollFactor(0);

    // ---- CAPA DE FONDO BLOQUEANTE ----
    // Esta capa es interactiva y bloqueará cualquier click en el juego subyacente
    // Debe cubrir toda la vista actual de la cámara
    const blockingOverlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7)
      .setOrigin(0)
      .setScrollFactor(0)
      .setInteractive(); // Hacerla interactiva para capturar todos los clicks

    // IMPORTANTE: Detener todos los eventos en esta capa para evitar que lleguen al juego
    // Esto evita que los clics fuera de los botones hagan algo
    blockingOverlay.on('pointerdown', (pointer, localX, localY, event) => {
      event.stopPropagation();
    });

    // También prevenir clics al soltar el botón del ratón
    blockingOverlay.on('pointerup', (pointer, localX, localY, event) => {
      event.stopPropagation();
    });

    this.container.add(blockingOverlay);

    // ---- PANEL PRINCIPAL CON ESTILO GLACIAR ----
    // Dimensiones del panel con proporciones similares al menú de instrucciones
    const panelWidth = width * 0.8;
    const panelHeight = height * 0.7;
    const panelX = width / 2 - panelWidth / 2;
    const panelY = height * 0.15;

    // Panel principal con gradiente azul glaciar
    const panelBg = this.scene.add.graphics();
    panelBg.fillGradientStyle(0x2c85c1, 0x2c85c1, 0x88c1dd, 0x88c1dd, 0.9);
    panelBg.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
    panelBg.lineStyle(4, 0x6baed6, 1);
    panelBg.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
    panelBg.setScrollFactor(0);

    // Efecto de brillo interior - simula luz reflejada en el hielo
    const iceDetails = this.scene.add.graphics();
    iceDetails.fillStyle(0xe8f4fc, 0.4);
    iceDetails.fillRoundedRect(
      panelX + 10,
      panelY + 10,
      panelWidth - 20,
      panelHeight - 20,
      15
    );
    iceDetails.setScrollFactor(0);

    this.container.add([panelBg, iceDetails]);

    // ---- TÍTULO CON ESTILO DE HIELO ----
    // Título centrado con posición ajustada
    const titleY = panelY + 60;
    const titleText = this.scene.add.text(width / 2, titleY, '¡JUEGO TERMINADO!', {
      fontFamily: 'Arial',
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#003366',
      strokeThickness: 5
    }).setOrigin(0.5).setScrollFactor(0);

    // Animación de escala para el título (pulso)
    this.scene.tweens.add({
      targets: titleText,
      scale: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Añadir un efecto de brillo al título
    this.scene.tweens.add({
      targets: titleText,
      alpha: { from: 1, to: 0.8 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.container.add(titleText);

    // ---- PANEL DE DISTANCIA CON ESTILO DE HIELO ----
    // Panel para la distancia total con borde brillante - POSICIÓN AJUSTADA MÁS ARRIBA
    const distancePanelY = titleY + 60; // Reducido de 80 a 60 para estar más pegado al título
    const distancePanelWidth = panelWidth * 0.7;
    const distancePanelHeight = 80;
    const distancePanelX = width / 2 - distancePanelWidth / 2;

    // Crear el panel para la distancia con gradiente más intenso
    const distancePanel = this.scene.add.graphics();
    distancePanel.fillGradientStyle(0x0066aa, 0x0066aa, 0x2c85c1, 0x2c85c1, 0.8);
    distancePanel.fillRoundedRect(
      distancePanelX,
      distancePanelY,
      distancePanelWidth,
      distancePanelHeight,
      15
    );
    distancePanel.lineStyle(3, 0xffaa00, 1);
    distancePanel.strokeRoundedRect(
      distancePanelX,
      distancePanelY,
      distancePanelWidth,
      distancePanelHeight,
      15
    );
    distancePanel.setScrollFactor(0);

    // Verificar si es un nuevo récord
    const isNewRecord = totalDistance >= bestDistance;

    // Texto descriptivo de la distancia
    const distanceLabel = this.scene.add.text(
      width / 2,
      distancePanelY + 20,
      'DISTANCIA TOTAL',
      {
        fontFamily: 'Arial',
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#ffffff',
        stroke: '#003366',
        strokeThickness: 2
      }
    ).setOrigin(0.5).setScrollFactor(0);

    // Valor de la distancia con mayor énfasis
    const distanceValue = this.scene.add.text(
      width / 2,
      distancePanelY + 55,
      `${totalDistance} m`,
      {
        fontFamily: 'Arial',
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#ffffff',
        stroke: '#003366',
        strokeThickness: 3
      }
    ).setOrigin(0.5).setScrollFactor(0);

    // ---- NUEVO PANEL DORADO PARA LA MEJOR DISTANCIA ----
    const bestPanelY = distancePanelY + distancePanelHeight + 40;
    const bestPanelWidth = distancePanelWidth * 0.8;
    const bestPanelHeight = 70;
    const bestPanelX = width / 2 - bestPanelWidth / 2;

    // Crear panel dorado para la mejor distancia
    const bestPanel = this.scene.add.graphics();

    // Gradiente dorado para el panel de mejor distancia
    bestPanel.fillGradientStyle(0xd4af37, 0xd4af37, 0xffd700, 0xffd700, 0.9);
    bestPanel.fillRoundedRect(
      bestPanelX,
      bestPanelY,
      bestPanelWidth,
      bestPanelHeight,
      15
    );

    // Borde brillante
    bestPanel.lineStyle(3, 0xffffff, 0.8);
    bestPanel.strokeRoundedRect(
      bestPanelX,
      bestPanelY,
      bestPanelWidth,
      bestPanelHeight,
      15
    );
    bestPanel.setScrollFactor(0);

    // Efecto de brillo interior para el panel dorado
    const goldGlow = this.scene.add.graphics();
    goldGlow.fillStyle(0xfffacd, 0.3); // Color amarillo claro para el brillo
    goldGlow.fillRoundedRect(
      bestPanelX + 5,
      bestPanelY + 5,
      bestPanelWidth - 10,
      bestPanelHeight - 10,
      10
    );
    goldGlow.setScrollFactor(0);

    // Etiqueta para la mejor distancia
    const bestLabel = this.scene.add.text(
      width / 2,
      bestPanelY + 18,
      'MEJOR DISTANCIA',
      {
        fontFamily: 'Arial',
        fontSize: '18px',
        fontWeight: 'bold',
      color: '#ffffff',
        stroke: '#8b4513', // Marrón para contraste con el dorado
        strokeThickness: 2
      }
    ).setOrigin(0.5).setScrollFactor(0);

    // Valor de la mejor distancia
    const bestValue = this.scene.add.text(
      width / 2,
      bestPanelY + 48,
      `${bestDistance} m`,
      {
        fontFamily: 'Arial',
        fontSize: '24px',
        fontWeight: 'bold',
      color: '#ffffff',
        stroke: '#8b4513',
        strokeThickness: 3
      }
    ).setOrigin(0.5).setScrollFactor(0);

    // Efecto especial para nuevo récord
    if (isNewRecord) {
      // Añadir texto "¡NUEVO RÉCORD!" con efectos
      const recordText = this.scene.add.text(
        width / 2,
        bestPanelY - 20,
        '¡NUEVO RÉCORD!',
        {
          fontFamily: 'Arial',
          fontSize: '22px',
          fontWeight: 'bold',
          color: '#ffff00', // Amarillo brillante
          stroke: '#ff4500', // Naranja rojizo para contraste
          strokeThickness: 4
        }
      ).setOrigin(0.5).setScrollFactor(0);

      // Añadir efectos de escala y rotación ligera
      this.scene.tweens.add({
        targets: recordText,
        scale: 1.2,
        angle: { from: -2, to: 2 },
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Añadir efectos de brillo alrededor del valor de mejor distancia
      const valueGlow = this.scene.add.graphics();
      valueGlow.fillStyle(0xffff00, 0.3);
      valueGlow.fillCircle(width / 2, bestPanelY + 45, 70);
      valueGlow.setScrollFactor(0);

      // Pulso para el brillo
      this.scene.tweens.add({
        targets: valueGlow,
        alpha: 0.1,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.container.add([recordText, valueGlow]);
    }

    // Añadir todos los elementos al contenedor principal
    this.container.add([
      distancePanel,
      distanceLabel,
      distanceValue,
      bestPanel,
      goldGlow,
      bestLabel,
      bestValue
    ]);

    // ---- BOTONES DE ACCIÓN ----
    // Posicionamiento horizontal de los botones
    const buttonY = bestPanelY + bestPanelHeight + 60;
    const buttonWidth = 190;
    const buttonHeight = 60;
    const buttonSpacing = 30;

    // Botón 1: Volver a jugar (a la izquierda)
    const restartButton = this.createGlacierButton(
      width / 2 - buttonWidth / 2 - buttonSpacing,
      buttonY,
      buttonWidth,
      buttonHeight,
      'VOLVER A JUGAR',
      0x4682b4, // Azul acero
      this.handleRestart.bind(this)
    );

    // Botón 2: Menú principal (a la derecha)
    const menuButton = this.createGlacierButton(
      width / 2 + buttonWidth / 2 + buttonSpacing / 2,
      buttonY,
      buttonWidth,
      buttonHeight,
      'MENÚ PRINCIPAL',
      0x4682b4, // Azul acero
      this.handleMainMenu.bind(this)
    );

    this.container.add([restartButton, menuButton]);

    // ---- COPOS DE NIEVE DECORATIVOS ----
    // Añadir algunos copos de nieve decorativos al fondo del modal
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(panelX + 20, panelX + panelWidth - 20);
      const y = Phaser.Math.Between(panelY + 20, panelY + panelHeight - 20);
      const scale = Phaser.Math.FloatBetween(0.2, 0.5);
      const alpha = Phaser.Math.FloatBetween(0.1, 0.3);

      const snowflake = this.scene.add.image(x, y, 'snowflake')
        .setScale(scale)
        .setAlpha(alpha)
        .setScrollFactor(0);

      // Rotación lenta de los copos
      this.scene.tweens.add({
        targets: snowflake,
        angle: 360,
        duration: Phaser.Math.Between(5000, 10000),
        repeat: -1
      });

      this.container.add(snowflake);
    }

    // Asegurarse de que todos los elementos del contenedor estén registrados correctamente
    this.container.each(child => {
      if (typeof child.setScrollFactor === 'function' && child.scrollFactorX !== 0) {
        child.setScrollFactor(0);
      }
    });

    // Animar la entrada del contenedor completo
    this.container.alpha = 0;
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });
  }

  /**
   * Crea un botón con estilo de glaciar
   * @param {number} x - Posición X del botón
   * @param {number} y - Posición Y del botón
   * @param {number} width - Ancho del botón
   * @param {number} height - Alto del botón
   * @param {string} text - Texto del botón
   * @param {number} baseColor - Color base del botón
   * @param {function} callback - Función a ejecutar al hacer clic
   * @returns {Phaser.GameObjects.Container} - Contenedor del botón
   */
  createGlacierButton(x, y, width, height, text, baseColor, callback) {
    // Crear un contenedor para el botón y todos sus elementos
    const buttonContainer = this.scene.add.container(x, y);
    buttonContainer.setScrollFactor(0);

    // Fondo del botón con gradiente glaciar
    const buttonBg = this.scene.add.graphics();
    buttonBg.fillGradientStyle(baseColor, baseColor, 0x88c1dd, 0x88c1dd, 0.9);
    buttonBg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
    buttonBg.lineStyle(3, 0x6baed6, 1);
    buttonBg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
    buttonBg.setScrollFactor(0);

    // Efecto de brillo interior
    const buttonGlow = this.scene.add.graphics();
    buttonGlow.fillStyle(0xe8f4fc, 0.3);
    buttonGlow.fillRoundedRect(-width / 2 + 4, -height / 2 + 4, width - 8, height - 8, 8);
    buttonGlow.setScrollFactor(0);

    // Texto del botón
    const buttonText = this.scene.add.text(0, 0, text, {
      fontFamily: 'Arial',
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#003366',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0);

    // Añadir los elementos visuales al contenedor
    buttonContainer.add([buttonBg, buttonGlow, buttonText]);

    // IMPORTANTE: Crear un rectángulo interactivo para toda la zona del botón
    // Esto asegura que el área sea clickeable correctamente
    const hitBox = this.scene.add.rectangle(0, 0, width, height, 0xffffff, 0.0)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0);

    buttonContainer.add(hitBox);

    // Definir el tamaño del contenedor del botón
    buttonContainer.setSize(width, height);

    // Variable para rastrear si el botón se ha presionado
    let isButtonPressed = false;

    // Efectos de hover en el hitBox
    hitBox.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillGradientStyle(0x88c1dd, 0x88c1dd, baseColor, baseColor, 0.9);
      buttonBg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
      buttonBg.lineStyle(3, 0xaed6f1, 1);
      buttonBg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
      buttonText.setStyle({
        fontSize: '21px',
        color: '#ffffff'
      });
    });

    hitBox.on('pointerout', () => {
      // Restaurar estado visual normal solo si no está presionado
      if (!isButtonPressed) {
        buttonBg.clear();
        buttonBg.fillGradientStyle(baseColor, baseColor, 0x88c1dd, 0x88c1dd, 0.9);
        buttonBg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
        buttonBg.lineStyle(3, 0x6baed6, 1);
        buttonBg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
        buttonText.setStyle({
          fontSize: '20px',
          color: '#ffffff'
        });
      }

      // Reiniciar la variable de presionado cuando el cursor sale
      isButtonPressed = false;
    });

    // Efecto de pulsación y ejecución del callback
    hitBox.on('pointerdown', (pointer, localX, localY, event) => {
      // Detener la propagación del evento para evitar que llegue al juego
      event.stopPropagation();

      // Reproducir efecto de sonido del botón si el soundManager está disponible
      if (this.scene.soundManager) {
        this.scene.soundManager.playSfx('sfx_button');
      }

      // Marcar el botón como presionado
      isButtonPressed = true;

      // Efecto visual de pulsación
      buttonContainer.setScale(0.95);
      buttonContainer.y += 2
    });

    hitBox.on('pointerup', (pointer, localX, localY, event) => {
      // Detener la propagación del evento
      event.stopPropagation();

      // Solo ejecutar el callback si el botón estaba presionado
      // Esto evita que se active si el usuario presiona fuera y suelta sobre el botón
      if (isButtonPressed) {
        // Efecto visual de liberación
        buttonContainer.setScale(1);
        buttonContainer.y -= 2;

        // Ejecutar el callback
        if (callback) {
          callback();
        }

        // Reiniciar el estado
        isButtonPressed = false;
      }
    });

    return buttonContainer;
  }

  /**
   * Manejador para el botón de reinicio
   */
  handleRestart() {
    if (!this.isVisible) return;

    // Desactivar la pantalla y prevenir múltiples clics
    this.isVisible = false;

    // Animar la salida de la pantalla
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      scale: 0.8,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        // Eliminar el contenedor
        if (this.container) {
          this.container.destroy();
          this.container = null;
        }

        // Ejecutar el callback original proporcionado por Game.js
        if (typeof this.callbacks.onRestart === 'function') {
          this.callbacks.onRestart();
        } else {
          console.error('GameOverScreen: No hay callback de reinicio válido');
        }
      }
    });
  }

  /**
   * Manejador para el botón del menú principal
   */
  handleMainMenu() {
    if (!this.isVisible) return;

    // Desactivar la pantalla y prevenir múltiples clics
    this.isVisible = false;

    // Animar la salida de la pantalla
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      scale: 0.8,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        // Eliminar el contenedor
        if (this.container) {
          this.container.destroy();
          this.container = null;
        }

        // Ejecutar el callback original proporcionado por Game.js
        if (typeof this.callbacks.onMainMenu === 'function') {
          this.callbacks.onMainMenu();
        } else {
          console.error('GameOverScreen: No hay callback de menú válido');
        }
      }
    });
  }

  /**
   * Oculta la pantalla de fin de juego
   */
  hide() {
    if (this.container) {
      // Animar la salida si es visible
      if (this.isVisible) {
        this.scene.tweens.add({
          targets: this.container,
          alpha: 0,
          scale: 0.8,
          duration: 200,
          ease: 'Power2',
          onComplete: () => {
            this.container.destroy();
            this.container = null;
            this.isVisible = false;
          }
        });
      } else {
        // Si no está visible, simplemente destruir
      this.container.destroy();
      this.container = null;
    }
    }

      this.isVisible = false;
  }
}
