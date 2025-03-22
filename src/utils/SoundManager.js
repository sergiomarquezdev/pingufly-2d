/**
 * SoundManager - Clase para gestionar el audio del juego
 * Maneja la reproducción, pausa y control de volumen para música y efectos de sonido
 */

import StorageManager from './StorageManager';

// Mantener un registro global de las instancias de música activas
const globalMusicRegistry = {
  activeMusicKeys: new Set(),
  transitionInProgress: false
};

export default class SoundManager {
  // Claves para localStorage
  static MUSIC_ENABLED_KEY = 'pinguFly_musicEnabled';
  static SFX_ENABLED_KEY = 'pinguFly_sfxEnabled';
  static MUSIC_VOLUME_KEY = 'pinguFly_musicVolume';
  static SFX_VOLUME_KEY = 'pinguFly_sfxVolume';

  // Claves de las pistas de música
  static MUSIC_MAIN = 'music_main';
  static MUSIC_MENU = 'music_menu';
  static MUSIC_GAMEOVER = 'music_gameover';

  constructor(scene) {
    // Referencia a la escena
    this.scene = scene;

    // Verificar si el audio está soportado
    this.checkAudioSupport();

    // Pistas de música activas
    this.currentMusic = null;
    this.currentMusicKey = null;

    // Estado del audio (habilitado/deshabilitado)
    this.musicEnabled = this.loadMusicEnabled();
    this.sfxEnabled = this.loadSfxEnabled();

    // Valores de volumen (de 0 a 1)
    this.musicVolume = this.loadMusicVolume();
    this.sfxVolume = this.loadSfxVolume();

    // Escuchar eventos de cambio de escena para limpiar correctamente
    this.setupSceneEvents();
  }

  /**
   * Configura los listeners para eventos de cambio de escena
   * @private
   */
  setupSceneEvents() {
    // Limpiar cuando esta escena se detenga o se destruya
    this.scene.events.once('shutdown', this.handleSceneShutdown, this);
    this.scene.events.once('destroy', this.handleSceneDestroy, this);
  }

  /**
   * Maneja el evento de apagado de escena
   * @private
   */
  handleSceneShutdown() {
    // Detener la música si está sonando y no hay una transición en progreso
    if (this.currentMusic && this.currentMusic.isPlaying && !globalMusicRegistry.transitionInProgress) {
      console.log(`🔇 Deteniendo música de escena cerrada: ${this.currentMusicKey}`);
      this.currentMusic.stop();
      if (this.currentMusicKey) {
        globalMusicRegistry.activeMusicKeys.delete(this.currentMusicKey);
      }
    }

    // Eliminar listeners para evitar memory leaks
    this.scene.events.off('shutdown', this.handleSceneShutdown, this);
    this.scene.events.off('destroy', this.handleSceneDestroy, this);
  }

  /**
   * Maneja el evento de destrucción de escena
   * @private
   */
  handleSceneDestroy() {
    this.handleSceneShutdown();
  }

  /**
   * Verifica si el audio está soportado y disponible
   * @private
   */
  checkAudioSupport() {
    // Verificar si la API de sonido está disponible
    if (!this.scene.sound || !this.scene.sound.add) {
      console.error('❌ La API de sonido de Phaser no está disponible');
      return;
    }

    // Verificar si tenemos acceso a la caché de audio
    if (!this.scene.cache || !this.scene.cache.audio) {
      console.error('❌ La caché de audio de Phaser no está disponible');
      return;
    }

    // Verificar formatos de audio soportados
    const formats = [];
    if (this.scene.sound.context && this.scene.sound.context.audioContext) {
      const audioContext = this.scene.sound.context.audioContext;

      // Verificar mp3
      try {
        const canPlayMp3 = audioContext.createMediaElementSource(document.createElement('audio')).mediaElement.canPlayType('audio/mp3');
        formats.push(`MP3: ${canPlayMp3 || 'no soportado'}`);
      } catch (e) {
        formats.push('MP3: error al verificar');
      }

      // Verificar ogg
      try {
        const canPlayOgg = audioContext.createMediaElementSource(document.createElement('audio')).mediaElement.canPlayType('audio/ogg');
        formats.push(`OGG: ${canPlayOgg || 'no soportado'}`);
      } catch (e) {
        formats.push('OGG: error al verificar');
      }
    }

    console.log('🎵 Sistema de audio inicializado');
    if (formats.length > 0) {
      console.log('📋 Formatos de audio soportados:', formats.join(', '));
    }

    // Listar archivos de audio disponibles en la caché
    if (this.scene.cache && this.scene.cache.audio && this.scene.cache.audio.entries && this.scene.cache.audio.entries.size > 0) {
      console.log('🎧 Archivos de audio cargados:', Array.from(this.scene.cache.audio.entries.keys()).join(', '));
    } else {
      console.warn('⚠️ No hay archivos de audio cargados en la caché');
    }
  }

  /**
   * Reproduce una pista de música
   * @param {string} key - Clave de la música a reproducir
   * @param {object} config - Configuración adicional (loop, volumen, etc.)
   */
  playMusic(key, config = {}) {
    // No reproducir si la música está deshabilitada
    if (!this.musicEnabled) return;

    // Si ya está sonando esta música en el juego (desde otra escena), no reproducirla de nuevo
    // A menos que estemos en la escena de AnimationTest o Game que necesitan su propia instancia de música
    const isTestOrGameScene = this.scene.scene.key === 'AnimationTest' || this.scene.scene.key === 'Game';

    if (globalMusicRegistry.activeMusicKeys.has(key) && !isTestOrGameScene) {
      console.log(`⏩ La música ${key} ya está sonando en otra escena, omitiendo reproducción duplicada`);
      return;
    }

    // Valores predeterminados para la configuración
    const defaultConfig = {
      loop: true,
      volume: this.musicVolume,
      fade: false,
      fadeTime: 1000
    };

    // Combinar la configuración proporcionada con la predeterminada
    const finalConfig = { ...defaultConfig, ...config };

    // Detener la música actual si existe
    if (this.currentMusic && this.currentMusic.isPlaying) {
      // Si se solicita fade, hacer fade out antes de cambiar
      if (finalConfig.fade) {
        globalMusicRegistry.transitionInProgress = true;
        this.fadeOutMusic(finalConfig.fadeTime, () => {
          this.startNewMusic(key, finalConfig);
          globalMusicRegistry.transitionInProgress = false;
        });
      } else {
        this.currentMusic.stop();
        if (this.currentMusicKey) {
          globalMusicRegistry.activeMusicKeys.delete(this.currentMusicKey);
        }
        this.startNewMusic(key, finalConfig);
      }
    } else {
      this.startNewMusic(key, finalConfig);
    }
  }

  /**
   * Inicia una nueva pista de música
   * @private
   */
  startNewMusic(key, config) {
    // Comprobar si la música está cargada
    if (!this.scene.cache.audio.exists(key)) {
      console.warn(`La música ${key} no está cargada en la caché de audio`);
      return;
    }

    try {
      // Mostrar en qué escena estamos reproduciendo música
      console.log(`🎮 Reproduciendo música ${key} en la escena: ${this.scene.scene.key}`);

      // Iniciar la nueva pista
      this.currentMusic = this.scene.sound.add(key, {
        loop: config.loop,
        volume: config.volume
      });

      // Guardar la clave de la música actual
      this.currentMusicKey = key;

      // Registrar en el registro global
      globalMusicRegistry.activeMusicKeys.add(key);

      // Mostrar el registro global de música activa
      console.log(`🎵 Registro global de música activa: [${Array.from(globalMusicRegistry.activeMusicKeys).join(', ')}]`);

      // Reproducir con fade in si está configurado
      if (config.fade) {
        this.currentMusic.setVolume(0);
        this.currentMusic.play();

        // Si se especificó una posición de inicio (seek), aplicarla
        if (config.seek !== undefined) {
          this.currentMusic.setSeek(config.seek);
          console.log(`⏩ Iniciando desde el segundo ${config.seek}`);
        }

        this.scene.tweens.add({
          targets: this.currentMusic,
          volume: config.volume,
          duration: config.fadeTime,
          ease: 'Linear'
        });
      } else {
        // Reproducir normalmente, con o sin seek
        const seekOptions = config.seek !== undefined ? { seek: config.seek } : undefined;
        this.currentMusic.play(seekOptions);

        if (config.seek !== undefined) {
          console.log(`⏩ Iniciando desde el segundo ${config.seek}`);
        }
      }

      // Configurar evento para cuando termine la música
      this.currentMusic.once('complete', () => {
        if (this.currentMusicKey) {
          globalMusicRegistry.activeMusicKeys.delete(this.currentMusicKey);
        }
      });

      console.log(`🎵 Reproduciendo música: ${key}`);
    } catch (error) {
      console.error(`Error al reproducir la música ${key}:`, error);
    }
  }

  /**
   * Realiza un fade out de la música actual
   * @param {number} duration - Duración del fade en ms
   * @param {Function} onComplete - Función a ejecutar al completar
   */
  fadeOutMusic(duration = 1000, onComplete = null) {
    if (!this.currentMusic || !this.currentMusic.isPlaying) {
      if (onComplete) onComplete();
      return;
    }

    // Crear un tween para reducir gradualmente el volumen
    this.scene.tweens.add({
      targets: this.currentMusic,
      volume: 0,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        this.currentMusic.stop();
        // Eliminar del registro global
        if (this.currentMusicKey) {
          globalMusicRegistry.activeMusicKeys.delete(this.currentMusicKey);
        }
        if (onComplete) onComplete();
      }
    });
  }

  /**
   * Pausa la música actual
   */
  pauseMusic() {
    if (this.currentMusic && this.currentMusic.isPlaying) {
      this.currentMusic.pause();
    }
  }

  /**
   * Reanuda la música pausada
   */
  resumeMusic() {
    if (this.currentMusic && this.currentMusic.isPaused) {
      this.currentMusic.resume();
    }
  }

  /**
   * Detiene la música actual
   * @param {boolean} fade - Si se debe realizar un fade out
   * @param {number} fadeTime - Duración del fade en ms
   */
  stopMusic(fade = false, fadeTime = 1000) {
    if (!this.currentMusic) return;

    globalMusicRegistry.transitionInProgress = true;

    if (fade) {
      this.fadeOutMusic(fadeTime, () => {
        globalMusicRegistry.transitionInProgress = false;
      });
    } else {
      this.currentMusic.stop();
      if (this.currentMusicKey) {
        globalMusicRegistry.activeMusicKeys.delete(this.currentMusicKey);
      }
      globalMusicRegistry.transitionInProgress = false;
    }
  }

  /**
   * Reproduce un efecto de sonido
   * @param {string} key - Clave del efecto a reproducir
   * @param {object} config - Configuración adicional (volumen, etc.)
   */
  playSfx(key, config = {}) {
    // No reproducir si los efectos están deshabilitados
    if (!this.sfxEnabled) return;

    // Comprobar si el sonido está cargado
    if (!this.scene.cache.audio.exists(key)) {
      console.warn(`El efecto de sonido ${key} no está cargado en la caché de audio`);
      return;
    }

    try {
      // Valores predeterminados para la configuración
      const defaultConfig = {
        volume: this.sfxVolume
      };

      // Combinar la configuración proporcionada con la predeterminada
      const finalConfig = { ...defaultConfig, ...config };

      // Reproducir el efecto
      this.scene.sound.play(key, finalConfig);
      console.log(`🔊 Reproduciendo efecto: ${key}`);
    } catch (error) {
      console.error(`Error al reproducir el efecto ${key}:`, error);
    }
  }

  /**
   * Habilita o deshabilita la música
   * @param {boolean} enabled - El nuevo estado
   */
  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    StorageManager.saveItem(SoundManager.MUSIC_ENABLED_KEY, enabled);

    // Si se deshabilita, detener la música actual
    if (!enabled && this.currentMusic) {
      this.stopMusic();
    } else if (enabled && this.currentMusic && !this.currentMusic.isPlaying) {
      // Si se habilita y hay una música actual, reproducirla
      this.currentMusic.play();
    }
  }

  /**
   * Habilita o deshabilita los efectos de sonido
   * @param {boolean} enabled - El nuevo estado
   */
  setSfxEnabled(enabled) {
    this.sfxEnabled = enabled;
    StorageManager.saveItem(SoundManager.SFX_ENABLED_KEY, enabled);
  }

  /**
   * Establece el volumen de la música
   * @param {number} volume - Volumen de 0 a 1
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    StorageManager.saveItem(SoundManager.MUSIC_VOLUME_KEY, this.musicVolume);

    // Actualizar el volumen de la música actual si existe
    if (this.currentMusic) {
      this.currentMusic.setVolume(this.musicVolume);
    }
  }

  /**
   * Establece el volumen de los efectos de sonido
   * @param {number} volume - Volumen de 0 a 1
   */
  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    StorageManager.saveItem(SoundManager.SFX_VOLUME_KEY, this.sfxVolume);
  }

  /**
   * Carga la configuración de música habilitada desde localStorage
   * @private
   */
  loadMusicEnabled() {
    return StorageManager.loadItem(SoundManager.MUSIC_ENABLED_KEY, true);
  }

  /**
   * Carga la configuración de efectos habilitados desde localStorage
   * @private
   */
  loadSfxEnabled() {
    return StorageManager.loadItem(SoundManager.SFX_ENABLED_KEY, true);
  }

  /**
   * Carga el volumen de música desde localStorage
   * @private
   */
  loadMusicVolume() {
    return StorageManager.loadItem(SoundManager.MUSIC_VOLUME_KEY, 0.7);
  }

  /**
   * Carga el volumen de efectos desde localStorage
   * @private
   */
  loadSfxVolume() {
    return StorageManager.loadItem(SoundManager.SFX_VOLUME_KEY, 0.8);
  }

  /**
   * Comprueba si la música está habilitada
   * @returns {boolean}
   */
  isMusicEnabled() {
    return this.musicEnabled;
  }

  /**
   * Comprueba si los efectos están habilitados
   * @returns {boolean}
   */
  isSfxEnabled() {
    return this.sfxEnabled;
  }

  /**
   * Obtiene el volumen de la música
   * @returns {number} - Volumen de 0 a 1
   */
  getMusicVolume() {
    return this.musicVolume;
  }

  /**
   * Obtiene el volumen de los efectos
   * @returns {number} - Volumen de 0 a 1
   */
  getSfxVolume() {
    return this.sfxVolume;
  }
}
