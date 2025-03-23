/**
 * ScoreManager - Gestiona las puntuaciones y distancias recorridas en el juego
 * Centraliza la lógica de puntuación para mantener Game.js más limpio
 */
import StorageManager from './StorageManager';

export default class ScoreManager {
    /**
     * Constructor del ScoreManager
     * @param {Phaser.Scene} scene - Referencia a la escena del juego
     * @param {Object} options - Opciones de configuración
     */
    constructor(scene, options = {}) {
        this.scene = scene;

        // Valores de distancia
        this.currentDistance = 0; // Distancia del lanzamiento actual
        this.totalDistance = 0;   // Distancia acumulada total de esta partida
        this.bestTotalDistance = StorageManager.loadBestDistance(); // Mejor distancia de todas las partidas

        // Para cálculos
        this.pixelToMeterRatio = options.pixelToMeterRatio || 10;
    }

    /**
     * Actualiza la distancia recorrida por el pingüino
     * @param {Number} penguinX - Posición X actual del pingüino
     * @param {Number} launchPositionX - Posición X del punto de lanzamiento
     * @returns {Number} - Distancia actual en metros
     */
    updateDistance(penguinX, launchPositionX) {
        // Calcular la distancia desde el punto de lanzamiento
        const distanceInPixels = launchPositionX - penguinX;

        // Convertir a metros (escala arbitraria para el juego) y asegurar que sea positiva
        const distanceInMeters = Math.floor(distanceInPixels / this.pixelToMeterRatio);

        // Calcular la distancia actual (solo valores positivos)
        const currentCalculatedDistance = Math.max(0, distanceInMeters);

        // SOLUCIÓN: Mantener el valor máximo alcanzado durante el vuelo
        // Solo actualizar si la nueva distancia es mayor que la almacenada
        if (currentCalculatedDistance > this.currentDistance) {
            this.currentDistance = currentCalculatedDistance;
        }

        return this.currentDistance;
    }

    /**
     * Resetea la distancia actual a cero
     */
    resetCurrentDistance() {
        this.currentDistance = 0;
        return this;
    }

    /**
     * Añade la distancia actual al total acumulado
     */
    addCurrentToTotal() {
        this.totalDistance += this.currentDistance;
        return this;
    }

    /**
     * Comprueba si se ha batido el récord y actualiza si es necesario
     * @returns {Boolean} - true si se ha batido el récord
     */
    checkAndUpdateBestDistance() {
        const isNewRecord = this.totalDistance > this.bestTotalDistance;

        if (isNewRecord) {
            // Actualizar mejor distancia total
            this.bestTotalDistance = this.totalDistance;

            // Guardar en localStorage usando StorageManager
            StorageManager.saveBestDistance(this.bestTotalDistance);
        }

        return isNewRecord;
    }

    /**
     * Resetea la distancia total acumulada
     */
    resetTotalDistance() {
        this.totalDistance = 0;
        return this;
    }

    /**
     * Obtiene la distancia total más el recorrido actual
     * @returns {Number} - Distancia total incluyendo el recorrido actual
     */
    getTotalWithCurrent() {
        return this.totalDistance + this.currentDistance;
    }
}
