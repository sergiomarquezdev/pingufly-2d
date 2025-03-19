import Phaser from 'phaser';
import ButtonFactory from './ButtonFactory';

/**
 * Clase que maneja la pantalla de fin de juego
 */
export default class GameOverScreen {
  /**
   * Constructor de la clase GameOverScreen
   * @param {Phaser.Scene} scene - La escena a la que pertenece la pantalla
   */
  constructor(scene) {
    this.scene = scene;
    this.container = null;
  }

  /**
   * Muestra la pantalla de fin de juego
   * @param {Object} config - Configuración de la pantalla
   * @param {number} config.totalDistance - Distancia total recorrida
   * @param {number} config.bestDistance - Mejor distancia histórica
   * @param {Function} config.onRestart - Función a llamar cuando se hace clic en "Volver a Jugar"
   * @param {Function} config.onMainMenu - Función a llamar cuando se hace clic en "Menú Principal"
   */
  show(config) {
    const { totalDistance, bestDistance, onRestart, onMainMenu } = config;

    // Verificar si hay un récord nuevo
    const isNewRecord = totalDistance > bestDistance;

    // Tamaño del canvas
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    // Crear el contenedor principal
    this.container = this.scene.add.container(width / 2, height / 2).setScrollFactor(0).setDepth(100);

    // Calcular altura del panel según si hay récord o no
    const panelHeight = isNewRecord ? 440 : 380;

    // Fondo oscuro semitransparente que cubre toda la pantalla
    const modalOverlay = this.scene.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.7)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: false }) // Hacer el overlay interactivo
      .on('pointerdown', (pointer) => {
        // Capturar los clics en el overlay pero permitir que se propaguen a los botones dentro del modal
        // Solo detener propagación a elementos fuera del modal
        if (pointer.event && !this.isClickOnButton(pointer)) {
          pointer.event.stopPropagation();
        }
      });

    this.container.add(modalOverlay);

    // Panel principal con borde
    const panelWidth = 440;

    // Borde exterior (dorado)
    const outerPanel = this.scene.add.rectangle(0, 0, panelWidth + 6, panelHeight + 6, 0xffdd00, 1)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xffdd00);

    // Panel interior (azul)
    const innerPanel = this.scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x104080, 0.9)
      .setOrigin(0.5)
      .setStrokeStyle(1, 0x1e90ff);

    // Añadir efecto de estrellas en el fondo del panel
    const starfield = this.scene.add.tileSprite(0, 0, panelWidth, panelHeight, 'sky')
      .setOrigin(0.5)
      .setAlpha(0.3)
      .setTint(0x104080);

    // Añadir los paneles al contenedor
    this.container.add([starfield, outerPanel, innerPanel]);

    // Añadir título "JUEGO TERMINADO"
    const gameOverText = this.scene.add.text(0, -panelHeight/2 + 50, 'JUEGO TERMINADO', {
      fontFamily: 'Impact',
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5);
    this.container.add(gameOverText);

    // Contenedor para la información de distancia
    const infoContainer = this.scene.add.container(0, -panelHeight/2 + 120);
    this.container.add(infoContainer);

    // Añadir texto de distancia total
    const distanceText = this.scene.add.text(0, 0, 'DISTANCIA TOTAL', {
      fontFamily: 'Impact',
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    const distanceValueText = this.scene.add.text(0, 30, totalDistance + ' m', {
      fontFamily: 'Impact',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#104080',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5);

    infoContainer.add([distanceText, distanceValueText]);

    let recordContainer = null;

    // Si hay un nuevo récord, mostrar mensaje especial
    if (isNewRecord) {
      // Crear un contenedor para el mensaje de récord
      recordContainer = this.scene.add.container(0, 0);
      this.container.add(recordContainer);

      // Fondo del récord
      const recordBg = this.scene.add.rectangle(0, 0, 300, 40, 0x000000, 0.4)
        .setOrigin(0.5)
        .setStrokeStyle(2, 0xffdd00);

      // Texto del récord
      const recordText = this.scene.add.text(0, 0, '¡NUEVO RÉCORD!', {
        fontFamily: 'Impact',
        fontSize: '32px',
        color: '#ffdd00',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center'
      }).setOrigin(0.5);

      // Añadir al contenedor de récord
      recordContainer.add([recordBg, recordText]);

      // Animación para el texto de nuevo récord
      this.scene.tweens.add({
        targets: recordText,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1
      });

      // Añadir brillo alrededor del valor de distancia
      const glow = this.scene.add.graphics();
      glow.fillStyle(0xffdd00, 0.2);
      glow.fillCircle(0, 30, 110);
      infoContainer.add(glow);
      infoContainer.sendToBack(glow);

      // Poner el texto de distancia por encima del brillo
      infoContainer.bringToTop(distanceValueText);

      // Añadir efecto de destello
      this.scene.tweens.add({
        targets: glow,
        alpha: { from: 0.3, to: 0 },
        duration: 800,
        yoyo: true,
        repeat: -1
      });
    }

    // Crear los botones y calcular sus posiciones verticales
    const buttonSpacing = 70;
    let firstButtonY;

    if (isNewRecord) {
      firstButtonY = 70;
      // Posicionar el contenedor del récord
      recordContainer.setPosition(0, firstButtonY - 40);
    } else {
      firstButtonY = 30;
    }

    // Funciones de callback para los botones
    const handleRestart = () => {
      this.hide();
      if (onRestart && typeof onRestart === 'function') {
        onRestart();
      }
    };

    const handleMainMenu = () => {
      this.hide();
      if (onMainMenu && typeof onMainMenu === 'function') {
        onMainMenu();
      }
    };

    // Crear el botón de "Volver a Jugar"
    const playAgainButton = ButtonFactory.createButton(
      this.scene,
      0,
      firstButtonY,
      240,
      60,
      'VOLVER A JUGAR',
      handleRestart
    );

    // Añadir botón para volver al menú principal
    const menuButton = ButtonFactory.createButton(
      this.scene,
      0,
      firstButtonY + buttonSpacing,
      240,
      60,
      'MENÚ PRINCIPAL',
      handleMainMenu
    );

    // Asegurarse de que los botones estén dentro del panel
    const lastButtonBottom = firstButtonY + buttonSpacing + 30; // 30 es la mitad de la altura del botón
    const buttonContainerY = panelHeight/2 - lastButtonBottom - 30; // 30 es el margen inferior

    const buttonContainer = this.scene.add.container(0, buttonContainerY);
    buttonContainer.add([playAgainButton, menuButton]);
    this.container.add(buttonContainer);

    // Animar la entrada del modal
    this.container.setScale(0.5);
    this.container.setAlpha(0);

    this.scene.tweens.add({
      targets: this.container,
      scale: 1,
      alpha: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });
  }

  /**
   * Oculta y destruye la pantalla de fin de juego
   */
  hide() {
    if (this.container) {
      this.container.destroy();
      this.container = null;

      // Asegurarnos de que el flag isModalOpen se restablezca correctamente
      if (this.scene.stateManager) {
        this.scene.stateManager.isModalOpen = false;
      }
    }
  }

  /**
   * Comprueba si un evento pointer está sobre un botón del modal
   * @param {Phaser.Input.Pointer} pointer - El objeto pointer del evento
   * @returns {boolean} - true si el clic está sobre un botón
   */
  isClickOnButton(pointer) {
    // Si no hay contenedor de botones, no está sobre un botón
    if (!this.container) return false;

    // Buscamos botones en el contenedor (contenedores con useHandCursor)
    const buttonContainers = this.container.getAll().filter(child =>
      child instanceof Phaser.GameObjects.Container &&
      child.input &&
      child.input.useHandCursor
    );

    // También buscamos contenedores que puedan contener botones
    const possibleContainers = this.container.getAll().filter(child =>
      child instanceof Phaser.GameObjects.Container
    );

    // Comprobamos si el puntero está sobre algún botón directo
    for (const button of buttonContainers) {
      if (button.getBounds().contains(pointer.x, pointer.y)) {
        return true;
      }
    }

    // Comprobamos en contenedores anidados
    for (const container of possibleContainers) {
      const nestedButtons = container.getAll().filter(child =>
        child instanceof Phaser.GameObjects.Container &&
        child.input &&
        child.input.useHandCursor
      );

      for (const button of nestedButtons) {
        // Calcular la posición global del botón, teniendo en cuenta su contenedor padre
        const globalBounds = button.getBounds();
        if (globalBounds.contains(pointer.x, pointer.y)) {
          return true;
        }
      }
    }

    return false;
  }
}
