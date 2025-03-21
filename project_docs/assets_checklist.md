# PinguFly - Assets Checklist (Versión Simplificada)

Este documento enumera los recursos gráficos y de audio esenciales para la primera versión del juego.

## Sprites y Gráficos

### Personajes

#### Yeti
- [ ] Sprite base del Yeti
  - *Nombre de archivo*: `yeti.png`
  - *Tamaño recomendado*: 200x250px
  - *Descripción*: Yeti blanco con expresión amigable en posición de preparación
- [ ] Sprite simple de golpeo
  - *Nombre de archivo*: `yeti_hit.png`
  - *Descripción*: Una sola pose para el momento del golpe

#### Pingüino
- [ ] Sprite del pinguino
  - *Nombre de archivo*: `penguin.png`
  - *Tamaño*: 256x320px
  - *Tamaño de cada elemento*: 32x32 (cada acción del sprite)
  - *Descripción*: Pingüino que realiza distintas acciones. Leido de izquierda a derecha, y de arriba hacia abajo, estas son las distinta acciones que realiza:
  Sprites 1-3: Representan al pingüino mirando a la derecha, con una pose estática (1) y dos frames de caminata (2 y 3).
Sprites 4-6: Son los equivalentes mirando a la izquierda, con una pose estática (4) y dos frames de caminata (5 y 6).

#### Flamenco
- [ ] Sprite base del Flamenco
  - *Nombre de archivo*: `flamingo.png`
  - *Tamaño recomendado*: 120x350px
  - *Descripción*: Flamenco rosado con cuello largo y patas finas

### Entorno

#### Fondo
- [X] Cielo con gradiente
  - *Nombre de archivo*: `background_sky.png`
  - *Tamaño*: 3072x1536
  - *Descripción*:
    La imagen muestra un fondo de cielo azul claro, con un degradado sutil de azul más oscuro en la parte superior a un azul más claro en la parte inferior.
    En la parte superior, se pueden ver tres nubes blancas y esponjosas:
    - Una nube grande y redondeada en la esquina superior derecha.
    - Una nube ligeramente más pequeña y con forma irregular a la izquierda de la grande.
    - Una nube pequeña y alargada en el centro, debajo de las otras dos.
    Las nubes son de un blanco puro y tienen bordes suaves, lo que les da un aspecto tridimensional ligero.
    El resto del fondo está vacío, lo que crea una sensación de amplitud y tranquilidad.

- [X] Sol
  - *Nombre de archivo*: `background_sun.png`
  - *Tamaño*: 200x200
  - *Descripción*:
    **Forma y Estructura:**
    - La imagen muestra un círculo perfecto, que representa el sol.
    - El círculo está rodeado por un halo de luz que se difumina hacia el exterior.
    **Colores:**
    - Amarillo: El círculo central es de un amarillo brillante y saturado. Este color representa la luz intensa y el calor del sol.
    - Amarillo Degradado: El halo que rodea el círculo central es de un amarillo más claro y difuminado, que se mezcla gradualmente con el fondo gris. Esto crea un efecto de resplandor y simula la atmósfera solar.
    - Gris: El fondo de la imagen es de un gris neutro y uniforme. Este color contrasta con el amarillo brillante del sol y ayuda a que resalte.
    **Estilo y Características:**
    - Sencillo y Plano: La imagen tiene un estilo sencillo y plano, sin sombras ni texturas complejas. Esto le da al sol un aspecto caricaturesco y fácil de identificar.
    - Brillo y Resplandor: El halo amarillo degradado crea un efecto de brillo y resplandor alrededor del sol, simulando la luz que emite.
    - Forma Perfecta: El círculo perfecto del sol le da un aspecto idealizado y simbólico.

- [X] Montaña
  - *Nombre de archivo*: `background_mountain.png`
  - *Tamaño*: 200x100
  - *Descripción*:
    **Objeto Principal:**
    La imagen muestra una montaña o colina estilizada, ocupando la mayor parte del encuadre.
    Se pueden distinguir dos picos ligeramente diferenciados, lo que sugiere una formación de dos cimas cercanas o una montaña con una cima doble.
    La montaña tiene una forma generalmente triangular redondeada.
    **Colores:**
    Marrón: La montaña está representada en un tono marrón medio, uniforme y sólido. Este color cubre toda la montaña.
    Gris: El fondo de la imagen es de un gris neutro y sólido. Este color contrasta con el marrón de la montaña, resaltando su forma.
    **Estilo y Características:**
    Pixel Art: La imagen está claramente realizada en estilo pixel art, con píxeles visibles y bordes irregulares. Esto le da un aspecto retro y de baja resolución.
    Sombreado Simplificado: La montaña muestra un sombreado rudimentario en los bordes inferiores, simulando volumen. Este sombreado se realiza con píxeles más oscuros del mismo tono marrón.
    Simplicidad: La imagen es extremadamente simple, sin detalles ni texturas complejas. Esto le da un aspecto minimalista y gráfico.

- [X] Nubes básicas (4 tipos)
  - *Nombre de archivo*: `cloud_01.png`, `cloud_02.png`, `cloud_03.png`, `cloud_04.png`
  - *Tamaño*: 200x122px
  - *Descripción*: Nubes blancas esponjosas de diferentes tamaños

#### Suelo y Decoración
- [X] Árbol
  - *Nombre de archivo*: `tree_01.png`
  - *Tamaño*: tree_01.png (1342x1096)
  - *Descripción*: Arbol seco sin hojas

- [X] Piedra
  - *Nombre de archivo*: `rocks.png`
  - *Tamaño*: 64x64px
  - *Descripción*: Rocas pequeñas en tonos grises

### Interfaz de Usuario

#### Elementos de HUD
- [X] Barra de potencia básica
  - *Implementado en código*
- [X] Indicador de ángulo básico
  - *Implementado en código*

#### Botones Básicos
- [ ] Botón de inicio/reinicio
  - *Nombre de archivo*: `button_start.png`
  - *Tamaño recomendado*: 200x80px
  - *Descripción*: Botón simple con texto "Start" o "Retry"
- [ ] Botón de volver a menú
  - *Nombre de archivo*: `button_menu.png`
  - *Tamaño recomendado*: 80x80px
  - *Descripción*: Botón con icono de casa o menú

## Recursos de Audio Básicos

### Música
- [ ] Tema principal del juego
  - *Nombre de archivo*: `music_main.mp3`
  - *Duración*: 1-2 minutos (loop)
  - *Descripción*: Melodía alegre con ritmo medio

### Efectos de Sonido Prioritarios
- [ ] Sonido de botón
  - *Nombre de archivo*: `sfx_button.wav`
  - *Duración*: 0.5 segundos
- [ ] Sonido de lanzamiento
  - *Nombre de archivo*: `sfx_launch.wav`
  - *Duración*: 1 segundo
  - *Descripción*: Whoosh de aire/velocidad
- [ ] Sonido de golpe
  - *Nombre de archivo*: `sfx_hit.wav`
  - *Duración*: 0.5 segundos
  - *Descripción*: Impacto cómico, no violento
- [ ] Sonido de aterrizaje
  - *Nombre de archivo*: `sfx_land.wav`
  - *Duración*: 1 segundo
  - *Descripción*: Impacto en tierra

## Notas sobre estilo visual
- Estilo cartoon/caricatura simple con colores vibrantes
- Contornos definidos para los personajes
- Paleta de colores: tonos cálidos para la sabana, azules para el cielo
