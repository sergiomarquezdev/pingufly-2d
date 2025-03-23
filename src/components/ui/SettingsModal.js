import Phaser from 'phaser';
import StorageManager from '../../utils/StorageManager';
import SoundManager from '../../utils/SoundManager';

/**
 * Clase que implementa un modal de configuración con opciones para ajustar
 * la configuración del juego (sonido, récord, reiniciar juego)
 */
export default class SettingsModal {
  /**
   * Constructor de la clase SettingsModal
   * @param {Phaser.Scene} scene - La escena a la que pertenece el modal
   */
  constructor(scene) {
    this.scene = scene;
    this.container = null;
    this.isVisible = false;
    this.toggles = {
      sound: null
    };
  }

  /**
   * Muestra el modal de configuración
   */
  show() {
    // Si ya hay un modal visible, ocultarlo primero
    this.hide();

    // Marcar como visible
    this.isVisible = true;

    // Obtener dimensiones de la pantalla
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Crear contenedor principal
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(1000); // Alta profundidad para estar por encima de todo
    this.container.setScrollFactor(0); // Asegurar que sigue a la cámara

    // Fondo semi-transparente que bloquea la interacción con el juego
    const bg = this.scene.add.rectangle(0, 0, width, height, 0x000033, 0.7)
      .setOrigin(0)
      .setScrollFactor(0)
      .setInteractive();

    // Detener propagación de eventos
    bg.on('pointerdown', (pointer, localX, localY, event) => {
      event.stopPropagation();
    });

    bg.on('pointerup', (pointer, localX, localY, event) => {
      event.stopPropagation();
    });

    this.container.add(bg);

    // Panel principal con estilo glaciar
    const panelWidth = width * 0.7;
    const panelHeight = height * 0.6;
    const panelX = width / 2 - panelWidth / 2;
    const panelY = height * 0.2;

    // Fondo del panel con gradiente azul
    const panel = this.scene.add.graphics();
    panel.fillGradientStyle(0x2c85c1, 0x2c85c1, 0x88c1dd, 0x88c1dd, 0.9);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
    panel.lineStyle(4, 0x6baed6, 1);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);

    // Efecto de brillo interior
    const iceDetails = this.scene.add.graphics();
    iceDetails.fillStyle(0xe8f4fc, 0.4);
    iceDetails.fillRoundedRect(
      panelX + 10,
      panelY + 10,
      panelWidth - 20,
      panelHeight - 20,
      15
    );

    this.container.add([panel, iceDetails]);

    // Título del modal
    const titleY = panelY + 40;
    const title = this.scene.add.text(width / 2, titleY, 'CONFIGURACIÓN', {
      fontFamily: 'Arial',
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#003366',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0);

    this.container.add(title);

    // Añadir opciones de configuración
    this.addConfigOptions(panelX, panelY, panelWidth, panelHeight);

    // Botón de cierre
    this.addCloseButton(panelX + panelWidth - 30, panelY + 30);

    // Agregar copos de nieve decorativos
    this.addSnowflakes(panelX, panelY, panelWidth, panelHeight);

    // Animar la entrada del modal
    this.container.alpha = 0;
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });

    return this;
  }

  /**
   * Añade las opciones de configuración al modal
   * @private
   */
  addConfigOptions(panelX, panelY, panelWidth, panelHeight) {
    const width = this.scene.cameras.main.width;
    const startY = panelY + 100;
    const optionHeight = 80;
    const padding = 30;

    // 1. Opción para activar/desactivar sonido
    this.addSoundToggle(width / 2, startY, panelWidth - padding * 2);

    // 2. Botón para resetear récord
    this.addResetRecordButton(width / 2, startY + optionHeight, panelWidth - padding * 2);

    // 3. Botón para reiniciar juego
    this.addRestartGameButton(width / 2, startY + optionHeight * 2, panelWidth - padding * 2);

    return this;
  }

  /**
   * Añade un toggle para activar/desactivar el sonido
   * @private
   */
  addSoundToggle(x, y, width) {
    // Crear contenedor para la opción
    const container = this.scene.add.container(x, y);
    container.setScrollFactor(0);

    // Texto descriptivo
    const label = this.scene.add.text(0, 0, 'SONIDO', {
      fontFamily: 'Arial',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#003366',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0);

    container.add(label);

    // Obtener estado actual del sonido
    const isSoundEnabled = this.scene.soundManager ?
      (this.scene.soundManager.isMusicEnabled() && this.scene.soundManager.isSfxEnabled()) : true;

    // Dimensiones del toggle
    const toggleWidth = 80;
    const toggleHeight = 40;
    const toggleX = 120;
    const toggleY = 0;
    const knobSize = toggleHeight - 10; // Tamaño del círculo deslizante
    const knobRadius = knobSize / 2;

    // Posiciones absolutas del círculo
    const offPosition = toggleX - toggleWidth/2 + knobRadius + 5;
    const onPosition = toggleX + toggleWidth/2 - knobRadius - 5;

    // Crear grupo para el toggle
    const toggleGroup = this.scene.add.group();

    // Fondo del toggle (rectángulo redondeado)
    const toggleBg = this.scene.add.graphics();
    // El color de fondo cambia según el estado
    const bgColorOff = 0x555555;
    const bgColorOn = 0x225555;
    toggleBg.fillStyle(isSoundEnabled ? bgColorOn : bgColorOff, 0.9);
    toggleBg.fillRoundedRect(toggleX - toggleWidth/2, toggleY - toggleHeight/2, toggleWidth, toggleHeight, toggleHeight/2);
    toggleBg.lineStyle(2, 0x6baed6, 0.8);
    toggleBg.strokeRoundedRect(toggleX - toggleWidth/2, toggleY - toggleHeight/2, toggleWidth, toggleHeight, toggleHeight/2);

    // Texto de estado (ON/OFF)
    const stateText = this.scene.add.text(
      toggleX,
      toggleY,
      isSoundEnabled ? 'ON' : 'OFF',
      {
        fontFamily: 'Arial',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#ffffff'
      }
    ).setOrigin(0.5).setScrollFactor(0);

    // Círculo deslizante (knob)
    const knob = this.scene.add.graphics();
    const knobColorOff = 0xE74C3C; // Rojo para OFF
    const knobColorOn = 0x4CAF50;  // Verde para ON
    const initialKnobPosition = isSoundEnabled ? onPosition : offPosition;

    knob.fillStyle(isSoundEnabled ? knobColorOn : knobColorOff, 1);
    knob.fillCircle(initialKnobPosition, toggleY, knobRadius);

    // Añadir todo al contenedor
    container.add([toggleBg, stateText, knob]);

    // Hacer el toggle interactivo
    const hitArea = this.scene.add.rectangle(
      toggleX,
      toggleY,
      toggleWidth,
      toggleHeight
    ).setInteractive({ useHandCursor: true });

    container.add(hitArea);

    // Variable para rastrear el estado
    const state = {
      isOn: isSoundEnabled
    };

    // Manejar el evento de clic
    hitArea.on('pointerdown', (pointer, localX, localY, event) => {
      event.stopPropagation();

      // Reproducir sonido de botón si está disponible
      if (this.scene.soundManager) {
        this.scene.soundManager.playSfx('sfx_button');
      }

      // Cambiar estado
      state.isOn = !state.isOn;

      // Actualizar texto
      stateText.setText(state.isOn ? 'ON' : 'OFF');

      // Actualizar color del fondo
      toggleBg.clear();
      toggleBg.fillStyle(state.isOn ? bgColorOn : bgColorOff, 0.9);
      toggleBg.fillRoundedRect(toggleX - toggleWidth/2, toggleY - toggleHeight/2, toggleWidth, toggleHeight, toggleHeight/2);
      toggleBg.lineStyle(2, 0x6baed6, 0.8);
      toggleBg.strokeRoundedRect(toggleX - toggleWidth/2, toggleY - toggleHeight/2, toggleWidth, toggleHeight, toggleHeight/2);

      // Posición final absoluta
      const targetPosition = state.isOn ? onPosition : offPosition;

      // Animar deslizamiento
      this.scene.tweens.add({
        targets: {},
        progress: 0,
        duration: 200,
        ease: 'Power2',
        onUpdate: (tween) => {
          knob.clear();

          // Color según estado
          const currentColor = state.isOn ? knobColorOn : knobColorOff;

          // Calcular posición actual en el proceso de animación
          const startPosition = state.isOn ? offPosition : onPosition;
          const currentPosition = Phaser.Math.Linear(startPosition, targetPosition, tween.progress);

          // Dibujar el círculo en la posición actual
          knob.fillStyle(currentColor, 1);
          knob.fillCircle(currentPosition, toggleY, knobRadius);
        },
        onComplete: () => {
          // Asegurar posición final exacta
          knob.clear();
          knob.fillStyle(state.isOn ? knobColorOn : knobColorOff, 1);
          knob.fillCircle(targetPosition, toggleY, knobRadius);

          // Aplicar la configuración de sonido
          if (this.scene.soundManager) {
            this.scene.soundManager.setMusicEnabled(state.isOn);
            this.scene.soundManager.setSfxEnabled(state.isOn);
          }
        }
      });
    });

    // Guardar referencia al toggle
    this.toggles.sound = {
      container,
      state
    };

    this.container.add(container);
    return container;
  }

  /**
   * Añade un botón para resetear el récord
   * @private
   */
  addResetRecordButton(x, y, width) {
    // Crear el botón con el estilo glaciar
    const buttonWidth = width * 0.7;
    const buttonHeight = 50;
    const button = this.createGlacierButton(
      x,
      y,
      buttonWidth,
      buttonHeight,
      'RESETEAR RÉCORD',
      0x4682b4,
      () => {
        // Mostrar confirmación
        this.showConfirmDialog(
          '¿Estás seguro de que quieres eliminar el récord?',
          () => {
            // Eliminar récord
            StorageManager.removeItem(StorageManager.BEST_DISTANCE_KEY);

            // Actualizar el menú si estamos en esa escena
            if (this.scene.scene.key === 'Menu') {
              // Actualizar la variable bestDistance en el menú
              this.scene.bestDistance = 0;

              // Buscar el recordContainer en los children de la escena
              let recordContainer = null;

              this.scene.children.list.forEach(child => {
                // Buscar contenedores en la escena principal
                if (child.type === 'Container') {
                  // En Menu.js, el contenedor principal contiene otros contenedores
                  child.list.forEach(nestedChild => {
                    if (nestedChild.type === 'Container') {
                      // Verificar si este contenedor tiene el texto del récord
                      let hasRecordText = false;

                      nestedChild.list.forEach(element => {
                        // Buscar el texto que contiene "BEST DISTANCE"
                        if (element.type === 'Text' &&
                            element.text &&
                            element.text.includes('BEST DISTANCE')) {
                          hasRecordText = true;
                        }
                      });

                      if (hasRecordText) {
                        recordContainer = nestedChild;
                      }
                    }
                  });
                }
              });

              // Si encontramos el contenedor con el récord, actualizar su texto
              if (recordContainer) {
                recordContainer.list.forEach(element => {
                  if (element.type === 'Text' &&
                      element.text &&
                      element.text.includes(' m')) {
                    // Actualizar el texto del récord a 0 m
                    element.setText('0 m');
                  }
                });
              }
            } else if (this.scene.scene.key === 'Game') {
              // Si estamos en la escena Game, actualizar el scoreManager
              if (this.scene.scoreManager) {
                this.scene.scoreManager.bestTotalDistance = 0;

                // Actualizar el texto si existe
                if (this.scene.gameUI) {
                  this.scene.gameUI.updateBestDistanceText(0);
                }
              }
            }

            // Mostrar mensaje de confirmación
            this.showMessage('Récord eliminado correctamente');
          }
        );
      }
    );

    this.container.add(button);
    return button;
  }

  /**
   * Añade un botón para reiniciar el juego
   * @private
   */
  addRestartGameButton(x, y, width) {
    // Crear el botón con el estilo glaciar
    const buttonWidth = width * 0.7;
    const buttonHeight = 50;
    const button = this.createGlacierButton(
      x,
      y,
      buttonWidth,
      buttonHeight,
      'REINICIAR JUEGO',
      0x4682b4,
      () => {
        // Mostrar confirmación
        this.showConfirmDialog(
          '¿Estás seguro de que quieres reiniciar el juego?',
          () => {
            // Recargar la página
            window.location.reload();
          }
        );
      }
    );

    this.container.add(button);
    return button;
  }

  /**
   * Crea un botón con estilo glaciar
   * @private
   */
  createGlacierButton(x, y, width, height, text, baseColor, callback) {
    // Crear contenedor para el botón
    const buttonContainer = this.scene.add.container(x, y);
    buttonContainer.setScrollFactor(0);

    // Fondo del botón con gradiente
    const buttonBg = this.scene.add.graphics();
    buttonBg.fillGradientStyle(baseColor, baseColor, 0x88c1dd, 0x88c1dd, 0.9);
    buttonBg.fillRoundedRect(-width/2, -height/2, width, height, 15);
    buttonBg.lineStyle(3, 0x6baed6, 1);
    buttonBg.strokeRoundedRect(-width/2, -height/2, width, height, 15);

    // Brillo interior
    const buttonGlow = this.scene.add.graphics();
    buttonGlow.fillStyle(0xe8f4fc, 0.3);
    buttonGlow.fillRoundedRect(-width/2 + 4, -height/2 + 4, width - 8, height - 8, 10);

    // Texto del botón
    const buttonText = this.scene.add.text(0, 0, text, {
      fontFamily: 'Arial',
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#003366',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0);

    buttonContainer.add([buttonBg, buttonGlow, buttonText]);

    // Área interactiva
    const hitArea = this.scene.add.rectangle(0, 0, width, height)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    buttonContainer.add(hitArea);

    // Variable para rastrear si el botón está presionado
    let isPressed = false;

    // Eventos del botón
    hitArea.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillGradientStyle(0x88c1dd, 0x88c1dd, baseColor, baseColor, 0.9);
      buttonBg.fillRoundedRect(-width/2, -height/2, width, height, 15);
      buttonBg.lineStyle(3, 0xaed6f1, 1);
      buttonBg.strokeRoundedRect(-width/2, -height/2, width, height, 15);
      buttonText.setScale(1.05);
    });

    hitArea.on('pointerout', () => {
      if (!isPressed) {
        buttonBg.clear();
        buttonBg.fillGradientStyle(baseColor, baseColor, 0x88c1dd, 0x88c1dd, 0.9);
        buttonBg.fillRoundedRect(-width/2, -height/2, width, height, 15);
        buttonBg.lineStyle(3, 0x6baed6, 1);
        buttonBg.strokeRoundedRect(-width/2, -height/2, width, height, 15);
        buttonText.setScale(1);
      }
      isPressed = false;
    });

    hitArea.on('pointerdown', (pointer, localX, localY, event) => {
      event.stopPropagation();

      // Reproducir sonido de botón si está disponible
      if (this.scene.soundManager) {
        this.scene.soundManager.playSfx('sfx_button');
      }

      isPressed = true;
      buttonContainer.setScale(0.95);
      buttonContainer.y += 2;
    });

    hitArea.on('pointerup', (pointer, localX, localY, event) => {
      event.stopPropagation();

      if (isPressed) {
        buttonContainer.setScale(1);
        buttonContainer.y -= 2;

        if (callback) {
          callback();
        }
      }

      isPressed = false;
    });

    return buttonContainer;
  }

  /**
   * Añade el botón para cerrar el modal
   * @private
   */
  addCloseButton(x, y) {
    // Crear un contenedor para el botón de cierre
    const closeButton = this.scene.add.container(x, y);
    closeButton.setScrollFactor(0);

    // Círculo de fondo
    const circleBg = this.scene.add.graphics();
    circleBg.fillStyle(0xc42828, 0.9); // Rojo para el botón de cierre
    circleBg.fillCircle(0, 0, 15);
    circleBg.lineStyle(2, 0xffffff, 0.8);
    circleBg.strokeCircle(0, 0, 15);

    // Símbolo X
    const cross = this.scene.add.graphics();
    cross.lineStyle(3, 0xffffff, 1);
    cross.beginPath();
    cross.moveTo(-6, -6);
    cross.lineTo(6, 6);
    cross.moveTo(6, -6);
    cross.lineTo(-6, 6);
    cross.strokePath();

    closeButton.add([circleBg, cross]);

    // Área interactiva
    const hitArea = this.scene.add.circle(0, 0, 15)
      .setInteractive({ useHandCursor: true });

    closeButton.add(hitArea);

    // Eventos del botón
    hitArea.on('pointerover', () => {
      circleBg.clear();
      circleBg.fillStyle(0xe53935, 0.9); // Rojo más claro en hover
      circleBg.fillCircle(0, 0, 15);
      circleBg.lineStyle(2, 0xffffff, 1);
      circleBg.strokeCircle(0, 0, 15);
      closeButton.setScale(1.1);
    });

    hitArea.on('pointerout', () => {
      circleBg.clear();
      circleBg.fillStyle(0xc42828, 0.9);
      circleBg.fillCircle(0, 0, 15);
      circleBg.lineStyle(2, 0xffffff, 0.8);
      circleBg.strokeCircle(0, 0, 15);
      closeButton.setScale(1);
    });

    hitArea.on('pointerdown', (pointer, localX, localY, event) => {
      event.stopPropagation();

      // Reproducir sonido de botón si está disponible
      if (this.scene.soundManager) {
        this.scene.soundManager.playSfx('sfx_button');
      }

      closeButton.setScale(0.9);
    });

    hitArea.on('pointerup', (pointer, localX, localY, event) => {
      event.stopPropagation();
      closeButton.setScale(1);
      this.hide();
    });

    this.container.add(closeButton);
    return closeButton;
  }

  /**
   * Añade copos de nieve decorativos
   * @private
   */
  addSnowflakes(panelX, panelY, panelWidth, panelHeight) {
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(panelX + 20, panelX + panelWidth - 20);
      const y = Phaser.Math.Between(panelY + 20, panelY + panelHeight - 20);
      const scale = Phaser.Math.FloatBetween(0.1, 0.25);
      const alpha = Phaser.Math.FloatBetween(0.1, 0.3);

      const snowflake = this.scene.add.image(x, y, 'snowflake')
        .setScale(scale)
        .setAlpha(alpha)
        .setScrollFactor(0);

      // Rotación lenta aleatoria
      this.scene.tweens.add({
        targets: snowflake,
        angle: 360,
        duration: Phaser.Math.Between(6000, 12000),
        repeat: -1
      });

      this.container.add(snowflake);
    }
  }

  /**
   * Muestra un cuadro de diálogo de confirmación
   * @private
   */
  showConfirmDialog(message, onConfirm) {
    // Obtener dimensiones de la pantalla
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Crear contenedor para el diálogo
    const dialogContainer = this.scene.add.container(0, 0);
    dialogContainer.setDepth(1100); // Mayor que el modal principal
    dialogContainer.setScrollFactor(0);

    // Fondo semi-transparente
    const bg = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.5)
      .setOrigin(0)
      .setScrollFactor(0)
      .setInteractive();

    // Detener propagación de eventos
    bg.on('pointerdown', (pointer, localX, localY, event) => event.stopPropagation());
    bg.on('pointerup', (pointer, localX, localY, event) => event.stopPropagation());

    dialogContainer.add(bg);

    // Panel del diálogo
    const dialogWidth = width * 0.6;
    const dialogHeight = height * 0.25;
    const dialogX = width / 2 - dialogWidth / 2;
    const dialogY = height / 2 - dialogHeight / 2;

    // Fondo del diálogo
    const dialogBg = this.scene.add.graphics();
    dialogBg.fillGradientStyle(0x3b5998, 0x3b5998, 0x88c1dd, 0x88c1dd, 0.9);
    dialogBg.fillRoundedRect(dialogX, dialogY, dialogWidth, dialogHeight, 15);
    dialogBg.lineStyle(3, 0x6baed6, 1);
    dialogBg.strokeRoundedRect(dialogX, dialogY, dialogWidth, dialogHeight, 15);

    // Brillo interior
    const dialogGlow = this.scene.add.graphics();
    dialogGlow.fillStyle(0xe8f4fc, 0.2);
    dialogGlow.fillRoundedRect(dialogX + 5, dialogY + 5, dialogWidth - 10, dialogHeight - 10, 10);

    dialogContainer.add([dialogBg, dialogGlow]);

    // Texto del mensaje
    const messageText = this.scene.add.text(width / 2, dialogY + 40, message, {
      fontFamily: 'Arial',
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#ffffff',
      align: 'center',
      stroke: '#003366',
      strokeThickness: 2,
      wordWrap: { width: dialogWidth - 40 }
    }).setOrigin(0.5).setScrollFactor(0);

    dialogContainer.add(messageText);

    // Botones de Confirmar y Cancelar
    const buttonY = dialogY + dialogHeight - 40;
    const buttonWidth = 120;
    const buttonHeight = 40;
    const buttonSpacing = 30;

    // Botón de Confirmar
    const confirmButton = this.createGlacierButton(
      width / 2 - buttonWidth / 2 - buttonSpacing,
      buttonY,
      buttonWidth,
      buttonHeight,
      'SÍ',
      0x4caf50, // Verde para confirmar
      () => {
        // Eliminar el diálogo
        this.scene.tweens.add({
          targets: dialogContainer,
          alpha: 0,
          duration: 200,
          onComplete: () => {
            dialogContainer.destroy();

            // Ejecutar callback
            if (onConfirm) {
              onConfirm();
            }
          }
        });
      }
    );

    // Botón de Cancelar
    const cancelButton = this.createGlacierButton(
      width / 2 + buttonWidth / 2 + buttonSpacing / 2,
      buttonY,
      buttonWidth,
      buttonHeight,
      'NO',
      0xc42828, // Rojo para cancelar
      () => {
        // Eliminar el diálogo con animación
        this.scene.tweens.add({
          targets: dialogContainer,
          alpha: 0,
          duration: 200,
          onComplete: () => {
            dialogContainer.destroy();
          }
        });
      }
    );

    dialogContainer.add([confirmButton, cancelButton]);

    // Añadir efecto de entrada
    dialogContainer.alpha = 0;
    dialogContainer.setScale(0.9);
    this.scene.tweens.add({
      targets: dialogContainer,
      alpha: 1,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });

    this.container.add(dialogContainer);
    return dialogContainer;
  }

  /**
   * Muestra un mensaje temporal
   * @private
   */
  showMessage(message, duration = 2000) {
    // Obtener dimensiones de la pantalla
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Crear contenedor para el mensaje
    const messageContainer = this.scene.add.container(width / 2, height / 2);
    messageContainer.setDepth(1200); // Mayor profundidad que el diálogo de confirmación
    messageContainer.setScrollFactor(0);

    // Fondo del mensaje
    const messageWidth = width * 0.5;
    const messageHeight = 60;
    const messageBg = this.scene.add.graphics();
    messageBg.fillStyle(0x000000, 0.7);
    messageBg.fillRoundedRect(-messageWidth/2, -messageHeight/2, messageWidth, messageHeight, 10);
    messageBg.lineStyle(2, 0xffffff, 0.5);
    messageBg.strokeRoundedRect(-messageWidth/2, -messageHeight/2, messageWidth, messageHeight, 10);

    // Texto del mensaje
    const text = this.scene.add.text(0, 0, message, {
      fontFamily: 'Arial',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0);

    messageContainer.add([messageBg, text]);

    // Efecto de entrada
    messageContainer.alpha = 0;
    messageContainer.y = height / 2 + 50;

    this.scene.tweens.add({
      targets: messageContainer,
      alpha: 1,
      y: height / 2,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Programar desaparición
        this.scene.time.delayedCall(duration, () => {
          this.scene.tweens.add({
            targets: messageContainer,
            alpha: 0,
            y: height / 2 - 50,
            duration: 300,
            ease: 'Back.easeIn',
            onComplete: () => {
              messageContainer.destroy();
            }
          });
        });
      }
    });

    this.container.add(messageContainer);
    return messageContainer;
  }

  /**
   * Oculta el modal
   */
  hide() {
    if (!this.container || !this.isVisible) return;

    this.isVisible = false;

    // Animar salida
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      scale: 0.9,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        if (this.container) {
          this.container.destroy();
          this.container = null;
        }

        // Reanudar el juego si estaba pausado
        if (this.scene.scene.key === 'Game' &&
            this.scene.stateManager &&
            this.scene.stateManager.getState() === 'PAUSED') {
          this.scene.stateManager.resume();
        }
      }
    });

    return this;
  }

  /**
   * Comprueba si el modal está visible
   * @returns {boolean} - True si el modal está visible
   */
  isActive() {
    return this.isVisible;
  }

  /**
   * Destruye el modal y libera recursos
   */
  destroy() {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
    this.isVisible = false;
  }
}
