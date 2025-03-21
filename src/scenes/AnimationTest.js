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

    // Fondo azul claro para simular hielo/cielo
    this.cameras.main.setBackgroundColor('#8ac7db');

    // Añadir título
    this.add.text(width / 2, 50, 'ANIMACIONES DEL PINGÜINO', {
      fontFamily: 'Arial',
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Añadir instrucciones
    this.add.text(width / 2, 90, 'Haz clic en los botones para ver las diferentes animaciones', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Texto para mostrar información de la animación actual
    this.animInfoText = this.add.text(width / 2, height - 80, '', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // Inicializar el contenedor de botones
    this.animButtonsContainer = this.add.container(0, 0);

    // Crear el pingüino en el centro de la pantalla
    this.createPenguin(width / 2, height / 2);

    // Crear los botones de animación
    this.createAnimationButtons();

    // Botón para volver al menú de instrucciones
    this.createBackButton();
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
      }).setOrigin(0.5);

      return;
    }

    // Crear el sprite del pingüino
    this.penguin = this.add.sprite(x, y, 'penguin_sheet', 0);

    // Ajustar tamaño para mejor visualización
    this.penguin.setScale(3);

    // Asegurarse de que las animaciones están creadas
    this.createPenguinAnimations();

    // No intentamos reproducir una animación aquí, lo haremos después
    // de crear los botones para evitar problemas de dependencia circular
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
    } catch (error) {
      console.error('❌ Error al crear animaciones del pingüino:', error);
    }
  }

  /**
   * Crea los botones para cada animación disponible
   */
  createAnimationButtons() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Obtener todas las animaciones definidas
    const animOptions = Object.entries(penguinAnimations);

    // Definir posición de inicio y dimensiones
    const startY = height * 0.75;
    const buttonsPerRow = 4;
    const buttonWidth = 120;
    const buttonHeight = 40;
    const buttonSpacing = 10;
    const totalRows = Math.ceil(animOptions.length / buttonsPerRow);

    // Panel decorativo para los botones
    const panelHeight = totalRows * (buttonHeight + buttonSpacing) + 20;
    const panelWidth = width * 0.9;
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(
      width / 2 - panelWidth / 2,
      startY - 15,
      panelWidth,
      panelHeight,
      15
    );
    this.animButtonsContainer.add(panel);

    // Crear botones para cada animación
    animOptions.forEach(([animName, anim], index) => {
      const row = Math.floor(index / buttonsPerRow);
      const col = index % buttonsPerRow;

      const buttonX = width / 2 + (col - buttonsPerRow/2 + 0.5) * (buttonWidth + buttonSpacing);
      const buttonY = startY + row * (buttonHeight + buttonSpacing);

      // Extraer nombre de la animación para el botón (sin el prefijo)
      const displayName = animName.toUpperCase();

      // Crear botón
      const button = this.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x0066aa, 1)
        .setInteractive()
        .setOrigin(0.5);

      // Texto del botón
      const buttonText = this.add.text(buttonX, buttonY, displayName, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0.5);

      // Eventos del botón
      button.on('pointerover', () => {
        button.setFillStyle(0x0088cc);
      });

      button.on('pointerout', () => {
        button.setFillStyle(0x0066aa);
      });

      button.on('pointerdown', () => {
        this.playAnimation(anim.key);
      });

      // Añadir al container
      this.animButtonsContainer.add([button, buttonText]);
    });

    // Iniciar con la primera animación si hay botones
    if (animOptions.length > 0) {
      const firstAnim = animOptions[0][1]; // [0] es el primer par [nombre, config], [1] es la config
      if (firstAnim && firstAnim.key) {
        this.playAnimation(firstAnim.key);
      }
    }
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

    // Nombre sin prefijo para comparar con los textos de los botones
    const animName = animKey.replace('penguin_', '').toUpperCase();

    // Recorrer todos los elementos del container y destacar el botón correspondiente
    this.animButtonsContainer.each(child => {
      if (child.type === 'Rectangle') {
        const hasButtonText = this.animButtonsContainer.getAll().some(
          other => other.type === 'Text' &&
                  other.text === animName &&
                  Math.abs(other.x - child.x) < 5 &&
                  Math.abs(other.y - child.y) < 5
        );

        if (hasButtonText) {
          child.setStrokeStyle(3, 0xffff00, 1);
        } else {
          child.setStrokeStyle(0);
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

    const width = this.cameras.main.width;

    // Eliminar info previa si existe
    if (this.animInfoText) {
      this.animInfoText.destroy();
    }

    // Crear texto con información de la animación
    let infoText = `Animación: ${key}\n`;
    infoText += `Frames: ${animConfig.frames.join(', ')}\n`;
    infoText += `Velocidad: ${animConfig.frameRate} fps\n`;
    infoText += `Repetición: ${animConfig.repeat === -1 ? 'Infinita' : animConfig.repeat + ' veces'}`;

    this.animInfoText = this.add.text(width / 2, 140, infoText, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 1,
      align: 'center'
    }).setOrigin(0.5);
  }

  /**
   * Crea el botón para volver al menú de instrucciones
   */
  createBackButton() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Botón para volver
    const backButton = this.add.rectangle(width / 2, height - 40, 150, 50, 0xaa0000)
      .setInteractive()
      .setOrigin(0.5);

    // Texto del botón
    const backText = this.add.text(width / 2, height - 40, 'VOLVER', {
      fontFamily: 'Arial',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Eventos del botón
    backButton.on('pointerover', () => {
      backButton.setFillStyle(0xcc0000);
    });

    backButton.on('pointerout', () => {
      backButton.setFillStyle(0xaa0000);
    });

    backButton.on('pointerdown', () => {
      this.handleBackButton();
    });
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
