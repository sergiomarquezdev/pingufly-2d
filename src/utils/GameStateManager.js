/**
 * GameStateManager - Gestiona el estado del juego, intentos y flags de control
 * Centraliza la lógica de estado para mantener Game.js más limpio
 */
export default class GameStateManager {
    /**
     * Constructor del GameStateManager
     * @param {Object} options - Opciones de configuración
     * @param {Number} [options.maxLaunchAttempts=5] - Número máximo de intentos de lanzamiento
     */
    constructor(options = {}) {
        // Estado del juego
        this.currentState = 'READY'; // READY, ANGLE_SELECTION, POWER_SELECTION, LAUNCHING, FLYING, ENDED
        this.launchAttempts = 0;
        this.maxLaunchAttempts = options.maxLaunchAttempts || 5;

        // Flags de control
        this.isResetting = false;
        this.isModalOpen = false;

        // Variables de distancia - serán movidas a ScoreManager en futuros pasos
        this.currentDistance = 0;
        this.totalDistance = 0;
        this.bestTotalDistance = 0;
    }

    /**
     * Cambia el estado actual del juego
     * @param {String} newState - Nuevo estado
     * @returns {GameStateManager} - Retorna this para encadenamiento
     */
    setState(newState) {
        this.currentState = newState;
        return this;
    }

    /**
     * Incrementa el contador de intentos
     * @returns {GameStateManager} - Retorna this para encadenamiento
     */
    incrementAttempts() {
        this.launchAttempts++;
        return this;
    }

    /**
     * Verifica si el juego ha terminado (se alcanzó el máximo de intentos)
     * @returns {Boolean} - true si el juego ha terminado
     */
    isGameOver() {
        return this.launchAttempts >= this.maxLaunchAttempts;
    }

    /**
     * Reinicia el estado del juego
     * @returns {GameStateManager} - Retorna this para encadenamiento
     */
    reset() {
        this.currentState = 'READY';
        this.launchAttempts = 0;
        this.isResetting = false;
        return this;
    }

    /**
     * Devuelve el estado actual
     * @returns {String} - Estado actual del juego
     */
    getState() {
        return this.currentState;
    }

    /**
     * Devuelve el número de intentos actuales
     * @returns {Number} - Número de intentos realizados
     */
    getAttempts() {
        return this.launchAttempts;
    }

    /**
     * Devuelve el número máximo de intentos
     * @returns {Number} - Número máximo de intentos permitidos
     */
    getMaxAttempts() {
        return this.maxLaunchAttempts;
    }
}
