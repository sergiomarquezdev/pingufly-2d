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
   * Añade un control de volumen con botón mute y slider
   * @private
   */
  addSoundToggle(x, y, width) {
    // Crear contenedor para la opción
    const container = this.scene.add.container(x, y);
    container.setScrollFactor(0);

    // Texto descriptivo - mantener más a la izquierda
    const label = this.scene.add.text(-width/2 + 30, 0, 'SONIDO', {
      fontFamily: 'Arial',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#003366',
      strokeThickness: 3
    }).setOrigin(0, 0.5).setScrollFactor(0);

    container.add(label);

    // Obtener estado actual del sonido
    const isSoundEnabled = this.scene.soundManager ?
      (this.scene.soundManager.isMusicEnabled() && this.scene.soundManager.isSfxEnabled()) : true;

    // Obtener volumen actual (entre 0 y 1)
    const currentVolume = this.scene.soundManager ?
      this.scene.soundManager.getMusicVolume() : 0.1;

    // Convertir a porcentaje para mostrar
    const volumePercentage = Math.round(currentVolume * 100);

    // Dimensiones del control de volumen
    const sliderWidth = width * 0.42; // Reducir un poco más el ancho del slider
    const sliderHeight = 30;
    const sliderY = 0;

    // Tamaño del icono y del control deslizante
    const iconSize = 32;
    const knobSize = sliderHeight - 10;
    const knobRadius = knobSize / 2;

    // Calcular posición del icono - más a la derecha del texto
    const iconX = -width/2 + 160; // Aumentado desde 120 para alejarlo del texto
    const iconY = sliderY;

    // --- ICONO DE ALTAVOZ ---
    // Fondo circular para el icono
    const iconBg = this.scene.add.graphics();
    iconBg.fillStyle(0x2c85c1, 0.9);
    iconBg.fillCircle(iconX, iconY, iconSize/2);
    iconBg.lineStyle(2, 0x6baed6, 0.8);
    iconBg.strokeCircle(iconX, iconY, iconSize/2);

    // Dibujar icono de altavoz según estado y volumen
    const speakerIcon = this.scene.add.graphics();
    speakerIcon.lineStyle(2, 0xFFFFFF, 1);

    // Determinar si debería estar silenciado (isEnabled false o volumen 0)
    const isMuted = !isSoundEnabled || currentVolume === 0;

    // Dibujar altavoz inicial
    this.drawSpeakerIcon(speakerIcon, iconX, iconY, !isMuted);

    // Hacer el icono interactivo
    const iconHitArea = this.scene.add.circle(
      iconX,
      iconY,
      iconSize/2
    ).setInteractive({ useHandCursor: true });

    // --- SLIDER DE VOLUMEN ---
    // Recalcular posición del slider después del icono
    const newSliderX = iconX + iconSize/2 + 25 + sliderWidth/2; // Más separación entre icono y slider

    // Fondo del slider (rectángulo redondeado) con estilo glaciar
    const sliderBg = this.scene.add.graphics();

    // Crear efecto de profundidad (borde inferior y derecho más oscuro)
    sliderBg.lineStyle(2, 0x225577, 0.8);
    sliderBg.strokeRoundedRect(newSliderX - sliderWidth/2 + 1, sliderY - sliderHeight/2 + 1, sliderWidth, sliderHeight, sliderHeight/2);

    // Fondo con gradiente estilo glaciar (similar a los botones)
    sliderBg.fillGradientStyle(0x3d5e7e, 0x3d5e7e, 0x555555, 0x555555, 0.8);
    sliderBg.fillRoundedRect(newSliderX - sliderWidth/2, sliderY - sliderHeight/2, sliderWidth, sliderHeight, sliderHeight/2);

    // Borde exterior
    sliderBg.lineStyle(2, 0x6baed6, 0.9);
    sliderBg.strokeRoundedRect(newSliderX - sliderWidth/2, sliderY - sliderHeight/2, sliderWidth, sliderHeight, sliderHeight/2);

    // Efecto de brillo en la parte superior (similar a los botones glaciares)
    const sliderGlow = this.scene.add.graphics();
    sliderGlow.fillStyle(0xe8f4fc, 0.3);
    sliderGlow.fillRoundedRect(
      newSliderX - sliderWidth/2 + 2,
      sliderY - sliderHeight/2 + 2,
      sliderWidth - 4,
      sliderHeight/2 - 2,
      { tl: sliderHeight/2 - 2, tr: sliderHeight/2 - 2, bl: 0, br: 0 }
    );

    // Barra de progreso (nivel actual)
    const progressBar = this.scene.add.graphics();
    this.updateVolumeBar(progressBar, newSliderX, sliderY, sliderWidth, sliderHeight, currentVolume);

    // Control deslizante (knob)
    const knob = this.scene.add.graphics();
    knob.fillStyle(0x4CAF50, 1);

    // Posición inicial del knob basada en el volumen actual
    const knobPosition = newSliderX - sliderWidth/2 + (sliderWidth * currentVolume);
    knob.fillCircle(knobPosition, sliderY, knobRadius);

    // Texto del porcentaje - más compacto
    const percentText = this.scene.add.text(
      newSliderX + sliderWidth/2 + 15,
      sliderY,
      `${volumePercentage}%`,
      {
        fontFamily: 'Arial',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#ffffff',
        stroke: '#003366',
        strokeThickness: 2
      }
    ).setOrigin(0, 0.5).setScrollFactor(0);

    // Hacer el slider interactivo
    const sliderHitArea = this.scene.add.rectangle(
      newSliderX,
      sliderY,
      sliderWidth + 20, // Ligeramente más ancho para facilitar la interacción
      sliderHeight + 10
    ).setInteractive({ useHandCursor: true });

    // Añadir todo al contenedor
    container.add([iconBg, speakerIcon, sliderBg, sliderGlow, progressBar, knob, percentText, iconHitArea, sliderHitArea]);

    // Variable para rastrear el estado
    const state = {
      isOn: isSoundEnabled,
      volume: currentVolume,
      isDragging: false
    };

    // --- EVENTOS PARA EL ICONO DE ALTAVOZ ---
    iconHitArea.on('pointerdown', (pointer, localX, localY, event) => {
      event.stopPropagation();

      // Reproducir sonido de botón si está disponible y el sonido está activado
      if (this.scene.soundManager && state.isOn && state.volume > 0) {
        this.scene.soundManager.playSfx('sfx_button');
      }

      // Cambiar estado
      state.isOn = !state.isOn;

      // Redibujamos el icono según el nuevo estado
      speakerIcon.clear();
      this.drawSpeakerIcon(speakerIcon, iconX, iconY, state.isOn);

      // Actualizar la configuración de sonido
      if (this.scene.soundManager) {
        this.scene.soundManager.setMusicEnabled(state.isOn);
        this.scene.soundManager.setSfxEnabled(state.isOn);
      }
    });

    // --- EVENTOS PARA EL SLIDER ---
    // Evento de clic en el slider
    sliderHitArea.on('pointerdown', (pointer, localX, localY, event) => {
      event.stopPropagation();
      state.isDragging = true;

      // Obtener la posición X relativa al slider
      const relativeX = pointer.x - (x + newSliderX - sliderWidth/2);

      // Calcular el nuevo volumen (0-1)
      const newVolume = Phaser.Math.Clamp(relativeX / sliderWidth, 0, 1);
      state.volume = newVolume;

      // Actualizar interfaz y aplicar el volumen
      this.updateVolumeControls(state, knob, progressBar, percentText, newSliderX, sliderY, sliderWidth, sliderHeight, speakerIcon, iconX, iconY);

      // Si el sonido estaba desactivado y ponemos volumen > 0, activarlo
      if (!state.isOn && state.volume > 0) {
        state.isOn = true;

        if (this.scene.soundManager) {
          this.scene.soundManager.setMusicEnabled(true);
          this.scene.soundManager.setSfxEnabled(true);
        }
      }
    });

    // Evento de movimiento para arrastrar el knob
    this.scene.input.on('pointermove', (pointer) => {
      if (state.isDragging) {
        // Obtener la posición X relativa al slider
        const relativeX = pointer.x - (x + newSliderX - sliderWidth/2);

        // Calcular el nuevo volumen (0-1)
        const newVolume = Phaser.Math.Clamp(relativeX / sliderWidth, 0, 1);
        state.volume = newVolume;

        // Actualizar interfaz y aplicar el volumen
        this.updateVolumeControls(state, knob, progressBar, percentText, newSliderX, sliderY, sliderWidth, sliderHeight, speakerIcon, iconX, iconY);
      }
    });

    // Evento para dejar de arrastrar
    this.scene.input.on('pointerup', () => {
      state.isDragging = false;
    });

    // Guardar referencia al control de volumen
    this.toggles.sound = {
      container,
      state
    };

    // Limpiar eventos al destruir
    this.scene.events.once('shutdown', () => {
      this.scene.input.off('pointermove');
      this.scene.input.off('pointerup');
    });

    this.container.add(container);
    return container;
  }

  /**
   * Dibuja el icono de altavoz según el estado
   * @private
   */
  drawSpeakerIcon(graphics, x, y, isEnabled) {
    graphics.clear();
    graphics.lineStyle(2, 0xFFFFFF, 1);

    // Base del altavoz (igual en ambos estados)
    graphics.beginPath();
    graphics.moveTo(x - 6, y - 2);
    graphics.lineTo(x - 2, y - 2);
    graphics.lineTo(x + 2, y - 6);
    graphics.lineTo(x + 2, y + 6);
    graphics.lineTo(x - 2, y + 2);
    graphics.lineTo(x - 6, y + 2);
    graphics.closePath();
    graphics.strokePath();

    if (isEnabled) {
      // Ondas de sonido (solo si está activado)
      graphics.beginPath();
      graphics.arc(x, y, 8, -0.7, 0.7, false);
      graphics.strokePath();

      graphics.beginPath();
      graphics.arc(x, y, 12, -0.5, 0.5, false);
      graphics.strokePath();
    } else {
      // X de mute (solo si está desactivado)
      graphics.beginPath();
      graphics.moveTo(x + 5, y - 5);
      graphics.lineTo(x + 10, y - 10);
      graphics.moveTo(x + 10, y - 5);
      graphics.lineTo(x + 5, y - 10);
      graphics.strokePath();
    }
  }

  /**
   * Actualiza la barra de volumen
   * @private
   */
  updateVolumeBar(graphics, x, y, width, height, volume) {
    graphics.clear();

    // Solo dibujamos si hay volumen
    if (volume > 0) {
      const fillWidth = width * volume;

      // Gradiente azul para la barra de progreso
      graphics.fillGradientStyle(0x2c85c1, 0x88c1dd, 0x2c85c1, 0x88c1dd, 1);

      // Dibujamos la barra redondeada en los extremos
      if (fillWidth >= height) {
        // Si la barra es suficientemente ancha, usamos bordes redondeados
        graphics.fillRoundedRect(
          x - width/2,
          y - height/2,
          fillWidth,
          height,
          { tl: height/2, bl: height/2, tr: 0, br: 0 }
        );
      } else {
        // Si es muy corta, usamos un círculo
        graphics.fillCircle(
          x - width/2 + fillWidth/2,
          y,
          height/2 - 1
        );
      }
    }
  }

  /**
   * Actualiza todos los controles de volumen
   * @private
   */
  updateVolumeControls(state, knob, progressBar, percentText, sliderX, sliderY, sliderWidth, sliderHeight, speakerIcon, iconX, iconY) {
    // Actualizar posición del knob
    knob.clear();
    knob.fillStyle(0x4CAF50, 1);
    const knobPosition = sliderX - sliderWidth/2 + (sliderWidth * state.volume);
    knob.fillCircle(knobPosition, sliderY, (sliderHeight - 10) / 2);

    // Actualizar barra de progreso
    this.updateVolumeBar(progressBar, sliderX, sliderY, sliderWidth, sliderHeight, state.volume);

    // Actualizar texto de porcentaje
    const volumePercentage = Math.round(state.volume * 100);
    percentText.setText(`${volumePercentage}%`);

    // Verificar si debemos actualizar el icono basado en el volumen
    if (speakerIcon && iconX !== undefined && iconY !== undefined) {
      const shouldBeMuted = state.volume === 0 || !state.isOn;

      // Redibujamos el icono solo si el estado mute cambió
      speakerIcon.clear();
      this.drawSpeakerIcon(speakerIcon, iconX, iconY, !shouldBeMuted);
    }

    // Aplicar volumen al SoundManager
    if (this.scene.soundManager) {
      this.scene.soundManager.setMusicVolume(state.volume);
      this.scene.soundManager.setSfxVolume(state.volume);
    }
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
