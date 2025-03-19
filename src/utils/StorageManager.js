/**
 * Clase que proporciona métodos para gestionar el almacenamiento local
 */
export default class StorageManager {
  /**
   * Clave para la mejor distancia en localStorage
   */
  static BEST_DISTANCE_KEY = 'pinguFly_bestDistance';

  /**
   * Guarda la mejor distancia en localStorage
   * @param {number} distance - La distancia a guardar
   */
  static saveBestDistance(distance) {
    localStorage.setItem(this.BEST_DISTANCE_KEY, distance.toString());
  }

  /**
   * Carga la mejor distancia desde localStorage
   * @returns {number} - La mejor distancia guardada o 0 si no hay ninguna
   */
  static loadBestDistance() {
    const stored = localStorage.getItem(this.BEST_DISTANCE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  }

  /**
   * Guarda un valor en localStorage
   * @param {string} key - Clave para guardar el valor
   * @param {any} value - Valor a guardar (se convertirá a string)
   */
  static saveItem(key, value) {
    if (typeof value !== 'string') {
      value = JSON.stringify(value);
    }

    localStorage.setItem(key, value);
  }

  /**
   * Carga un valor desde localStorage
   * @param {string} key - Clave del valor a cargar
   * @param {any} defaultValue - Valor por defecto si no existe
   * @returns {any} - El valor cargado o el valor por defecto
   */
  static loadItem(key, defaultValue = null) {
    const stored = localStorage.getItem(key);

    if (stored === null) {
      return defaultValue;
    }

    try {
      return JSON.parse(stored);
    } catch (e) {
      return stored;
    }
  }

  /**
   * Elimina un valor de localStorage
   * @param {string} key - Clave del valor a eliminar
   */
  static removeItem(key) {
    localStorage.removeItem(key);
  }

  /**
   * Limpia todos los datos guardados por la aplicación
   */
  static clearGameData() {
    localStorage.removeItem(this.BEST_DISTANCE_KEY);
    // Añadir aquí otras claves específicas del juego si se añaden en el futuro
  }
}
