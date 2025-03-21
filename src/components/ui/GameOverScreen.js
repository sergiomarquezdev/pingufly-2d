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

    // Crear un contenedor principal que capturará inputs a nivel global
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(1000);

    // Obtener dimensiones de la pantalla
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // ---- CAPA DE FONDO BLOQUEANTE ----
    // Esta capa es interactiva y bloqueará cualquier click en el juego subyacente
    const blockingOverlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7)
      .setOrigin(0)
      .setScrollFactor(0)
      .setInteractive(); // Hacerla interactiva para capturar todos los clicks

    // Detener todos los eventos en esta capa para evitar que lleguen al juego
    blockingOverlay.on('pointerdown', (pointer, localX, localY, event) => {
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

    this.container.add([panelBg, iceDetails]);

    // ---- TÍTULO CON ESTILO DE HIELO ----
    const titleY = panelY + 60;
    const titleText = this.scene.add.text(width / 2, titleY, '¡JUEGO TERMINADO!', {
      fontFamily: 'Arial',
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#003366',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0);

    // Añadir un efecto de brillo al título
    this.scene.tweens.add({
      targets: titleText,
      alpha: 0.8,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.container.add(titleText);

    // ---- PANEL DE DISTANCIA CON ESTILO DE HIELO ----
    // Panel para la distancia total con borde brillante
    const distancePanelY = titleY + 80;
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
    ).setOrigin(0.5);

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
    ).setOrigin(0.5);

    // Si es un nuevo récord, añadir efectos especiales
    if (isNewRecord) {
      // Fondo del récord con estilo especial
      const recordBgY = distancePanelY + distancePanelHeight + 30;
      const recordBg = this.scene.add.graphics();
      recordBg.fillStyle(0x000000, 0.3);
      recordBg.fillRoundedRect(width / 2 - 150, recordBgY - 20, 300, 40, 10);
      recordBg.lineStyle(2, 0xffdd00, 1);
      recordBg.strokeRoundedRect(width / 2 - 150, recordBgY - 20, 300, 40, 10);

      // Texto de nuevo récord con brillo
      const recordText = this.scene.add.text(
        width / 2,
        recordBgY,
        '¡NUEVO RÉCORD!',
        {
          fontFamily: 'Arial',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#ffdd00',
          stroke: '#003366',
          strokeThickness: 3
        }
      ).setOrigin(0.5);

      // Pulso de brillo para el texto de récord
      this.scene.tweens.add({
        targets: recordText,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1
      });

      // Añadir un efecto de resplandor alrededor del valor
      const glow = this.scene.add.graphics();
      glow.fillStyle(0xffdd00, 0.2);
      glow.fillCircle(width / 2, distancePanelY + 55, 70);

      // Animar el resplandor
      this.scene.tweens.add({
        targets: glow,
        alpha: { from: 0.3, to: 0 },
        duration: 800,
        yoyo: true,
        repeat: -1
      });

      this.container.add([recordBg, recordText, glow]);
    }

    // Panel para la mejor distancia histórica
    const bestPanelY = isNewRecord ? distancePanelY + distancePanelHeight + 80 : distancePanelY + distancePanelHeight + 30;

    // Texto de mejor distancia más sutil
    const bestDistanceText = this.scene.add.text(
      width / 2,
      bestPanelY,
      `Mejor distancia: ${bestDistance} m`,
      {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#e8f4fc',
        stroke: '#003366',
        strokeThickness: 1
      }
    ).setOrigin(0.5);

    this.container.add([distancePanel, distanceLabel, distanceValue, bestDistanceText]);

    // ---- BOTONES CON ESTILO GLACIAR ----
    // Determinar la posición vertical de los botones basada en si es un récord
    const buttonStartY = isNewRecord ? bestPanelY + 60 : bestPanelY + 40;

    // Botón de reiniciar con estilo glaciar
    const restartButton = this.createGlacierButton(
      width / 2,
      buttonStartY,
      280,
      60,
      'VOLVER A JUGAR',
      0x2c85c1,
      this.handleRestart.bind(this)
    );

    // Botón de menú principal con estilo glaciar
    const menuButton = this.createGlacierButton(
      width / 2,
      buttonStartY + 80,
      280,
      60,
      'MENÚ PRINCIPAL',
      0x0066aa,
      this.handleMainMenu.bind(this)
    );

    this.container.add([restartButton.container]);
    this.container.add([menuButton.container]);

    // ---- COPOS DE NIEVE DECORATIVOS ----
    // Añadir copos de nieve decorativos flotando dentro del panel
    for (let i = 0; i < 12; i++) {
      const x = Phaser.Math.Between(panelX + 50, panelX + panelWidth - 50);
      const y = Phaser.Math.Between(panelY + 50, panelY + panelHeight - 50);
      const scale = Phaser.Math.FloatBetween(0.08, 0.15);
      const rotationSpeed = Phaser.Math.FloatBetween(0.1, 0.2);

      const snowflake = this.scene.add.image(x, y, 'snowflake')
        .setScale(scale)
        .setAlpha(Phaser.Math.FloatBetween(0.4, 0.7));

      // Animar los copos con rotación suave
      this.scene.tweens.add({
        targets: snowflake,
        y: y + Phaser.Math.Between(40, 80),
        x: x + Phaser.Math.Between(-30, 30),
        rotation: snowflake.rotation + rotationSpeed * 5,
        alpha: 0.3,
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1,
        onRepeat: () => {
          snowflake.y = Phaser.Math.Between(panelY + 50, panelY + panelHeight - 50);
          snowflake.x = Phaser.Math.Between(panelX + 50, panelX + panelWidth - 50);
          snowflake.alpha = Phaser.Math.FloatBetween(0.4, 0.7);
          snowflake.rotation = 0;
        }
      });

      this.container.add(snowflake);
    }

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
   * Crea un botón con estilo glaciar, similar a los del menú
   */
  createGlacierButton(x, y, width, height, text, baseColor, callback) {
    const buttonContainer = this.scene.add.container(x, y);

    // Crear el fondo del botón con gradiente
    const buttonBg = this.scene.add.graphics();
    buttonBg.fillGradientStyle(baseColor, baseColor, 0x88c1dd, 0x88c1dd, 1);
    buttonBg.fillRoundedRect(-width/2, -height/2, width, height, 15);

    // Borde del botón
    const buttonBorder = this.scene.add.graphics();
    buttonBorder.lineStyle(3, 0xffaa00, 1);
    buttonBorder.strokeRoundedRect(-width/2, -height/2, width, height, 15);

    // Efecto de brillo interior
    const buttonGlow = this.scene.add.graphics();
    buttonGlow.fillStyle(0xe8f4fc, 0.3);
    buttonGlow.fillRoundedRect(-width/2 + 5, -height/2 + 5, width - 10, height - 10, 10);

    // Esquinas brillantes
    const cornerSize = 6;
    const corner1 = this.scene.add.rectangle(-width/2 + cornerSize/2, -height/2 + cornerSize/2, cornerSize, cornerSize, 0xffffff, 0.8);
    const corner2 = this.scene.add.rectangle(width/2 - cornerSize/2, -height/2 + cornerSize/2, cornerSize, cornerSize, 0xffffff, 0.8);
    const corner3 = this.scene.add.rectangle(-width/2 + cornerSize/2, height/2 - cornerSize/2, cornerSize, cornerSize, 0xffffff, 0.8);
    const corner4 = this.scene.add.rectangle(width/2 - cornerSize/2, height/2 - cornerSize/2, cornerSize, cornerSize, 0xffffff, 0.8);

    // Texto del botón
    const buttonText = this.scene.add.text(0, 0, text, {
      fontFamily: 'Arial',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#003366',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5);

    // Añadir todos los elementos al contenedor
    buttonContainer.add([buttonBg, buttonGlow, buttonBorder, buttonText, corner1, corner2, corner3, corner4]);

    // Crear zona interactiva
    const buttonZone = this.scene.add.zone(0, 0, width, height).setInteractive({
      useHandCursor: true
    });
    buttonContainer.add(buttonZone);

    // Eventos de interacción
    buttonZone.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillGradientStyle(0x3997d3, 0x3997d3, 0x99d2ee, 0x99d2ee, 1);
      buttonBg.fillRoundedRect(-width/2, -height/2, width, height, 15);

      buttonGlow.clear();
      buttonGlow.fillStyle(0xe8f4fc, 0.5);
      buttonGlow.fillRoundedRect(-width/2 + 5, -height/2 + 5, width - 10, height - 10, 10);

      buttonText.setScale(1.05);

      // Efecto de cursor para mejorar feedback
      this.scene.game.canvas.style.cursor = 'pointer';
    });

    buttonZone.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillGradientStyle(baseColor, baseColor, 0x88c1dd, 0x88c1dd, 1);
      buttonBg.fillRoundedRect(-width/2, -height/2, width, height, 15);

      buttonGlow.clear();
      buttonGlow.fillStyle(0xe8f4fc, 0.3);
      buttonGlow.fillRoundedRect(-width/2 + 5, -height/2 + 5, width - 10, height - 10, 10);

      buttonText.setScale(1);

      // Restaurar cursor normal
      this.scene.game.canvas.style.cursor = 'default';
    });

    buttonZone.on('pointerdown', () => {
      // Efecto visual al presionar
      buttonBg.clear();
      buttonBg.fillGradientStyle(0x0055aa, 0x0055aa, 0x4488bb, 0x4488bb, 1);
      buttonBg.fillRoundedRect(-width/2, -height/2, width, height, 15);

      buttonText.setScale(0.95);
    });

    buttonZone.on('pointerup', (pointer, localX, localY, event) => {
      // CRÍTICO: Detener propagación del evento para evitar que llegue al juego
      event.stopPropagation();

      // Reproducir un sonido de clic si está disponible
      if (this.scene.sound && this.scene.sound.add) {
        const clickSound = this.scene.sound.get('click');
        if (clickSound) clickSound.play({ volume: 0.5 });
      }

      // Efecto visual al soltar
      buttonBg.clear();
      buttonBg.fillGradientStyle(0x3997d3, 0x3997d3, 0x99d2ee, 0x99d2ee, 1);
      buttonBg.fillRoundedRect(-width/2, -height/2, width, height, 15);

      buttonText.setScale(1.05);

      // Ejecutar el callback después de un breve retraso para la animación
      if (callback && this.isVisible) {
        // Pequeña pausa para que se vea el efecto visual
        this.scene.time.delayedCall(50, callback);
      }
    });

    return {
      container: buttonContainer,
      zone: buttonZone,
      bg: buttonBg,
      text: buttonText
    };
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
        // Asegurarse que el modal está cerrado en el state manager
        if (this.scene.stateManager) {
          this.scene.stateManager.setModalState(false);
        }

        // Eliminar el contenedor
        if (this.container) {
          this.container.destroy();
          this.container = null;
        }

        // Ejecutar el callback original después de un breve retraso
        if (this.callbacks.onRestart) {
          this.callbacks.onRestart();
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
        // Asegurarse que el modal está cerrado en el state manager
        if (this.scene.stateManager) {
          this.scene.stateManager.setModalState(false);
        }

        // Eliminar el contenedor
        if (this.container) {
          this.container.destroy();
          this.container = null;
        }

        // Ejecutar el callback original
        if (this.callbacks.onMainMenu) {
          this.callbacks.onMainMenu();
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
