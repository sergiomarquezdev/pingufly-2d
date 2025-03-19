/**
 * LaunchManager - Gestiona el proceso de lanzamiento del pingüino
 * Se encarga de las fases de selección de ángulo, potencia y el lanzamiento
 */
export default class LaunchManager {
    /**
     * Constructor del LaunchManager
     * @param {Phaser.Scene} scene - Referencia a la escena del juego
     */
    constructor(scene) {
        this.scene = scene;
        this.stateManager = scene.stateManager;
        this.angleIndicator = scene.angleIndicator;
        this.powerBar = scene.powerBar;
        this.characterManager = scene.characterManager;

        // Valores seleccionados
        this.selectedAngle = 45; // Ángulo predeterminado
        this.selectedPower = 0;  // Potencia inicial
    }

    /**
     * Inicia la selección de ángulo
     */
    startAngleSelection() {
        this.stateManager.setState('ANGLE_SELECTION');

        // Antes de iniciar, destruir cualquier objeto gráfico residual
        this.scene.children.list
            .filter(child =>
                (child.name && child.name.includes('angle')) ||
                (child.type === 'Text' && child.text && child.text.includes('Ángulo'))
            )
            .forEach(obj => {
                obj.destroy();
            });

        // Asegurarnos que el pingüino esté en estado visible correcto
        this.characterManager.penguin.clearTint();
        this.characterManager.penguin.setAlpha(1);
        this.characterManager.penguin.setVisible(true);

        // Iniciar la selección de ángulo con el componente AngleIndicator
        this.angleIndicator.startAngleSelection((angle) => {
            // Actualizar el ángulo del juego cuando cambia en el indicador
            this.selectedAngle = angle;
        });

        // Mensaje de instrucción
        this.scene.add.text(400, 100, 'Haz clic para seleccionar el ángulo', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setName('angleInstructionText');
    }

    /**
     * Finaliza la selección de ángulo
     */
    endAngleSelection() {
        // Detener la animación del ángulo usando el componente
        this.selectedAngle = this.angleIndicator.endAngleSelection();

        // Eliminar el texto de instrucción
        this.scene.children.list
            .filter(child => child.name === 'angleInstructionText')
            .forEach(text => text.destroy());
    }

    /**
     * Inicia la selección de potencia
     */
    startPowerSelection() {
        this.stateManager.setState('POWER_SELECTION');

        // Iniciar la selección de potencia con el componente PowerBar
        this.powerBar.startPowerSelection((power) => {
            // Actualizar la potencia del juego cuando cambia en la barra
            this.selectedPower = power;
        });

        // Mensaje de instrucción
        this.scene.add.text(400, 100, 'Haz clic para seleccionar la potencia', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setName('powerInstructionText');
    }

    /**
     * Finaliza la selección de potencia
     */
    endPowerSelection() {
        // Detener la animación de potencia usando el componente
        this.selectedPower = this.powerBar.endPowerSelection();

        // Eliminar el texto de instrucción
        this.scene.children.list
            .filter(child => child.name === 'powerInstructionText')
            .forEach(text => text.destroy());
    }

    /**
     * Lanza al pingüino con el ángulo y potencia seleccionados
     */
    launchPenguin() {
        this.stateManager.setState('LAUNCHING');

        // Incrementar contador de intentos
        this.stateManager.incrementAttempts();

        // Actualizar el contador de intentos visual
        this.scene.gameUI.updateAttemptsUI(
            this.stateManager.launchAttempts,
            this.stateManager.maxLaunchAttempts
        );

        // Usar el CharacterManager para lanzar el pingüino
        this.characterManager.launchPenguin(this.selectedAngle, this.selectedPower);

        // Cambiar inmediatamente al estado FLYING sin esperar a la animación
        this.stateManager.setState('FLYING');

        // Reiniciar distancia actual inmediatamente
        this.scene.scoreManager.resetCurrentDistance();
    }
}
