/**
 * PinguFly
 * Punto de entrada principal de la aplicación
 */

import Phaser from 'phaser';
import gameConfig from './config/gameConfig';

// Importar escenas
import Boot from './scenes/Boot';
import Preload from './scenes/Preload';
import Menu from './scenes/Menu';
import Game from './scenes/Game';
import Results from './scenes/Results';

// Configuración de escenas
const config = {
  ...gameConfig,
  scene: [Boot, Preload, Menu, Game, Results]
};

// Crear instancia del juego
const game = new Phaser.Game(config);

// Exportar para posible uso en otros módulos
export default game;
