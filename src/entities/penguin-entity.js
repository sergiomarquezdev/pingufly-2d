import * as THREE from 'three';
import { GAME_PHASES, PHYSICS, POSITIONS, COLORS } from '../utils/constants.js';

export class PenguinEntity {
  constructor(scene) {
    this.scene = scene;
    this.position = new THREE.Vector3(
      POSITIONS.PENGUIN_START_X,
      POSITIONS.PENGUIN_START_Y,
      POSITIONS.PENGUIN_START_Z
    );

    // Variables de estado
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Vector3(0, 0, 0);
    this.isFalling = false;
    this.isFlying = false;
    this.isInOptimalHitZone = false;
    this.initialPosition = this.position.clone();
    this.distanceTraveled = 0;
    this.isHighlighted = false;

    this.createPenguin();
  }

  createPenguin() {
    // Grupo para contener todas las partes del pingüino
    this.penguinGroup = new THREE.Group();
    this.penguinGroup.position.copy(this.position);

    // Pequeño ajuste de rotación para que parezca que está en la plataforma
    this.penguinGroup.rotation.set(0.1, 0, 0);

    // Cuerpo del pingüino (más detallado)
    const bodyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    bodyGeometry.scale(0.8, 1.2, 0.6);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: COLORS.PENGUIN_BODY });
    this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.body.position.y = 0.6;
    this.body.castShadow = true;

    // Barriga blanca del pingüino
    const bellyGeometry = new THREE.SphereGeometry(0.4, 16, 8);
    bellyGeometry.scale(0.7, 1.1, 0.4);
    const bellyMaterial = new THREE.MeshLambertMaterial({ color: COLORS.PENGUIN_BELLY });
    this.belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
    this.belly.position.set(0, 0.6, 0.2);

    // Cabeza del pingüino
    const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ color: COLORS.PENGUIN_BODY });
    this.head = new THREE.Mesh(headGeometry, headMaterial);
    this.head.position.y = 1.2;
    this.head.castShadow = true;

    // Pico
    const beakGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
    const beakMaterial = new THREE.MeshLambertMaterial({ color: COLORS.PENGUIN_BEAK });
    this.beak = new THREE.Mesh(beakGeometry, beakMaterial);
    this.beak.position.set(0, 1.2, 0.3);
    this.beak.rotation.x = Math.PI / 2;
    this.beak.castShadow = true;

    // Ojos
    const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });

    this.leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    this.leftEye.position.set(-0.15, 1.25, 0.25);

    this.rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    this.rightEye.position.set(0.15, 1.25, 0.25);

    // Pupilas
    const pupilGeometry = new THREE.SphereGeometry(0.025, 8, 8);
    const pupilMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });

    this.leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    this.leftPupil.position.set(-0.15, 1.25, 0.29);

    this.rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    this.rightPupil.position.set(0.15, 1.25, 0.29);

    // Alas
    const wingGeometry = new THREE.SphereGeometry(0.3, 16, 8);
    wingGeometry.scale(0.2, 0.7, 0.5);

    this.leftWing = new THREE.Mesh(wingGeometry, bodyMaterial);
    this.leftWing.position.set(-0.4, 0.6, 0);
    this.leftWing.rotation.z = Math.PI / 12;
    this.leftWing.castShadow = true;

    this.rightWing = new THREE.Mesh(wingGeometry, bodyMaterial);
    this.rightWing.position.set(0.4, 0.6, 0);
    this.rightWing.rotation.z = -Math.PI / 12;
    this.rightWing.castShadow = true;

    // Pies
    const footGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    footGeometry.scale(1.5, 0.4, 1);
    const footMaterial = new THREE.MeshLambertMaterial({ color: COLORS.PENGUIN_BEAK });

    this.leftFoot = new THREE.Mesh(footGeometry, footMaterial);
    this.leftFoot.position.set(-0.2, 0, 0.1);
    this.leftFoot.castShadow = true;

    this.rightFoot = new THREE.Mesh(footGeometry, footMaterial);
    this.rightFoot.position.set(0.2, 0, 0.1);
    this.rightFoot.castShadow = true;

    // Añadir todas las partes al grupo
    this.penguinGroup.add(this.body);
    this.penguinGroup.add(this.belly);
    this.penguinGroup.add(this.head);
    this.penguinGroup.add(this.beak);
    this.penguinGroup.add(this.leftEye);
    this.penguinGroup.add(this.rightEye);
    this.penguinGroup.add(this.leftPupil);
    this.penguinGroup.add(this.rightPupil);
    this.penguinGroup.add(this.leftWing);
    this.penguinGroup.add(this.rightWing);
    this.penguinGroup.add(this.leftFoot);
    this.penguinGroup.add(this.rightFoot);

    // Añadir el grupo a la escena
    this.scene.add(this.penguinGroup);
  }

  update(deltaTime) {
    if (this.isFalling) {
      // Aplicar gravedad mientras cae
      this.velocity.y -= PHYSICS.GRAVITY * deltaTime;

      // Actualizar posición
      this.position.y += this.velocity.y * deltaTime;

      // Verificar si ha llegado al punto de golpeo
      if (this.position.y <= this.initialPosition.y - 6) {
        this.isInOptimalHitZone = true;

        // Añadir un pequeño movimiento de "vibrando" para indicar el momento óptimo
        if (!this.isHighlighted) {
          this.isHighlighted = true;
          this.highlightForOptimalHit();
        }
      } else {
        this.isInOptimalHitZone = false;
        this.isHighlighted = false;
      }

      // Actualizar posición del grupo
      this.penguinGroup.position.copy(this.position);

      // Ajustar rotación mientras cae para efecto de balanceo
      const fallProgress = Math.min(1, (this.initialPosition.y - this.position.y) / 8);
      this.penguinGroup.rotation.z = Math.sin(this.position.y * 5) * 0.05;
      this.penguinGroup.rotation.x = 0.1 + fallProgress * 0.2;
    }

    if (this.isFlying) {
      // Aplicar física durante el vuelo
      // Gravedad
      this.velocity.y -= PHYSICS.GRAVITY * deltaTime;

      // Resistencia del aire
      this.velocity.multiplyScalar(PHYSICS.AIR_RESISTANCE);

      // Actualizar posición
      this.position.x += this.velocity.x * deltaTime;
      this.position.y += this.velocity.y * deltaTime;
      this.position.z += this.velocity.z * deltaTime;

      // Actualizar rotación - mejorada para un efecto más fluido
      // Hacer que el pingüino gire en base a su dirección de movimiento
      const horizontalSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
      const targetRotationX = Math.atan2(this.velocity.y, horizontalSpeed) * 0.7;

      // Suavizar la rotación
      this.rotation.x += (targetRotationX - this.rotation.x) * 0.1;

      // Añadir rotación sobre el eje Z para efecto de giro en el aire
      this.rotation.z += this.velocity.x * 0.005;

      // Limitar rotación para que parezca un poco más natural
      this.rotation.x = Math.max(-Math.PI / 1.5, Math.min(Math.PI / 1.5, this.rotation.x));
      this.rotation.z = Math.max(-Math.PI, Math.min(Math.PI, this.rotation.z));

      // Aplicar rotación al grupo
      this.penguinGroup.rotation.x = this.rotation.x;
      this.penguinGroup.rotation.z = this.rotation.z;

      // Verificar si ha tocado el suelo
      if (this.position.y <= POSITIONS.GROUND_Y + 0.5) {
        this.position.y = POSITIONS.GROUND_Y + 0.5;

        // Rebotar ligeramente al tocar el suelo
        if (Math.abs(this.velocity.y) > 0.5) {
          this.velocity.y = -this.velocity.y * 0.3;
          this.velocity.x *= PHYSICS.GROUND_FRICTION;
          this.velocity.z *= PHYSICS.GROUND_FRICTION;

          // Añadir pequeña rotación al rebotar
          this.rotation.z += this.velocity.x * 0.01;
        } else {
          // Si la velocidad vertical es baja, detener el rebote
          this.velocity.y = 0;

          // Aplicar fricción en el suelo
          this.velocity.x *= PHYSICS.GROUND_FRICTION;
          this.velocity.z *= PHYSICS.GROUND_FRICTION;
        }
      }

      // Actualizar la distancia recorrida (tomando valor absoluto ya que va hacia la izquierda)
      this.distanceTraveled = Math.abs(this.position.x - this.initialPosition.x);

      // Actualizar posición del grupo
      this.penguinGroup.position.copy(this.position);

      // Si está deslizándose por el suelo y casi se detiene, hacer que se ponga derecho
      if (this.hasSlowedDown() && this.position.y <= POSITIONS.GROUND_Y + 0.7) {
        // Restaurar gradualmente la rotación a posición normal
        this.penguinGroup.rotation.x *= 0.95;
        this.penguinGroup.rotation.z *= 0.95;
      }
    }
  }

  hasSlowedDown() {
    return Math.abs(this.velocity.x) < PHYSICS.PENGUIN_STOPPING_THRESHOLD * 5 &&
           Math.abs(this.velocity.y) < PHYSICS.PENGUIN_STOPPING_THRESHOLD * 5;
  }

  startFalling() {
    this.isFalling = true;
    this.velocity.set(0, 0, 0);
    this.isHighlighted = false;
  }

  isInHitZone() {
    return this.isInOptimalHitZone;
  }

  getHitQuality() {
    // Calidad del golpe entre 0 y 1 dependiendo de la cercanía a la zona óptima
    if (!this.isInOptimalHitZone) {
      return 0.2; // Golpe débil fuera de la zona óptima
    }

    return 0.8; // Golpe potente en la zona óptima
  }

  highlightForOptimalHit() {
    // Efecto visual para indicar zona óptima de golpeo
    // Hacer que las alas se muevan ligeramente para indicar posición óptima
    const originalLeftWingRotation = this.leftWing.rotation.z;
    const originalRightWingRotation = this.rightWing.rotation.z;

    // Animar alas
    const animateWings = () => {
      this.leftWing.rotation.z = originalLeftWingRotation + Math.sin(Date.now() * 0.01) * 0.2;
      this.rightWing.rotation.z = originalRightWingRotation + Math.sin(Date.now() * 0.01) * 0.2;

      if (this.isInOptimalHitZone) {
        requestAnimationFrame(animateWings);
      } else {
        // Restaurar rotación original
        this.leftWing.rotation.z = originalLeftWingRotation;
        this.rightWing.rotation.z = originalRightWingRotation;
      }
    };

    animateWings();
  }

  launch(hitQuality) {
    this.isFalling = false;
    this.isFlying = true;

    // Calcular fuerza del lanzamiento en base a la calidad del golpe
    const baseForce = PHYSICS.MIN_LAUNCH_FORCE +
      (PHYSICS.MAX_LAUNCH_FORCE - PHYSICS.MIN_LAUNCH_FORCE) * hitQuality;

    // Lanzamiento hacia la izquierda
    this.velocity.set(-baseForce, baseForce * 0.7, 0);

    // Añadir un poco de rotación
    this.rotation.z = -Math.PI / 4; // Rotación para vuelo hacia la izquierda
  }

  miss() {
    // El yeti no golpeó bien al pingüino, simplemente dejarlo caer
    this.isFalling = false;
    this.isFlying = false;
    this.velocity.set(0, 0, 0);
  }

  hasStoppedMoving() {
    // Verificar si el pingüino ha dejado de moverse
    return this.isFlying &&
      Math.abs(this.velocity.x) < PHYSICS.PENGUIN_STOPPING_THRESHOLD &&
      Math.abs(this.velocity.y) < PHYSICS.PENGUIN_STOPPING_THRESHOLD &&
      this.position.y <= POSITIONS.GROUND_Y + 0.5;
  }

  getPosition() {
    return this.position;
  }

  getDistanceTraveled() {
    return this.distanceTraveled;
  }

  reset() {
    // Reiniciar el pingüino a su estado inicial
    this.position.copy(this.initialPosition);
    this.velocity.set(0, 0, 0);
    this.rotation.set(0, 0, 0);
    this.penguinGroup.position.copy(this.position);
    this.penguinGroup.rotation.set(0.1, 0, 0); // Pequeña inclinación para que se vea en la plataforma
    this.isFalling = false;
    this.isFlying = false;
    this.isInOptimalHitZone = false;
    this.isHighlighted = false;
    this.distanceTraveled = 0;
  }
}
