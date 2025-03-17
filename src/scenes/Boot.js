/**
 * Escena Boot - Primera escena que se carga en el juego
 * Se encarga de configurar ajustes iniciales antes de cargar recursos
 */

import Phaser from 'phaser';

export default class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  /**
   * Método preload: Se ejecuta antes que cualquier otro método
   * Aquí cargamos recursos mínimos necesarios para la pantalla de carga
   */
  preload() {
    // Cargar solo lo imprescindible para la pantalla de carga
    // Ejemplo: Un logo simple o una barra de progreso básica

    // Configurar límites del mundo para permitir un amplio rango de movimiento
    this.matter.world.setBounds(0, 0, 10000, 600);

    // Configuración para dispositivos móviles
    this.setupMobile();
  }

  /**
   * Método create: Se ejecuta una vez que preload ha terminado
   * Aquí configuramos el juego y pasamos a la siguiente escena
   */
  create() {
    // Configuraciones adicionales
    this.scale.refresh();

    // Lanzar la siguiente escena (Preload)
    this.scene.start('Preload');
  }

  /**
   * Configuraciones específicas para dispositivos móviles
   * Ajusta el juego para una mejor experiencia en móviles
   */
  setupMobile() {
    // Detección de dispositivo móvil
    const isMobile = this.sys.game.device.os.android ||
                     this.sys.game.device.os.iOS ||
                     this.sys.game.device.os.windowsPhone;

    if (isMobile) {
      // Asegurar que el juego se ajusta bien en móviles
      this.scale.lockOrientation('landscape');

      // Prevenir el scroll en la página cuando se juega
      document.body.style.touchAction = 'none';

      // Desactivar sugerencias de zoom en doble tap
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }
  }
}
