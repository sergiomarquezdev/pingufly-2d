/**
 * Escena Results - Muestra los resultados finales del juego
 * y opciones para jugar nuevamente o volver al menú
 */

import Phaser from 'phaser';

export default class Results extends Phaser.Scene {
  constructor() {
    super('Results');
  }

  /**
   * Inicializa la escena con datos recibidos de la escena anterior
   */
  init(data) {
    this.bestDistance = data.bestDistance || 0;
    this.totalLaunches = data.totalLaunches || 0;
    this.totalDistance = data.totalDistance || 0;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Fondo
    this.add.image(width / 2, height / 2, 'sky').setScale(2);

    // Título
    this.add.text(width / 2, height / 6, 'RESULTADOS', {
      fontFamily: 'Arial',
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Mostrar resultados
    this.showResults(width, height);

    // Botones
    this.createButtons(width, height);

    // Efecto de entrada
    this.cameras.main.fadeIn(500);
  }

  /**
   * Muestra los resultados del juego
   */
  showResults(width, height) {
    // Panel de resultados
    const panel = this.add.rectangle(width / 2, height / 2, width * 0.7, height * 0.4, 0x000000, 0.7)
      .setOrigin(0.5);

    // Estadísticas
    const fontSize = 24;
    const lineHeight = fontSize * 1.5;
    const startY = height / 2 - lineHeight * 1.5;

    // Texto para mejor distancia
    this.add.text(width / 2, startY, `Mejor Distancia: ${this.bestDistance} metros`, {
      fontFamily: 'Arial',
      fontSize: `${fontSize}px`,
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Texto para total de lanzamientos
    this.add.text(width / 2, startY + lineHeight, `Total de Lanzamientos: ${this.totalLaunches}`, {
      fontFamily: 'Arial',
      fontSize: `${fontSize}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Texto para distancia total acumulada
    this.add.text(width / 2, startY + lineHeight * 2, `Distancia Total: ${this.totalDistance} metros`, {
      fontFamily: 'Arial',
      fontSize: `${fontSize}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Promedio por lanzamiento
    const average = this.totalLaunches > 0
      ? Math.floor(this.totalDistance / this.totalLaunches)
      : 0;

    this.add.text(width / 2, startY + lineHeight * 3, `Promedio: ${average} metros/lanzamiento`, {
      fontFamily: 'Arial',
      fontSize: `${fontSize}px`,
      color: '#88ff88',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
  }

  /**
   * Crea los botones para navegar
   */
  createButtons(width, height) {
    // Botón para jugar nuevamente
    const playAgainButton = this.add.image(width / 3, height * 3/4, 'button').setScale(2);
    const playAgainText = this.add.text(width / 3, height * 3/4, 'JUGAR DE NUEVO', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Botón para volver al menú principal
    const menuButton = this.add.image(width * 2/3, height * 3/4, 'button').setScale(2);
    const menuText = this.add.text(width * 2/3, height * 3/4, 'MENÚ PRINCIPAL', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Hacer los botones interactivos
    this.setupButton(playAgainButton, () => {
      this.scene.start('Game');
    });

    this.setupButton(menuButton, () => {
      this.scene.start('Menu');
    });
  }

  /**
   * Configura la interactividad de un botón
   */
  setupButton(button, callback) {
    button.setInteractive();

    button.on('pointerover', () => {
      button.setTint(0xaaaaff);
    });

    button.on('pointerout', () => {
      button.clearTint();
    });

    button.on('pointerdown', callback);
  }
}
