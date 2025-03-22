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
        this._isModalOpen = false; // Cambiado a propiedad privada con getter/setter

        // Variables de distancia - serán movidas a ScoreManager en futuros pasos
        this.currentDistance = 0;
        this.totalDistance = 0;
        this.bestTotalDistance = 0;

        // Lista de observadores para notificar cambios de estado
        this.stateObservers = [];
    }

    /**
     * Añade un observador que será notificado cuando cambie el estado
     * @param {Function} observer - Función que recibirá el nuevo estado
     * @returns {GameStateManager} - Retorna this para encadenamiento
     */
    addStateObserver(observer) {
        if (typeof observer === 'function' && !this.stateObservers.includes(observer)) {
            this.stateObservers.push(observer);
        }
        return this;
    }

    /**
     * Elimina un observador de la lista
     * @param {Function} observer - Función a eliminar
     * @returns {GameStateManager} - Retorna this para encadenamiento
     */
    removeStateObserver(observer) {
        const index = this.stateObservers.indexOf(observer);
        if (index > -1) {
            this.stateObservers.splice(index, 1);
        }
        return this;
    }

    /**
     * Notifica a todos los observadores sobre el cambio de estado
     * @param {String} newState - El nuevo estado
     * @private
     */
    _notifyStateChange(newState) {
        this.stateObservers.forEach(observer => {
            try {
                observer(newState);
            } catch (error) {
                console.error('Error al notificar cambio de estado:', error);
            }
        });
    }

    /**
     * Getter para isModalOpen que siempre devuelve el valor actual
     */
    get isModalOpen() {
        return this._isModalOpen;
    }

    /**
     * Cambia el estado actual del juego
     * @param {String} newState - Nuevo estado
     * @returns {GameStateManager} - Retorna this para encadenamiento
     */
    setState(newState) {
        const oldState = this.currentState;
        this.currentState = newState;

        // Si cambiamos a READY o RESETTING, asegurar que el modal esté cerrado
        if (newState === 'READY' || newState === 'RESETTING') {
            this._isModalOpen = false;
        }

        // Solo notificar si realmente cambió el estado
        if (oldState !== newState) {
            this._notifyStateChange(newState);
        }

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
        const oldState = this.currentState;
        this.currentState = 'READY';
        this.launchAttempts = 0;
        this.isResetting = false;
        this._isModalOpen = false; // Asegurar que el modal está cerrado al reiniciar

        // Notificar el cambio de estado
        if (oldState !== 'READY') {
            this._notifyStateChange('READY');
        }

        return this;
    }

    /**
     * Establece el estado del modal
     * @param {Boolean} isOpen - Indica si el modal está abierto o cerrado
     * @returns {GameStateManager} - Retorna this para encadenamiento
     */
    setModalState(isOpen) {
        this._isModalOpen = isOpen;
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

    /**
     * Pausa el juego
     * @returns {GameStateManager} - Retorna this para encadenamiento
     */
    pause() {
        // Guardamos el estado anterior para poder recuperarlo luego si es necesario
        this._previousState = this.currentState;
        this.setState('PAUSED');
        return this;
    }

    /**
     * Reanuda el juego después de una pausa
     * @returns {GameStateManager} - Retorna this para encadenamiento
     */
    resume() {
        // Si teníamos un estado previo, lo restauramos
        if (this._previousState && this._previousState !== 'PAUSED') {
            this.setState(this._previousState);
            this._previousState = null;
        } else {
            // Si no hay estado previo, simplemente volvemos a READY
            this.setState('READY');
        }
        return this;
    }
}
