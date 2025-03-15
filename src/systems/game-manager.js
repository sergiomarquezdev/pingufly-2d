import { PenguinEntity } from '../entities/penguin-entity.js';
import { YetiEntity } from '../entities/yeti-entity.js';
import { EnvironmentEntity } from '../entities/environment-entity.js';
import { GAME_PHASES, CONSTANTS } from '../utils/constants.js';

export class GameManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.scene = gameState.scene;
    this.camera = gameState.camera;

    // Fases del juego
    this.currentPhase = GAME_PHASES.WAITING;

    // Entidades principales
    this.environment = new EnvironmentEntity(this.scene);
    this.yeti = new YetiEntity(this.scene);
    this.penguin = new PenguinEntity(this.scene);

    // Variables de juego
    this.currentDistance = 0;
    this.bestDistance = this.loadBestDistance();
    this.penguinFlying = false;
    this.updateScoreDisplay();

    // Iniciar posición de las entidades
    this.resetGame();

    // Actualizar el score más alto en el cartel
    this.environment.updateHighScore(this.bestDistance);
  }

  update(deltaTime) {
    // Actualizar todas las entidades
    this.penguin.update(deltaTime);
    this.yeti.update(deltaTime);
    this.environment.update(deltaTime);

    // Actualizar según la fase actual del juego
    switch (this.currentPhase) {
      case GAME_PHASES.WAITING:
        // Esperando que el jugador haga clic
        // Mostrar instrucciones en pantalla
        this.showInstructions("Haz clic para que el pingüino comience a caer");
        break;

      case GAME_PHASES.PENGUIN_FALLING:
        // El pingüino está cayendo, esperando el golpe del yeti
        if (this.penguin.isInHitZone()) {
          // Si el pingüino está en la zona óptima para golpear, destacarlo
          this.penguin.highlightForOptimalHit();
          this.showInstructions("¡AHORA! Haz clic para golpear");
        } else {
          this.showInstructions("Espera el momento adecuado para golpear...");
        }
        break;

      case GAME_PHASES.YETI_HITTING:
        // Animación del yeti golpeando
        // Este estado es mayormente visual, se controla con la animación
        this.showInstructions("¡Golpe!");
        break;

      case GAME_PHASES.PENGUIN_FLYING:
        // El pingüino está volando después de ser golpeado
        this.trackPenguin();
        this.updateDistance();
        this.showInstructions(`Distancia: ${this.currentDistance.toFixed(1)} m`);

        // Verificar si el pingüino ha dejado de moverse
        if (this.penguin.hasStoppedMoving()) {
          this.currentPhase = GAME_PHASES.GAME_OVER;
        }
        break;

      case GAME_PHASES.GAME_OVER:
        // El lanzamiento ha terminado, mostrando resultados
        this.showResults();
        // Resetear después de un tiempo
        setTimeout(() => this.resetGame(), 3000);
        break;
    }
  }

  handlePlayerClick() {
    switch (this.currentPhase) {
      case GAME_PHASES.WAITING:
        // Iniciar la caída del pingüino
        this.penguin.startFalling();
        this.currentPhase = GAME_PHASES.PENGUIN_FALLING;
        break;

      case GAME_PHASES.PENGUIN_FALLING:
        // Intentar golpear al pingüino
        const hitQuality = this.penguin.getHitQuality();
        this.yeti.hit();
        this.currentPhase = GAME_PHASES.YETI_HITTING;

        // Después de un breve retardo para la animación de golpe
        setTimeout(() => {
          // Lanzar pingüino según la calidad del golpe
          if (hitQuality > 0) {
            this.penguin.launch(hitQuality);
            this.currentPhase = GAME_PHASES.PENGUIN_FLYING;
          } else {
            // Mal golpe, el pingüino cae al suelo
            this.penguin.miss();
            this.currentPhase = GAME_PHASES.GAME_OVER;
          }
        }, 300);
        break;

      case GAME_PHASES.GAME_OVER:
        // Resetear el juego si hacemos clic en la pantalla de resultados
        this.resetGame();
        break;
    }
  }

  trackPenguin() {
    // Mover la cámara para seguir al pingüino
    if (this.camera && this.penguin) {
      const penguinPosition = this.penguin.getPosition();

      // Ajustar la posición de la cámara para seguir al pingüino
      // Mantener la cámara a la derecha del pingüino ya que se mueve hacia la izquierda
      this.camera.position.x = penguinPosition.x + 5;

      // Ajustar altura de la cámara para seguir al pingüino en el eje Y
      this.camera.position.y = Math.max(3, penguinPosition.y + 2);

      // Mantener la cámara mirando al pingüino
      this.camera.lookAt(penguinPosition);
    }
  }

  updateDistance() {
    if (this.penguin) {
      this.currentDistance = this.penguin.getDistanceTraveled();
      this.updateScoreDisplay();
    }
  }

  showResults() {
    // Actualizar mejor distancia si es necesario
    if (this.currentDistance > this.bestDistance) {
      this.bestDistance = this.currentDistance;
      this.saveBestDistance(this.bestDistance);

      // Actualizar el cartel de TOP SCORE
      this.environment.updateHighScore(this.bestDistance);
    }

    this.updateScoreDisplay();

    // Mostrar mensaje en el elemento info
    this.showInstructions(`¡Lanzamiento finalizado! Distancia: ${this.currentDistance.toFixed(1)} m. Haz clic para jugar de nuevo.`);
  }

  resetGame() {
    // Restablecer entidades a posiciones iniciales
    this.penguin.reset();
    this.yeti.reset();
    this.environment.reset();

    // Restablecer cámara a la posición inicial
    if (this.camera) {
      this.camera.position.set(
        CONSTANTS.CAMERA_INITIAL_X,
        CONSTANTS.CAMERA_INITIAL_Y,
        CONSTANTS.CAMERA_INITIAL_Z
      );
      this.camera.lookAt(
        CONSTANTS.CAMERA_LOOK_AT_X,
        CONSTANTS.CAMERA_LOOK_AT_Y,
        CONSTANTS.CAMERA_LOOK_AT_Z
      );
    }

    // Restablecer variables de juego
    this.currentDistance = 0;
    this.currentPhase = GAME_PHASES.WAITING;
    this.updateScoreDisplay();

    // Actualizar mensaje
    this.showInstructions('Haz click para comenzar');
  }

  showInstructions(text) {
    const infoElement = document.getElementById('info');
    if (infoElement) {
      infoElement.textContent = text;
    }
  }

  updateScoreDisplay() {
    const distanceElement = document.getElementById('distance');
    const bestDistanceElement = document.getElementById('best-distance');

    if (distanceElement) {
      distanceElement.textContent = this.currentDistance.toFixed(1);
    }

    if (bestDistanceElement) {
      bestDistanceElement.textContent = this.bestDistance.toFixed(1);
    }
  }

  loadBestDistance() {
    const savedDistance = localStorage.getItem('yetiSportsBestDistance');
    return savedDistance ? parseFloat(savedDistance) : 0;
  }

  saveBestDistance(distance) {
    localStorage.setItem('yetiSportsBestDistance', distance.toString());
  }
}
