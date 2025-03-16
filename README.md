# Yeti Sports: Pingu Throw

Una recreación moderna del clásico juego "Yeti Sports: Pingu Throw" utilizando JavaScript y Three.js para gráficos 3D.

## Descripción

Este proyecto recrea el icónico minijuego de principios de los 2000 donde controlas a un Yeti que golpea a un pingüino con un bate, intentando lanzarlo lo más lejos posible. El juego se centra en el timing preciso para conseguir el golpe perfecto y maximizar la distancia del lanzamiento.

## Características

- **Gráficos 3D** utilizando Three.js para una experiencia visual moderna
- **Física realista** para la caída y vuelo del pingüino
- **Mecánica de timing** para determinar la calidad del golpe
- **Sistema de puntuación** que registra la distancia recorrida
- **Récords personales** guardados localmente
- **Diseño responsive** que se adapta a diferentes tamaños de pantalla
- **Efectos visuales** como sombras dinámicas e iluminación realista

## Demostración en vivo

_Próximamente_

## Requisitos previos

- Node.js (v14.x o superior)
- npm (v6.x o superior)

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/sergiomarquezdev/yetisports-game.git
   cd yetisports-game
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre tu navegador en `http://localhost:3000`

## Estructura del proyecto

```
yetisports-game/
│
├── src/                     # Código fuente
│   ├── scenes/              # Escenas del juego
│   │   └── main-scene.js    # Escena principal
│   │
│   ├── entities/            # Entidades del juego
│   │   ├── yeti-entity.js   # Entidad Yeti
│   │   ├── penguin-entity.js # Entidad Pingüino
│   │   └── environment-entity.js # Entorno
│   │
│   ├── systems/             # Sistemas del juego
│   │   └── game-manager.js  # Gestor del juego
│   │
│   ├── utils/               # Utilidades
│   │   ├── constants.js     # Constantes del juego
│   │   └── asset-loader.js  # Cargador de assets
│   │
│   └── index.js             # Punto de entrada principal
│
├── public/                  # Archivos estáticos
│   └── assets/              # Recursos del juego
│       ├── models/          # Modelos 3D
│       └── textures/        # Texturas
│
├── project-docs/            # Documentación del proyecto
│
├── index.html               # HTML principal
├── package.json             # Configuración de npm
└── vite.config.js           # Configuración de Vite
```

## Cómo jugar

1. **Inicia el juego**: Haz clic para comenzar
2. **Observa**: El pingüino comenzará a caer desde la cima de la montaña
3. **Timing preciso**: Haz clic en el momento exacto cuando el pingüino esté en la posición óptima
4. **Disfruta del vuelo**: Observa cómo el pingüino vuela a través del escenario
5. **Comprueba tu puntuación**: Verás la distancia alcanzada cuando el pingüino se detenga
6. **Mejora tu récord**: Intenta superar tu mejor marca en cada intento

## Scripts disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción localmente

## Tecnologías utilizadas

- [Three.js](https://threejs.org/) - Biblioteca de gráficos 3D basada en WebGL
- [Vite](https://vitejs.dev/) - Herramienta de desarrollo frontend ultrarrápida
- JavaScript ES6+ - Para la lógica del juego

## Estado del proyecto

Este proyecto se encuentra actualmente en fase MVP (Minimum Viable Product). Estamos trabajando en implementar todas las funcionalidades básicas antes de añadir características adicionales.

## Próximas mejoras

- Efectos visuales mejorados (partículas de nieve, rastros en el hielo)
- Modelos 3D más detallados
- Modo de niveles con objetivos específicos
- Coleccionables durante el vuelo del pingüino
- Sonidos y música
- Soporte para dispositivos móviles con controles táctiles
- Modos multijugador o tabla de clasificación global

## Contribución

Las contribuciones son bienvenidas. Por favor, siéntete libre de abrir un issue o enviar un pull request.

1. Haz fork del proyecto
2. Crea tu rama de características (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Créditos

- Inspirado en el juego original "Yeti Sports: Pingu Throw" de Chris Hilgert (2004)
- Desarrollado como proyecto educativo para aprender y practicar Three.js y física en juegos web
- Imagen de portada: representación del juego original

## Contacto

Si tienes alguna pregunta o sugerencia, no dudes en ponerte en contacto.

---

**Nota**: Este proyecto es una recreación con fines educativos y de nostalgia, y no está afiliado con el juego original "Yeti Sports".
