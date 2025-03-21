/**
 * GameUI - Gestiona la interfaz de usuario para la escena de juego
 * Controla la visualización de puntuaciones, intentos, y mensajes al usuario
 */
export default class GameUI {
    /**
     * Constructor de GameUI
     * @param {Phaser.Scene} scene - Referencia a la escena del juego
     */
    constructor(scene) {
        this.scene = scene;

        // Elementos de UI
        this.uiFooter = null;
        this.distanceText = null;
        this.bestDistanceText = null;
        this.attemptIcons = [];
    }

    /**
     * Crea la interfaz de usuario completa
     */
    createUI() {
        // Tamaño del canvas
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;

        // Crear un footer en la parte inferior de la pantalla
        this.uiFooter = this.scene.add.container(0, height - 30)
            .setScrollFactor(0)
            .setDepth(10); // Configurar una profundidad alta para la UI

        // Fondo del footer
        const footerBg = this.scene.add.rectangle(0, 0, width, 30, 0x104080, 0.8)
            .setOrigin(0, 0)
            .setStrokeStyle(2, 0xffffff, 0.5);

        // Añadir textura al footer para hacerlo más temático
        const footerTexture = this.scene.add.tileSprite(0, 0, width, 50, 'ground')
            .setOrigin(0, 0)
            .setAlpha(0.3)
            .setTint(0x88bbff);

        // ===== SECCIÓN DE INTENTOS (IZQUIERDA) =====
        // Contenedor para los iconos de pingüino
        const attemptsContainer = this.scene.add.container(20, 20);

        // Crear 5 iconos de pingüino
        this.attemptIcons = [];
        const ICON_SPACING = 30;
        const maxLaunchAttempts = this.scene.stateManager.getMaxAttempts();

        for (let i = 0; i < maxLaunchAttempts; i++) {
            const icon = this.scene.add.image(i * ICON_SPACING, 0, 'penguin')
                .setOrigin(0.5, 0.75)
                .setScale(1.3);

            this.attemptIcons.push(icon);
            attemptsContainer.add(icon);
        }

        // Calcular posición para el título después de los iconos de pingüino
        const titlePosX = 20 + (maxLaunchAttempts * ICON_SPACING) + 15;

        // Título del juego justo después de los iconos de intentos (pingüinos)
        const gameTitle = this.scene.add.text(titlePosX, 15, "PINGUFLY", {
            fontFamily: 'Impact',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#104080',
            strokeThickness: 2,
        }).setOrigin(0, 0.5);

        // ===== SECCIÓN DE DISTANCIA TOTAL ACUMULADA (CENTRO-DERECHA) =====
        const distanceLabel = this.scene.add.text(width - 280, 15, "DISTANCE", {
            fontFamily: 'Impact',
            fontSize: '16px',
            color: '#ffffff',
        }).setOrigin(0.5, 0.5);

        this.distanceText = this.scene.add.text(width - 230, 15, "0 m", {
            fontFamily: 'Impact',
            fontSize: '23px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0, 0.5);

        // ===== SECCIÓN DE MEJOR DISTANCIA (RÉCORD) =====
        const bestLabel = this.scene.add.text(width - 105, 15, "BEST", {
            fontFamily: 'Impact',
            fontSize: '16px',
            color: '#ffdd00',
        }).setOrigin(0.5, 0.5);

        this.bestDistanceText = this.scene.add.text(width - 75, 15, this.scene.scoreManager.bestTotalDistance + " m", {
            fontFamily: 'Impact',
            fontSize: '23px',
            color: '#ffdd00',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0, 0.5);

        // Añadir todo al footer
        this.uiFooter.add([
            footerBg,
            footerTexture,
            gameTitle,
            attemptsContainer,
            distanceLabel,
            this.distanceText,
            bestLabel,
            this.bestDistanceText
        ]);
    }

    /**
     * Actualiza la interfaz gráfica de intentos
     * @param {Number} launchAttempts - Número de intentos realizados
     * @param {Number} maxLaunchAttempts - Número máximo de intentos permitidos
     */
    updateAttemptsUI(launchAttempts, maxLaunchAttempts) {
        // Actualizar los iconos de pingüino
        for (let i = 0; i < maxLaunchAttempts; i++) {
            if (i < launchAttempts) {
                // Intento usado - pingüino completo
                this.attemptIcons[i].setAlpha(0.4);
                this.attemptIcons[i].setTint(0xaaccff);
                this.attemptIcons[i].setScale(1.0); // Escala reducida para intentos usados
            } else {
                // Intento disponible - pingüino semi-transparente
                this.attemptIcons[i].setAlpha(1);
                this.attemptIcons[i].clearTint();
                this.attemptIcons[i].setScale(1.3); // Mantener escala original
            }
        }

        // Animar el icono del intento actual
        if (launchAttempts > 0 && launchAttempts <= maxLaunchAttempts) {
            const currentIcon = this.attemptIcons[launchAttempts - 1];
            this.scene.tweens.add({
                targets: currentIcon,
                scaleX: { from: 1.5, to: 1.0 },
                scaleY: { from: 1.5, to: 1.0 },
                duration: 300,
                ease: 'Back.easeOut'
            });
        }
    }

    /**
     * Actualiza el texto de distancia en la UI
     * @param {Number} currentDistance - Distancia del lanzamiento actual
     * @param {Number} totalDistance - Distancia total acumulada
     */
    updateDistanceText(currentDistance, totalDistance) {
        // Calcular la distancia total (la acumulada hasta ahora + la del lanzamiento actual)
        const totalWithCurrent = totalDistance + currentDistance;

        // Actualizar el texto de distancia con la suma total
        if (Math.abs(parseInt(this.distanceText.text) - totalWithCurrent) >= 1) {
            this.distanceText.setText(totalWithCurrent + ' m');

            // Pequeña animación de escala al cambiar el número
            this.scene.tweens.add({
                targets: this.distanceText,
                scaleX: { from: 1.2, to: 1 },
                scaleY: { from: 1.2, to: 1 },
                duration: 100,
                ease: 'Sine.easeOut'
            });
        }
    }

    /**
     * Actualiza el texto de mejor distancia
     * @param {Number} bestDistance - Mejor distancia alcanzada
     */
    updateBestDistanceText(bestDistance) {
        this.bestDistanceText.setText(bestDistance + ' m');
    }

    /**
     * Muestra mensaje para el siguiente lanzamiento
     */
    showNextLaunchPrompt() {
        const width = this.scene.cameras.main.width;

        // Mensaje para el siguiente lanzamiento
        const nextLaunchText = this.scene.add.text(width / 2, 170, 'Haz clic para el siguiente lanzamiento', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0);

        // Animación
        this.scene.tweens.add({
            targets: nextLaunchText,
            alpha: 0.5,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Mostrar mensaje de controles
        this.showControlsInfo();
    }

    /**
     * Muestra información sobre los controles de teclado
     */
    showControlsInfo() {
        const width = this.scene.cameras.main.width;

        // Eliminar mensaje anterior si existe
        const existingControls = this.scene.children.getByName('controlsInfo');
        if (existingControls) existingControls.destroy();

        // Crear un contenedor para el mensaje de controles en la parte superior
        const controlsContainer = this.scene.add.container(width / 2, 0).setScrollFactor(0).setName('controlsInfo');

        // Fondo sutil semi-transparente con forma de píldora
        const controlsBg = this.scene.add.graphics();
        controlsBg.fillStyle(0x000000, 0.6);
        controlsBg.fillRoundedRect(-120, 0, 240, 16, 0, 0, 8, 8);

        // Texto de los controles en una sola línea
        const controlsText = this.scene.add.text(0, 8, "ESC = Menú | R = Reiniciar", {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Añadir todo al contenedor
        controlsContainer.add([controlsBg, controlsText]);
    }
}
