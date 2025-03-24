# Design and Development Documentation: PinguFly

**Date:** Updated June 2024
**Version:** 3.0
**Product:** PinguFly videogame
**Audience:** Game Designers, Game Developers

## 1. Introduction and Product Vision

PinguFly es una reimaginación moderna del clásico juego Yeti Sports Pingu Throw, donde los jugadores lanzan un pingüino lo más lejos posible a través de un hermoso paisaje invernal. Este documento detalla la implementación actual, arquitectura y consideraciones técnicas del proyecto.

El juego se enfoca en crear una experiencia atractiva y responsiva con visuales pulidos, controles intuitivos y jugabilidad fluida que funciona tanto en dispositivos de escritorio como móviles.

## 2. Target Audience

- Jugadores casuales que buscan sesiones de juego rápidas y atractivas
- Fans de juegos arcade clásicos y juegos basados en habilidad
- Jugadores en múltiples plataformas (escritorio y móvil)
- Usuarios que buscan mecánicas de juego simples pero adictivas con un acabado visual pulido

## 3. Target Platforms

El juego está actualmente implementado como una **aplicación web** con las siguientes especificaciones técnicas:
- **Framework Principal:** Phaser 3.88.2
- **Tecnologías Core:** JavaScript ES6+, HTML5 Canvas, WebGL
- **Sistema de Build:** Vite 6.2.2
- **Motor de Física:** Matter.js (integrado con Phaser)
- **Diseño Responsivo:** Optimizado tanto para navegadores de escritorio como móviles

## 4. Game Genre

Arcade, Deportes (lanzamiento)

## 5. Core Gameplay Loop

1. El jugador inicia un lanzamiento desde la pantalla principal del juego
2. El jugador detiene una flecha en movimiento para seleccionar un ángulo (mecánica basada en timing)
3. El jugador detiene una barra de potencia para determinar la fuerza del lanzamiento (mecánica basada en timing)
4. El pingüino es lanzado con física que tiene en cuenta tanto el ángulo como la potencia seleccionados
5. El jugador observa al pingüino volar a través del entorno invernal
6. La distancia se mide y se añade a la puntuación total del jugador
7. Este ciclo se repite para múltiples intentos (actualmente 5 por juego)
8. Después del intento final, la pantalla de fin de juego muestra los resultados y ofrece opciones para reiniciar o volver al menú principal

## 6. Detailed Gameplay Implementation

### 6.1. Controls and Input System

El juego cuenta con un esquema de control simplificado implementado a través del sistema de gestión de entrada de Phaser:

```javascript
// En Game.js
setupInput() {
  // Configurar entrada de clic para selección de ángulo y potencia
  this.input.on('pointerdown', () => {
    this.handlePlayerInput();
  });

  // Configurar tecla Escape para volver al menú
  this.input.keyboard.on('keydown-ESC', () => {
    this.backToMenu();
  });

  // Configurar tecla R para reiniciar el juego
  this.input.keyboard.on('keydown-R', () => {
    this.restartGame();
  });
}
```

- **PC (Escritorio):** Clic izquierdo del ratón para todas las interacciones, con atajos de teclado (ESC, R)
- **Móvil:** Entrada táctil para todas las interacciones
- **Abstracción de Entrada:** El sistema de entrada maneja de forma abstracta tanto eventos de ratón como táctiles a través del sistema de entrada unificado de Phaser

### 6.2. Angle Selection Mechanic

Implementado a través del componente `AngleIndicator`:

```javascript
// En Game.js
this.angleIndicator = new AngleIndicator(this, {
  originX: this.launchPositionX,
  originY: this.launchPositionY + 5,
  minAngle: physicsConfig.angle.min,
  maxAngle: physicsConfig.angle.max
});
```

- Un indicador visual de flecha oscila a través de un rango de ángulos
- `LaunchManager` coordina el inicio y fin de la selección de ángulo
- El ángulo seleccionado se captura cuando el jugador hace clic/toca
- Un feedback visual claro muestra el ángulo seleccionado con indicadores de texto y flecha

### 6.3. Power Selection Mechanic

Implementado a través del componente `PowerBar`:

```javascript
// En Game.js
this.powerBar = new PowerBar(this, {
  barX: this.scale.width - 35,
  barY: this.launchPositionY - 65
});
```

- Una barra de potencia vertical con indicador oscilante
- Gestionada por el `LaunchManager` para el timing de la selección de potencia
- Feedback visual con gradiente de color indicando niveles de potencia
- La selección de potencia impacta directamente en el cálculo de velocidad de lanzamiento

### 6.4. Launch Physics Implementation

La física se maneja a través de la integración de Matter.js en Phaser, con configuraciones específicas para el pingüino:

```javascript
// En CharacterManager.js
launchPenguin(angle, power) {
  // Asegurar que el pingüino es movible
  this.penguin.setStatic(false);

  // Calcular componentes de velocidad de lanzamiento basados en ángulo y potencia
  const velocityX = -Math.cos(angle) * power * 0.2;
  const velocityY = -Math.sin(angle) * power * 0.2;

  // Aplicar velocidad al pingüino
  this.penguin.setVelocity(velocityX, velocityY);

  // Reproducir animación de lanzamiento
  this.playPenguinAnimation('penguin_flying');
}
```

- Configuraciones de física centralizadas en `physicsConfig.js`
- Cálculos de lanzamiento que tienen en cuenta ángulo, potencia y constantes de física configurables
- Mundo físico que se extiende lejos para permitir vuelos de larga distancia
- Configuraciones de baja fricción para mecánicas de deslizamiento tipo hielo

### 6.5. Distance Tracking System

Implementado a través de la clase `ScoreManager`:

```javascript
// En Game.js - método update()
if (gameState === 'FLYING') {
  // Actualizar la puntuación
  this.scoreManager.updateDistance(this.characterManager.getPenguinCurrentX(), this.launchPositionX);

  // Actualizar UI
  this.gameUI.updateDistanceText(this.scoreManager.currentDistance, this.scoreManager.totalDistance);
}
```

El sistema ha sido recientemente mejorado para evitar duplicaciones en el cálculo de la distancia:

```javascript
// Mejora en Game.js - método update()
if (this.stateManager.getState() === 'FLYING') {
  // Verificar si el pingüino ha aterrizado o se ha detenido
  if (this.characterManager.hasPenguinLanded() || this.characterManager.hasPenguinStopped()) {
    // Finalizar el lanzamiento sin duplicar el cálculo
    this.endLaunch();
    // Importante: retornamos inmediatamente para evitar cálculos adicionales
    return;
  }

  // Actualizamos la distancia solo si seguimos volando
  this.scoreManager.updateDistance(
    this.characterManager.getPenguinCurrentX(),
    this.launchPositionX
  );

  // Actualizamos la UI con la distancia actual y total
  this.gameUI.updateDistanceText(
    this.scoreManager.currentDistance,
    this.scoreManager.totalDistance
  );
}
```

- Cálculo de distancia en tiempo real durante el vuelo
- Seguimiento de distancia actual y total
- Récord de mejor distancia guardado en localStorage
- Feedback visual a través del componente `GameUI`
- Mecanismo de prevención de duplicación para asegurar mediciones precisas

### 6.6. Game Session Management

```javascript
// En Game.js
endLaunch() {
  // Cambiar el estado inmediatamente para evitar actualizaciones duplicadas
  this.stateManager.setState('STOPPED');

  // Acumular la distancia actual al total
  this.scoreManager.addCurrentToTotal();

  // Verificar si hemos alcanzado el número máximo de intentos
  if (this.stateManager.isGameOver()) {
    this.endGame();
  } else {
    // Preparar para el siguiente lanzamiento
    this.gameUI.showNextLaunchPrompt();
    this.stateManager.setState('ENDED');
  }
}
```

- Sistema de múltiples intentos (5 intentos por juego)
- Conteo y gestión de intentos a través de `GameStateManager`
- Indicador visual claro de intentos restantes
- La sesión de juego termina después del intento final con una pantalla de resultados detallada
- Mecanismos de estado mejorados para prevenir comportamientos inesperados

## 7. Environment Implementation

El entorno del juego se crea a través de una serie de clases gestoras especializadas:

### 7.1. Background System

```javascript
// En Game.js - método create()
this.backgroundManager = new BackgroundManager(this);
this.backgroundManager.create();
```

El `BackgroundManager` crea:
- Cielo con parallax multicapa con gradientes
- Sol animado con efectos de resplandor
- Montañas distantes para percepción de profundidad
- Suelo cubierto de nieve con textura de hielo

### 7.2. Ground System

```javascript
// En Game.js - método create()
this.groundManager = new GroundManager(this);
this.groundManager.create();
```

El `GroundManager` maneja:
- Suelo habilitado para física con cuerpos Matter.js
- Propiedades de fricción tipo hielo para un deslizamiento realista
- Representación visual de la superficie de nieve

### 7.3. Cloud System

```javascript
// En Game.js - método create()
this.cloudManager = new CloudManager(this);
this.cloudManager.create();
```

El `CloudManager` proporciona:
- Nubes generadas dinámicamente a diferentes profundidades
- Movimiento de parallax basado en la posición de la cámara
- Varios tamaños y opacidades para profundidad visual

### 7.4. Environmental Details

Los elementos visuales adicionales incluyen:
- Copos de nieve animados (sistema de partículas)
- Árboles decorativos y muñecos de nieve
- Iglús y otros elementos invernales
- Animaciones ambientales sutiles (efectos de viento, deriva de nubes)

### 7.5. Camera Management

```javascript
// En Game.js
this.cameraController = new CameraController(this, {
  worldBounds: { x: -10000, y: 0, width: 20000, height: 600 },
  initialCenterX: this.initialCameraX,
  initialCenterY: 300
});
```

El `CameraController` maneja:
- Seguimiento suave del pingüino durante el vuelo
- Gestión de límites de cámara para exploración del mundo
- Efectos visuales como fade, flash y shake
- Retorno a la posición inicial entre intentos

## 8. Character Implementation

La gestión de personajes está centralizada en la clase `CharacterManager`:

```javascript
// En Game.js - método create()
this.characterManager = new CharacterManager(this, {
  launchPositionX: this.launchPositionX,
  launchPositionY: this.launchPositionY
});
this.characterManager.createCharacters();
```

### 8.1. Penguin

- Sprite animado con múltiples estados: idle, flying, landing, sliding
- Cuerpo físico con colisionador circular para movimiento realista
- Sistema de animación basado en estado vinculado al estado del juego
- Propiedades físicas configurables (fricción, rebote, densidad)

### 8.2. Yeti

- Sprite animado con comportamientos interactivos
- Animaciones para estados idle, prepare y swing
- Posicionado con sistema de offset relativo al punto de lanzamiento
- Integrado en la secuencia de lanzamiento para mejorar feedback visual

### 8.3. Character Animations

Las animaciones de los personajes se han ampliado significativamente:

```javascript
// En Menu.js - Ejemplo de animaciones decorativas
// Crear la animación idle para el pingüino decorativo
if (!this.anims.exists('menu_penguin_idle')) {
  this.anims.create({
    key: 'menu_penguin_idle',
    frames: this.anims.generateFrameNumbers('penguin_sheet', {
      frames: [40, 41, 42, 40] // Frames para animación idle
    }),
    frameRate: 2,
    repeat: -1
  });
}

// Crear la animación de salto para el pingüino
if (!this.anims.exists('menu_penguin_jump')) {
  this.anims.create({
    key: 'menu_penguin_jump',
    frames: this.anims.generateFrameNumbers('penguin_sheet', {
      frames: [50, 51, 50] // Frames de salto
    }),
    frameRate: 4,
    repeat: 2
  });
}
```

- Hojas de sprites organizadas para personajes principales
- Sistema de animación basado en estado para comportamientos complejos
- Animaciones decorativas para elementos de menú y UI
- Transiciones suaves entre estados de animación

## 9. User Interface Implementation

El sistema de UI es modular y consta de varios componentes especializados:

### 9.1. Main Menu Screen

```javascript
// En Menu.js
createMainMenu(width, height) {
  // Crear botones con estilo de glaciar
  const startButton = this.createIceButton(
    width / 2,
    height * 0.55,
    'JUGAR',
    200,
    50
  );

  const instructionsButton = this.createIceButton(
    width / 2,
    height * 0.65,
    'INSTRUCCIONES',
    200,
    50
  );
}
```

- Diseño temático de glaciar con gradientes tipo hielo
- Diseño responsivo que se adapta al tamaño de pantalla
- Botones interactivos con efectos de hover/press
- Título animado y copos de nieve decorativos
- Personajes animados (pingüino y yeti) con comportamientos periódicos

### 9.2. Game UI Elements

```javascript
// En Game.js
this.gameUI = new GameUI(this);
this.gameUI.createUI();
```

- `PowerBar`: Indicador visual para selección de potencia
- `AngleIndicator`: Flecha mostrando ángulo de lanzamiento
- Visualización de distancia con puntuaciones actual y total
- Contador de intentos con iconos de pingüino
- Visualización de mejor distancia

### 9.3. Game Over Screen

```javascript
// En Game.js
this.gameOverScreen = new GameOverScreen(this);

// Al mostrar la pantalla:
this.gameOverScreen.show({
  totalDistance: this.scoreManager.totalDistance,
  bestDistance: this.scoreManager.bestTotalDistance,
  onRestart: handleRestart,
  onMainMenu: handleMainMenu
});
```

- Overlay modal que bloquea la entrada del juego
- Muestra la distancia total y el mejor récord
- Efectos especiales para nuevos récords
- Opciones de reinicio y menú principal
- Diseño temático de glaciar que coincide con el estilo general de UI

### 9.4. Settings Modal

Una adición reciente al juego es el modal de configuración mejorado, que permite a los usuarios ajustar diversas opciones:

```javascript
// En SettingsModal.js
addSoundToggle(x, y, width) {
  // Implementación del control de volumen con slider y botón de mute
  // ...

  // Dibujar icono de altavoz según estado y volumen
  const speakerIcon = this.scene.add.graphics();

  // Determinar si debería estar silenciado (isEnabled false o volumen 0)
  const isMuted = !isSoundEnabled || currentVolume === 0;

  // Dibujar altavoz inicial
  this.drawSpeakerIcon(speakerIcon, iconX, iconY, !isMuted);

  // --- SLIDER DE VOLUMEN ---
  // Fondo del slider con estilo glaciar
  const sliderBg = this.scene.add.graphics();
  sliderBg.fillGradientStyle(0x3d5e7e, 0x3d5e7e, 0x555555, 0x555555, 0.8);

  // Actualizar volumen cuando se mueve el slider
  this.updateVolumeControls(state, knob, progressBar, percentText, newSliderX, sliderY, sliderWidth, sliderHeight, speakerIcon, iconX, iconY);
}
```

- Control de volumen con slider visual integrado con el estilo glaciar
- Botón de mute/unmute con indicador visual que cambia según el estado
- Visualización de porcentaje de volumen (0-100%)
- Opciones para resetear récords y reiniciar el juego
- Interfaz reactiva con feedback visual para todas las interacciones
- Diseño coherente con el resto de la UI del juego

### 9.5. Instructions Screen

- Instrucciones detalladas del juego con ayudas visuales
- Elementos interactivos para demostrar la jugabilidad
- Opción para ver animaciones de pingüino para pruebas

## 10. Audio System Implementation

El sistema de audio es una característica clave implementada a través de la clase `SoundManager`:

```javascript
// En SoundManager.js - Ejemplo de método de reproducción de música
playMusic(key, config = {}) {
  // No reproducir si la música está deshabilitada
  if (!this.musicEnabled) return;

  // Valores predeterminados para la configuración
  const defaultConfig = {
    loop: true,
    volume: this.musicVolume,
    fade: false,
    fadeTime: 1000
  };

  // Combinar la configuración proporcionada con la predeterminada
  const finalConfig = { ...defaultConfig, ...config };

  // Implementación de reproducción de música...
}
```

El sistema de audio incluye:

### 10.1. Music Management

- Reproducción de música de fondo con opciones para loop, fade in/out
- Cambios suaves entre pistas con transiciones de fade
- Soporte para pausar/reanudar música durante interacciones del juego
- Registro global para evitar reproducción duplicada de música

### 10.2. Sound Effects Management

- Sistema de efectos de sonido para acciones del juego
- Control de volumen independiente para música y efectos
- Caché de sonidos para rendimiento optimizado
- Verificación de soporte de audio del navegador

### 10.3. Volume Control Integration

Recientemente mejorado con controles de volumen avanzados:

```javascript
// En SettingsModal.js - Método para actualizar control de volumen
updateVolumeControls(state, knob, progressBar, percentText, sliderX, sliderY, sliderWidth, sliderHeight, speakerIcon, iconX, iconY) {
  // Actualizar posición del knob
  knob.clear();
  knob.fillStyle(0x4CAF50, 1);
  const knobPosition = sliderX - sliderWidth/2 + (sliderWidth * state.volume);
  knob.fillCircle(knobPosition, sliderY, (sliderHeight - 10) / 2);

  // Actualizar barra de progreso
  this.updateVolumeBar(progressBar, sliderX, sliderY, sliderWidth, sliderHeight, state.volume);

  // Actualizar texto de porcentaje
  const volumePercentage = Math.round(state.volume * 100);
  percentText.setText(`${volumePercentage}%`);

  // Verificar si debemos actualizar el icono basado en el volumen
  if (speakerIcon && iconX !== undefined && iconY !== undefined) {
    const shouldBeMuted = state.volume === 0 || !state.isOn;
    speakerIcon.clear();
    this.drawSpeakerIcon(speakerIcon, iconX, iconY, !shouldBeMuted);
  }

  // Aplicar volumen al SoundManager
  if (this.scene.soundManager) {
    this.scene.soundManager.setMusicVolume(state.volume);
    this.scene.soundManager.setSfxVolume(state.volume);
  }
}
```

- Control deslizable para ajuste fino del volumen (0-100%)
- Botón de mute/unmute con cambio automático cuando el volumen llega a 0
- Persistencia de preferencias de volumen usando `StorageManager`
- Interfaz visual que refleja el estilo glaciar del juego
- Eventos de arrastre optimizados para controlar el volumen en tiempo real

### 10.4. Audio Persistence

- Preferencias de audio guardadas en localStorage
- Restauración automática de configuraciones de audio entre sesiones
- Verificación de capacidades de audio del navegador

## 11. Technical Architecture

El juego está construido con una arquitectura modular centrada en la separación de responsabilidades:

### 11.1. Scene Management

```javascript
// En main.js
const config = {
  // ...
  scene: [Boot, Preload, Menu, Game, AnimationTest]
};
```

- `Boot`: Configuración inicial y carga mínima de assets
- `Preload`: Carga completa de assets con visualización de progreso
- `Menu`: Interfaz de menú principal e instrucciones
- `Game`: Implementación core de gameplay
- `AnimationTest`: Escena dedicada para probar animaciones

### 11.2. Component System

El juego utiliza una arquitectura basada en componentes:

```
src/
├─ components/
│  ├─ characters/      # Gestión de personajes
│  ├─ environment/     # Elementos del mundo
│  ├─ gameplay/        # Mecánicas core
│  └─ ui/              # Elementos de interfaz
```

- Los componentes son instanciados por las escenas
- Cada componente tiene una responsabilidad enfocada
- Los componentes se comunican a través de interfaces definidas

### 11.3. State Management

Centralizado a través del `GameStateManager`:

```javascript
// En Game.js
this.stateManager = new GameStateManager();

// Los cambios de estado disparan un patrón observer
this.stateManager.addStateObserver((newState) => {
  if (this.characterManager) {
    this.characterManager.setAnimationByState(newState, {
      success: this.scoreManager && this.scoreManager.currentDistance > 500
    });
  }
});
```

- Estados definidos: READY, ANGLE_SELECTION, POWER_SELECTION, LAUNCHING, FLYING, STOPPED, ENDED
- Patrón observer para que los componentes reaccionen a los cambios de estado
- Sistema de estado modal para controlar el bloqueo de entrada
- Capacidades de reset para reinicio del juego

### 11.4. Data Persistence

Implementado con localStorage:

```javascript
// En ScoreManager.js
checkAndUpdateBestDistance() {
  const currentTotal = this.totalDistance;
  if (currentTotal > this.bestTotalDistance) {
    this.bestTotalDistance = currentTotal;
    localStorage.setItem('pingufly_best_distance', currentTotal.toString());
    return true; // Indica nuevo récord
  }
  return false;
}
```

- Récords de mejor distancia guardados localmente
- Persistencia de configuraciones del juego
- Recuperación de estado en recarga de página

## 12. Current Implementation Status

Basado en la línea de tiempo de desarrollo:

### 12.1. Completed Features
- Mecánicas core del juego (selección de ángulo, selección de potencia, física de lanzamiento)
- Sistema de gestión de personajes con estados de animación
- Entorno con fondos de parallax y elementos visuales
- Sistema de cámara con seguimiento suave y efectos visuales
- Sistema de UI con tema de glaciar en todas las pantallas
- Seguimiento de puntuación con récords de mejor distancia
- Sistema de gestión de estado
- Pantalla de fin de juego con opciones de reinicio y menú
- Animaciones mejoradas para personajes en menú principal
- Control de volumen avanzado con slider y botón de mute
- Sistema de corrección para cálculo preciso de distancia

### 12.2. In Progress / Planned Features
- Efectos de sonido completos y música de fondo
- Animaciones finales de personajes durante el juego
- Obstáculos ambientales adicionales y elementos interactivos
- Optimizaciones de rendimiento para dispositivos móviles
- Integración de analytics para métricas de gameplay
- Sistema de tabla de clasificación online

## 13. Technical Considerations and Optimizations

### 13.1. Performance Optimization

Las optimizaciones actuales incluyen:
- Gestión eficiente de sprites con pooling para partículas
- Culling de cámara para elementos fuera de pantalla
- Física simplificada para objetos distantes
- Configuraciones de calidad adaptativas basadas en capacidades del dispositivo
- Correcciones para prevenir cálculos duplicados que afectan el rendimiento

### 13.2. Mobile Considerations

El juego está optimizado para móvil con:
- Canvas responsivo que escala al tamaño del dispositivo
- Entrada táctil con áreas de hit más grandes para botones
- Calidad de renderizado adaptativa
- Cálculos de física simplificados en dispositivos de gama baja

### 13.3. Browser Compatibility

El juego se dirige a navegadores modernos con:
- Renderizado WebGL con fallback a Canvas
- Características ES6+ con polyfills apropiados
- Diseño responsivo para varios tamaños de pantalla

## 14. Conclusion

PinguFly ha evolucionado desde un diseño conceptual a un juego completamente funcional con visuales ricos, mecánicas atractivas y una experiencia de usuario pulida. Las recientes mejoras en el sistema de audio, correcciones en el cálculo de distancia y expansión de animaciones de personajes han fortalecido significativamente la experiencia de juego.

La arquitectura modular y el diseño basado en componentes continúan permitiendo un refinamiento fácil y expansión de características, como se ha demostrado con la reciente implementación del control de volumen avanzado.

El desarrollo futuro se centrará en completar la integración de efectos de sonido, implementar obstáculos ambientales adicionales y optimizar el rendimiento para una gama más amplia de dispositivos.
