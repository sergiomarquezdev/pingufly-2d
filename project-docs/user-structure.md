# Yeti Sports: Pingu Throw - Flujo de Usuario y Estructura del Proyecto

## Flujo de Usuario Detallado

### 1. Inicio del Juego
- **Acción del usuario**: Cargar la página web del juego
- **Respuesta del sistema**:
  - Mostrar pantalla de carga
  - Cargar assets y recursos 3D
  - Mostrar escena inicial con el Yeti y el entorno
  - Mostrar mensaje "Haz click para iniciar"

### 2. Fase de Preparación
- **Acción del usuario**: Hacer clic para iniciar el juego
- **Respuesta del sistema**:
  - Iniciar la animación del pingüino cayendo desde la montaña
  - Mostrar mensaje "Haz click en el momento preciso para golpear al pingüino"

### 3. Fase de Golpe
- **Acción del usuario**: Hacer clic para intentar golpear al pingüino en el momento óptimo
- **Respuesta del sistema**:
  - Animar al Yeti golpeando con el bate
  - Evaluar la calidad del timing del clic
  - Si el golpe es exitoso:
    - Lanzar al pingüino con una fuerza proporcional a la precisión del timing
  - Si el golpe falla:
    - Mostrar animación de fallo (pingüino cayendo al suelo)
    - Pasar directamente a la fase de resultados

### 4. Fase de Vuelo
- **Acción del sistema**:
  - Animar el vuelo del pingüino aplicando física realista
  - Seguir al pingüino con la cámara
  - Actualizar en tiempo real el contador de distancia
  - Detectar cuando el pingüino se detiene

### 5. Fase de Resultados
- **Acción del sistema**:
  - Mostrar la distancia final alcanzada
  - Actualizar el récord personal si corresponde
  - Mostrar mensaje "¡Lanzamiento finalizado! Haz clic para jugar de nuevo"

### 6. Reinicio
- **Acción del usuario**: Hacer clic para reiniciar
- **Respuesta del sistema**:
  - Reiniciar posiciones de los elementos
  - Volver a la fase de preparación

## Diagrama de Flujo de Datos

```
Usuario ──> Clic Inicial ───> Sistema inicia caída del pingüino
                                     │
                                     ▼
Usuario ──> Clic de Golpe ───> Sistema evalúa timing
                                     │
                                     ▼
                          ┌───── Calidad del golpe ─────┐
                          │                             │
                          ▼                             ▼
                     Golpe exitoso                  Golpe fallido
                          │                             │
                          ▼                             │
           Sistema aplica física al pingüino            │
                          │                             │
                          ▼                             │
          Sistema actualiza y muestra distancia         │
                          │                             │
                          ▼                             ▼
                    Sistema muestra resultados finales
                                     │
                                     ▼
Usuario ──> Clic de Reinicio ──> Sistema reinicia el juego
```

## Estructura del Proyecto

### Estructura de Archivos
La estructura del proyecto sigue una organización modular basada en las responsabilidades de cada componente:

```
yetisports-game/
│
├── src/                     # Código fuente principal
│   ├── scenes/              # Configuración de escenas
│   │   └── main-scene.js    # Escena principal del juego
│   │
│   ├── entities/            # Objetos del juego
│   │   ├── yeti-entity.js   # Lógica y visualización del Yeti
│   │   ├── penguin-entity.js # Lógica y visualización del Pingüino
│   │   └── environment-entity.js # Entorno y elementos decorativos
│   │
│   ├── systems/             # Sistemas de juego
│   │   └── game-manager.js  # Gestión del estado y flujo del juego
│   │
│   ├── utils/               # Utilidades
│   │   ├── constants.js     # Constantes y configuraciones
│   │   └── asset-loader.js  # Carga de recursos
│   │
│   └── index.js             # Punto de entrada y configuración
│
├── public/                  # Recursos estáticos
│   └── assets/              # Assets del juego (a implementar)
│
├── project-docs/            # Documentación del proyecto
│
├── index.html               # HTML principal
├── package.json             # Configuración de npm y dependencias
└── vite.config.js           # Configuración de Vite
```

## Flujo de Datos Técnico

### Inicialización
1. `index.js` carga e inicializa el juego
2. `asset-loader.js` carga los recursos necesarios
3. `main-scene.js` configura la escena 3D y la cámara
4. `game-manager.js` inicializa el estado del juego
5. Las entidades (`yeti-entity.js`, `penguin-entity.js`, `environment-entity.js`) se crean y añaden a la escena

### Ciclo del Juego
1. El bucle principal en `index.js` llama a `update` en `game-manager.js`
2. `game-manager.js` gestiona el estado actual del juego y llama a `update` en las entidades correspondientes
3. Las entidades actualizan su lógica y animaciones según el estado del juego
4. Los datos de juego (distancia, etc.) se actualizan en la interfaz
5. La escena se renderiza mostrando el estado actual

## Interacción con el DOM
- Los elementos HTML se utilizan para mostrar:
  - Estado de carga
  - Instrucciones al usuario
  - Distancia actual
  - Récord personal
  - Mensajes de finalización

## Almacenamiento de Datos
- `localStorage` se utiliza para guardar el récord personal del jugador
- Los datos de estado del juego se mantienen en memoria durante la sesión
