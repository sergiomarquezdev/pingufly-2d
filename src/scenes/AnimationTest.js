/**
 * Escena AnimationTest - Permite probar todas las animaciones del pingüino
 * Se accede desde el menú de instrucciones
 */

import Phaser from 'phaser';
import penguinAnimations from '../config/penguinAnimations';

export default class AnimationTest extends Phaser.Scene {
  constructor() {
    super('AnimationTest');

    this.penguin = null;
    this.animButtonsContainer = null;
    this.currentAnimation = null;
    this.animInfoText = null;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Añadir fondo invernal similar al menú principal
    this.createWinterBackground(width, height);

    // Panel principal para la escena
    this.createMainPanel(width, height);

    // Crear el pingüino en el centro de la pantalla
    this.createPenguin(width / 2, height * 0.45);

    // Crear los botones de animación
    this.createAnimationButtons();

    // Botón para volver al menú de instrucciones (ahora en la esquina superior izquierda)
    this.createBackButton();

    // Añadir copos de nieve animados
    this.createSnowflakes(width, height);
  }

  /**
   * Crea el fondo invernal similar al del menú principal
   */
  createWinterBackground(width, height) {
    // Fondo principal con imagen de cielo
    this.add.image(width / 2, height / 2, 'background_sky')
      .setScale(1.2)
      .setDepth(0);

    // Añadir el sol
    const sun = this.add.image(width * 0.2, height * 0.1, 'background_sun')
      .setScale(0.2)
      .setDepth(1);

    // Animar el brillo del sol
    this.tweens.add({
      targets: sun,
      alpha: 0.8,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Añadir montañas en el fondo
    this.add.image(width / 2, height * 0.8, 'background_mountain_01')
      .setScale(0.4)
      .setDepth(1);

    // Añadir textura de nieve en el suelo
    this.add.tileSprite(width / 2, height - 20, width, 100, 'snow_texture')
      .setAlpha(0.8)
      .setDepth(1);

    // Añadir nubes en diferentes posiciones
    const clouds = [
      { key: 'cloud_01', x: width * 0.2, y: height * 0.3, scale: 0.8 },
      { key: 'cloud_02', x: width * 0.5, y: height * 0.2, scale: 0.6 },
      { key: 'cloud_03', x: width * 0.8, y: height * 0.25, scale: 0.7 },
      { key: 'cloud_04', x: width * 0.1, y: height * 0.15, scale: 0.5 }
    ];

    // Crear y animar cada nube
    clouds.forEach(cloud => {
      const cloudSprite = this.add.image(cloud.x, cloud.y, cloud.key)
        .setScale(cloud.scale)
        .setAlpha(0.8)
        .setDepth(2);

      // Animación de movimiento lento horizontal
      this.tweens.add({
        targets: cloudSprite,
        x: cloudSprite.x + Phaser.Math.Between(50, 100),
        duration: Phaser.Math.Between(15000, 25000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // Añadir árboles nevados en los bordes
    const treePositions = [
      { key: 'snow_tree_01', x: width * 0.1, y: height * 0.9, scale: 0.5, depth: 3 },
      { key: 'snow_tree_01', x: width * 0.9, y: height * 0.93, scale: 0.4, depth: 3 }
    ];

    treePositions.forEach(pos => {
      this.add.image(pos.x, pos.y, pos.key)
        .setScale(pos.scale)
        .setDepth(pos.depth);
    });

    // Añadir un muñeco de nieve decorativo
    const snowman = this.add.image(width * 0.85, height * 0.9, 'snowman')
      .setScale(0.5)
      .setDepth(3);

    // Recortar 1px de la parte superior para eliminar la línea extraña
    snowman.setCrop(0, 1, 64, 63);
  }

  /**
   * Crea un área central que destaca la animación del pingüino
   */
  createCentralArea(width, height) {
    // Crear un área central que separe visualmente el pingüino
    const centralY = height * 0.41;
    const centralAreaWidth = width * 0.5;
    const centralAreaHeight = height * 0.22;

    // Contenedor para el área central
    const centralAreaContainer = this.add.container(0, 0);
    centralAreaContainer.setDepth(9); // Por debajo de los elementos de UI pero encima del fondo

    // Fondo sutil para el área central
    const centralAreaBg = this.add.graphics();
    centralAreaBg.fillStyle(0x004080, 0.1);
    centralAreaBg.fillRoundedRect(
      width / 2 - centralAreaWidth / 2,
      centralY - centralAreaHeight / 2,
      centralAreaWidth,
      centralAreaHeight,
      15
    );
    centralAreaBg.lineStyle(2, 0x6baed6, 0.3);
    centralAreaBg.strokeRoundedRect(
      width / 2 - centralAreaWidth / 2,
      centralY - centralAreaHeight / 2,
      centralAreaWidth,
      centralAreaHeight,
      15
    );

    // Efectos decorativos - copos pequeños en el área central
    for (let i = 0; i < 6; i++) {
      const x = width / 2 + Phaser.Math.Between(-centralAreaWidth/2 + 20, centralAreaWidth/2 - 20);
      const y = centralY + Phaser.Math.Between(-centralAreaHeight/2 + 20, centralAreaHeight/2 - 20);
      const scale = Phaser.Math.FloatBetween(0.05, 0.08);

      const decorSnowflake = this.add.image(x, y, 'snowflake')
        .setScale(scale)
        .setAlpha(0.3);

      centralAreaContainer.add(decorSnowflake);
    }

    centralAreaContainer.add(centralAreaBg);
  }

  /**
   * Crea el panel principal con aspecto de hielo
   */
  createMainPanel(width, height) {
    // Panel principal que contendrá el título y la información
    const panelWidth = width * 0.82;
    const panelHeight = height * 0.18;
    const panelY = height * 0.13;

    // Crear container para el panel principal
    const mainPanelContainer = this.add.container(0, 0);
    mainPanelContainer.setDepth(10);

    // Crear el panel decorativo con gradiente de hielo
    const mainPanel = this.add.graphics();
    mainPanel.fillGradientStyle(0x2c85c1, 0x2c85c1, 0x88c1dd, 0x88c1dd, 0.9);
    mainPanel.fillRoundedRect(
      width / 2 - panelWidth / 2,
      panelY - panelHeight / 2,
      panelWidth,
      panelHeight,
      20
    );
    mainPanel.lineStyle(4, 0x6baed6, 1);
    mainPanel.strokeRoundedRect(
      width / 2 - panelWidth / 2,
      panelY - panelHeight / 2,
      panelWidth,
      panelHeight,
      20
    );

    // Efecto de brillo interno - simula luz reflejada en hielo
    const iceDetails = this.add.graphics();
    iceDetails.fillStyle(0xe8f4fc, 0.4);
    iceDetails.fillRoundedRect(
      width / 2 - panelWidth / 2 + 10,
      panelY - panelHeight / 2 + 10,
      panelWidth - 20,
      panelHeight - 20,
      15
    );

    mainPanelContainer.add([mainPanel, iceDetails]);

    // Añadir título con estilo similar al del menú
    const title = this.add.text(width / 2, panelY - panelHeight * 0.2, 'ANIMACIONES DEL PINGÜINO', {
      fontFamily: 'Arial',
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#003366',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Añadir instrucciones
    const instructions = this.add.text(width / 2, panelY + panelHeight * 0.25, 'Haz clic en los botones para ver las diferentes animaciones', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#003366',
      strokeThickness: 2
    }).setOrigin(0.5);

    mainPanelContainer.add([title, instructions]);

    // Crear contenedor para la información de la animación más compacto
    const infoY = panelY + panelHeight * 0.6;
    const infoContainer = this.add.container(width / 2, infoY);
    infoContainer.setSize(panelWidth * 0.75, 36);

    // Fondo para la información - diseño más integrado
    const infoBg = this.add.graphics();
    infoBg.fillGradientStyle(0x004080, 0x0066aa, 0x0066aa, 0x004080, 0.25);
    infoBg.fillRoundedRect(-infoContainer.width / 2, -18, infoContainer.width, 36, 8);
    infoBg.lineStyle(1, 0x6baed6, 0.5);
    infoBg.strokeRoundedRect(-infoContainer.width / 2, -18, infoContainer.width, 36, 8);

    infoContainer.add(infoBg);

    // Crear el texto de información (vacío inicialmente)
    this.animInfoText = this.add.text(0, 0, '', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
      align: 'center',
      stroke: '#003366',
      strokeThickness: 1
    }).setOrigin(0.5);

    infoContainer.add(this.animInfoText);
    mainPanelContainer.add(infoContainer);

    // Brillo sutil para el panel de información
    this.tweens.add({
      targets: infoBg,
      alpha: 0.4,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Crea el sprite del pingüino
   */
  createPenguin(x, y) {
    // Verificar que el sprite sheet está cargado
    if (!this.textures.exists('penguin_sheet')) {
      console.error('❌ Error: El sprite sheet "penguin_sheet" no está cargado');

      // Mostrar mensaje de error en lugar del pingüino
      this.add.text(x, y, 'Error: Sprite del pingüino no disponible', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ff0000',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }).setOrigin(0.5).setDepth(10);

      return;
    }

    // Crear contenedor para el pingüino
    const penguinContainer = this.add.container(0, 0);
    penguinContainer.setDepth(10);

    // Crear el sprite del pingüino
    this.penguin = this.add.sprite(x, y, 'penguin_sheet', 0);

    // Ajustar tamaño para mejor visualización
    this.penguin.setScale(2.6);

    // Después de crear el sprite
    this.penguin.setCrop(0, 1, 32, 31); // Recorta 1px de la parte superior

    penguinContainer.add(this.penguin);

    // Añadir una leve animación de flotación
    this.tweens.add({
      targets: this.penguin,
      y: y - 6,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Asegurarse de que las animaciones están creadas
    this.createPenguinAnimations();
  }

  /**
   * Crea las animaciones del pingüino si aún no existen
   */
  createPenguinAnimations() {
    try {
      // Recorrer todas las animaciones definidas y crearlas si no existen
      Object.values(penguinAnimations).forEach(animConfig => {
        // Verificar si la animación ya existe
        if (!this.anims.exists(animConfig.key)) {
          // Crear la animación
          this.anims.create({
            key: animConfig.key,
            frames: this.anims.generateFrameNumbers('penguin_sheet', {
              frames: animConfig.frames
            }),
            frameRate: animConfig.frameRate,
            repeat: animConfig.repeat
          });
        }
      });

      // Iniciar con la primera animación disponible
      const firstAnim = Object.values(penguinAnimations)[0];
      if (firstAnim && firstAnim.key) {
        this.playAnimation(firstAnim.key);
      }
    } catch (error) {
      console.error('❌ Error al crear animaciones del pingüino:', error);
    }
  }

  /**
   * Crea los botones para cada animación disponible con estilo glaciar
   */
  createAnimationButtons() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Obtener todas las animaciones definidas
    const animOptions = Object.entries(penguinAnimations);

    // Definir posición de inicio y dimensiones - mejorar distribución y bajar posición
    const startY = height * 0.68; // Bajado desde 0.65
    const buttonsPerRow = 4;
    const buttonWidth = 120;
    const buttonHeight = 38;
    const buttonSpacing = 20;
    const totalRows = Math.ceil(animOptions.length / buttonsPerRow);

    // Panel decorativo para los botones con estilo de hielo
    const panelHeight = totalRows * (buttonHeight + buttonSpacing) + 45;
    const panelWidth = width * 0.88;

    // Crear el contenedor para los botones
    this.animButtonsContainer = this.add.container(0, 0);
    this.animButtonsContainer.setDepth(10);

    // Panel de fondo
    const panel = this.add.graphics();
    panel.fillGradientStyle(0x2c85c1, 0x2c85c1, 0x88c1dd, 0x88c1dd, 0.8);
    panel.fillRoundedRect(
      width / 2 - panelWidth / 2,
      startY - 35, // Espacio adicional en la parte superior
      panelWidth,
      panelHeight,
      20
    );
    panel.lineStyle(3, 0x6baed6, 1);
    panel.strokeRoundedRect(
      width / 2 - panelWidth / 2,
      startY - 35,
      panelWidth,
      panelHeight,
      20
    );

    // Efecto de brillo interno
    const panelGlow = this.add.graphics();
    panelGlow.fillStyle(0xe8f4fc, 0.2);
    panelGlow.fillRoundedRect(
      width / 2 - panelWidth / 2 + 10,
      startY - 25,
      panelWidth - 20,
      panelHeight - 20,
      15
    );

    this.animButtonsContainer.add([panel, panelGlow]);

    // Añadir título al panel de botones - bajado ligeramente
    const buttonsPanelTitle = this.add.text(width / 2, startY - 15, 'SELECCIONA UNA ANIMACIÓN', {
      fontFamily: 'Arial',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#003366',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.animButtonsContainer.add(buttonsPanelTitle);

    // Crear botones para cada animación con estilo de hielo
    animOptions.forEach(([animName, anim], index) => {
      const row = Math.floor(index / buttonsPerRow);
      const col = index % buttonsPerRow;

      const buttonX = width / 2 + (col - buttonsPerRow/2 + 0.5) * (buttonWidth + buttonSpacing);
      const buttonY = startY + row * (buttonHeight + buttonSpacing) + 25; // Ajuste vertical por el título

      // Extraer nombre de la animación para el botón - adaptación para mejor visualización
      const displayName = animName.toUpperCase().replace('PENGUIN_', '');

      // Crear botón con estilo de hielo
      const buttonBg = this.add.graphics();
      buttonBg.fillGradientStyle(0x2c85c1, 0x2c85c1, 0x88c1dd, 0x88c1dd, 1);
      buttonBg.fillRoundedRect(
        buttonX - buttonWidth/2,
        buttonY - buttonHeight/2,
        buttonWidth,
        buttonHeight,
        10
      );

      // Borde del botón
      const buttonBorder = this.add.graphics();
      buttonBorder.lineStyle(2, 0xffaa00, 1);
      buttonBorder.strokeRoundedRect(
        buttonX - buttonWidth/2,
        buttonY - buttonHeight/2,
        buttonWidth,
        buttonHeight,
        10
      );

      // Brillo interior
      const buttonGlow = this.add.graphics();
      buttonGlow.fillStyle(0xe8f4fc, 0.3);
      buttonGlow.fillRoundedRect(
        buttonX - buttonWidth/2 + 4,
        buttonY - buttonHeight/2 + 4,
        buttonWidth - 8,
        buttonHeight - 8,
        7
      );

      // Texto del botón
      const buttonText = this.add.text(buttonX, buttonY, displayName, {
        fontFamily: 'Arial',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#ffffff',
        stroke: '#003366',
        strokeThickness: 1
      }).setOrigin(0.5);

      // Zona interactiva
      const buttonZone = this.add.zone(
        buttonX,
        buttonY,
        buttonWidth,
        buttonHeight
      ).setInteractive();

      // Añadir referencia para identificar el botón
      buttonZone.animationKey = anim.key;

      // Eventos del botón
      buttonZone.on('pointerover', () => {
        buttonBg.clear();
        buttonBg.fillGradientStyle(0x3997d3, 0x3997d3, 0x99d2ee, 0x99d2ee, 1);
        buttonBg.fillRoundedRect(
          buttonX - buttonWidth/2,
          buttonY - buttonHeight/2,
          buttonWidth,
          buttonHeight,
          10
        );

        buttonGlow.clear();
        buttonGlow.fillStyle(0xe8f4fc, 0.5);
        buttonGlow.fillRoundedRect(
          buttonX - buttonWidth/2 + 4,
          buttonY - buttonHeight/2 + 4,
          buttonWidth - 8,
          buttonHeight - 8,
          7
        );

        buttonText.setScale(1.1);
      });

      buttonZone.on('pointerout', () => {
        buttonBg.clear();
        buttonBg.fillGradientStyle(0x2c85c1, 0x2c85c1, 0x88c1dd, 0x88c1dd, 1);
        buttonBg.fillRoundedRect(
          buttonX - buttonWidth/2,
          buttonY - buttonHeight/2,
          buttonWidth,
          buttonHeight,
          10
        );

        buttonGlow.clear();
        buttonGlow.fillStyle(0xe8f4fc, 0.3);
        buttonGlow.fillRoundedRect(
          buttonX - buttonWidth/2 + 4,
          buttonY - buttonHeight/2 + 4,
          buttonWidth - 8,
          buttonHeight - 8,
          7
        );

        buttonText.setScale(1);
      });

      buttonZone.on('pointerdown', () => {
        this.playAnimation(anim.key);
      });

      // Almacenar referencias para el resaltado
      buttonZone.components = {
        bg: buttonBg,
        border: buttonBorder,
        glow: buttonGlow,
        text: buttonText
      };

      // Añadir al container
      this.animButtonsContainer.add([buttonBg, buttonGlow, buttonBorder, buttonText, buttonZone]);
    });
  }

  /**
   * Destaca el botón de la animación actual
   */
  highlightCurrentAnimation(animKey) {
    // Verificar que el contenedor y la animación existen
    if (!this.animButtonsContainer || !animKey) {
      return;
    }

    this.currentAnimation = animKey;

    // Recorrer todos los elementos de zona en el contenedor
    this.animButtonsContainer.each(child => {
      if (child.type === 'Zone' && child.animationKey) {
        const components = child.components;
        if (!components) return;

        if (child.animationKey === animKey) {
          // Resaltar el botón activo
          components.border.clear();
          components.border.lineStyle(3, 0xff8c00, 1);
          components.border.strokeRoundedRect(
            child.x - child.width/2,
            child.y - child.height/2,
            child.width,
            child.height,
            10
          );
          components.text.setScale(1.1);
        } else {
          // Restaurar botones no activos
          components.border.clear();
          components.border.lineStyle(2, 0xffaa00, 1);
          components.border.strokeRoundedRect(
            child.x - child.width/2,
            child.y - child.height/2,
            child.width,
            child.height,
            10
          );
          components.text.setScale(1);
        }
      }
    });
  }

  /**
   * Reproduce una animación específica en el pingüino
   */
  playAnimation(key) {
    if (!this.penguin) {
      console.error('No se pudo reproducir la animación: el pingüino no existe');
      return;
    }

    if (!key || !this.anims.exists(key)) {
      console.error(`No se pudo reproducir la animación: la clave "${key}" no existe`);
      return;
    }

    // Detener la animación actual si existe
    if (this.penguin.anims.isPlaying) {
      this.penguin.anims.stop();
    }

    // Obtener la configuración de esta animación
    const animName = key.replace('penguin_', '');
    const animConfig = penguinAnimations[animName];

    if (animConfig) {
      // Aplicar flipX si está definido en la configuración
      if (animConfig.flipX !== undefined) {
        this.penguin.setFlipX(animConfig.flipX);
      }
    }

    // Reproducir la animación
    this.penguin.play(key);

    // Destacar el botón actual
    this.highlightCurrentAnimation(key);

    // Mostrar información de la animación
    this.showAnimationInfo(key, animConfig);
  }

  /**
   * Muestra información sobre la animación actual
   */
  showAnimationInfo(key, animConfig) {
    if (!animConfig) {
      // Si no se proporcionó la configuración, intentar encontrarla
      const animName = key.replace('penguin_', '');
      animConfig = penguinAnimations[animName];

      if (!animConfig) {
        console.error(`No se pudo encontrar la configuración para la animación "${key}"`);
        return;
      }
    }

    // Extraer el nombre amigable para el usuario
    const displayName = key.replace('penguin_', '').toUpperCase();

    // Actualizar el texto con información de la animación - formato mejorado
    let infoText = `Animación: ${displayName}   •   `;
    infoText += `Frames: ${animConfig.frames.length}   •   `;
    infoText += `FPS: ${animConfig.frameRate}   •   `;
    infoText += `Repetición: ${animConfig.repeat === -1 ? 'Infinita' : animConfig.repeat + ' veces'}`;

    this.animInfoText.setText(infoText);
  }

  /**
   * Crea el botón para volver al menú de instrucciones - ahora como un círculo con flecha en la esquina superior izquierda
   */
  createBackButton() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Contenedor para el botón de volver
    const backButtonContainer = this.add.container(0, 0);
    backButtonContainer.setDepth(10);

    // Posición en la esquina superior izquierda
    const buttonX = 40;
    const buttonY = 40;
    const buttonRadius = 25;

    // Crear círculo de fondo
    const backButtonBg = this.add.circle(buttonX, buttonY, buttonRadius, 0x0066aa, 0.9);
    backButtonBg.setStrokeStyle(3, 0xffaa00, 1);

    // Efecto de brillo interno
    const backButtonGlow = this.add.circle(buttonX, buttonY, buttonRadius - 5, 0x88c1dd, 0.3);

    // Crear icono de flecha
    const arrowGraphic = this.add.graphics();
    arrowGraphic.fillStyle(0xffffff, 1);
    arrowGraphic.lineStyle(3, 0xffffff, 1);

    // Dibujar triángulo para la punta de la flecha
    arrowGraphic.beginPath();
    arrowGraphic.moveTo(buttonX - 8, buttonY);
    arrowGraphic.lineTo(buttonX - 2, buttonY - 8);
    arrowGraphic.lineTo(buttonX - 2, buttonY + 8);
    arrowGraphic.closePath();
    arrowGraphic.fillPath();

    // Dibujar línea horizontal para la flecha
    arrowGraphic.moveTo(buttonX - 2, buttonY);
    arrowGraphic.lineTo(buttonX + 10, buttonY);
    arrowGraphic.strokePath();

    backButtonContainer.add([backButtonBg, backButtonGlow, arrowGraphic]);

    // Crear zona interactiva
    const backButton = this.add.zone(
      buttonX,
      buttonY,
      buttonRadius * 2,
      buttonRadius * 2
    ).setInteractive();

    backButtonContainer.add(backButton);

    // Eventos del botón
    backButton.on('pointerover', () => {
      backButtonBg.setFillStyle(0x3997d3, 0.9);
      backButtonGlow.setAlpha(0.5);
      arrowGraphic.setAlpha(0.8);

      // Escalar ligeramente
      backButtonBg.setScale(1.05);
      backButtonGlow.setScale(1.05);
      arrowGraphic.setScale(1.05);
    });

    backButton.on('pointerout', () => {
      backButtonBg.setFillStyle(0x0066aa, 0.9);
      backButtonGlow.setAlpha(0.3);
      arrowGraphic.setAlpha(1);

      // Restaurar escala
      backButtonBg.setScale(1);
      backButtonGlow.setScale(1);
      arrowGraphic.setScale(1);
    });

    backButton.on('pointerdown', () => {
      this.handleBackButton();
    });
  }

  /**
   * Crea copos de nieve animados
   */
  createSnowflakes(width, height) {
    // Crear 20 copos de nieve con el sprite
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(-100, height);
      const scale = Phaser.Math.FloatBetween(0.1, 0.2);
      const rotationSpeed = Phaser.Math.FloatBetween(0.1, 0.3);

      // Crear un copo de nieve usando el sprite
      const snowflake = this.add.image(x, y, 'snowflake')
        .setScale(scale)
        .setAlpha(Phaser.Math.FloatBetween(0.5, 0.9))
        .setDepth(8);

      // Animación de caída con rotación
      this.tweens.add({
        targets: snowflake,
        y: height + 100,
        x: x + Phaser.Math.Between(-100, 100),
        rotation: snowflake.rotation + rotationSpeed * 10,
        duration: Phaser.Math.Between(8000, 20000),
        ease: 'Linear',
        repeat: -1,
        onRepeat: () => {
          snowflake.y = Phaser.Math.Between(-100, -20);
          snowflake.x = Phaser.Math.Between(0, width);
          snowflake.alpha = Phaser.Math.FloatBetween(0.5, 0.9);
          snowflake.rotation = 0;
        }
      });
    }

    // Añadir unos pocos copos grandes en primer plano
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(-100, height);
      const scale = Phaser.Math.FloatBetween(0.3, 0.5);
      const rotationSpeed = Phaser.Math.FloatBetween(0.05, 0.15);

      const largeSnowflake = this.add.image(x, y, 'snowflake')
        .setScale(scale)
        .setAlpha(Phaser.Math.FloatBetween(0.7, 1))
        .setDepth(9);

      // Animación de caída más rápida para copos cercanos
      this.tweens.add({
        targets: largeSnowflake,
        y: height + 100,
        x: x + Phaser.Math.Between(-150, 150),
        rotation: largeSnowflake.rotation + rotationSpeed * 10,
        duration: Phaser.Math.Between(6000, 10000),
        ease: 'Linear',
        repeat: -1,
        onRepeat: () => {
          largeSnowflake.y = Phaser.Math.Between(-100, -20);
          largeSnowflake.x = Phaser.Math.Between(0, width);
          largeSnowflake.alpha = Phaser.Math.FloatBetween(0.7, 1);
          largeSnowflake.rotation = 0;
        }
      });
    }
  }

  handleBackButton() {
    // Agregar una transición de salida
    this.cameras.main.fade(300, 0, 0, 0, false, (camera, progress) => {
      if (progress === 1) {
        // Volver al menú y mostrar automáticamente las instrucciones
        this.scene.start('Menu', { showInstructions: true });
      }
    });
  }
}
