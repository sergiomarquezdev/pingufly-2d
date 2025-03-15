import * as THREE from 'three';
import { POSITIONS, COLORS } from '../utils/constants.js';

export class YetiEntity {
  constructor(scene) {
    this.scene = scene;
    this.position = new THREE.Vector3(POSITIONS.YETI_X, POSITIONS.YETI_Y, POSITIONS.YETI_Z);

    // Estados de animación
    this.isHitting = false;
    this.animationTime = 0;
    this.hitDuration = 0.3; // Duración de la animación de golpe en segundos

    this.createYeti();
  }

  createYeti() {
    // Crear grupo para contener todas las partes del yeti
    this.yetiGroup = new THREE.Group();
    // Posicionar claramente frente a la montaña, no integrado
    this.yetiGroup.position.set(POSITIONS.YETI_X, POSITIONS.YETI_Y, POSITIONS.YETI_Z);

    // Orientar el Yeti para que mire hacia la montaña
    this.yetiGroup.rotation.y = -Math.PI / 12;

    // Crear el yeti con más detalles y apariencia más corpulenta
    this.createBody();
    this.createHead();
    this.createArms();
    this.createLegs();

    // Añadir el grupo a la escena
    this.scene.add(this.yetiGroup);
  }

  createBody() {
    // Cuerpo más corpulento del yeti
    const bodyGeometry = new THREE.CylinderGeometry(1.2, 1.0, 2.2, 12);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: COLORS.YETI });
    this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.body.position.y = 1.2;
    this.body.castShadow = true;

    // Añadir "pelaje" con una geometría adicional más irregular
    const furGeometry = new THREE.SphereGeometry(1.3, 16, 10);
    // Distorsionar para que parezca pelo
    const vertices = furGeometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i);
      const y = vertices.getY(i);
      const z = vertices.getZ(i);

      // Añadir irregularidad a los vértices para simular pelo
      vertices.setX(i, x + (Math.random() - 0.5) * 0.2);
      vertices.setY(i, y + (Math.random() - 0.5) * 0.2);
      vertices.setZ(i, z + (Math.random() - 0.5) * 0.2);
    }

    const furMaterial = new THREE.MeshLambertMaterial({
      color: COLORS.YETI,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    const fur = new THREE.Mesh(furGeometry, furMaterial);
    fur.scale.set(1, 1.1, 1);
    fur.position.y = 1.2;

    this.yetiGroup.add(this.body);
    this.yetiGroup.add(fur);

    // Añadir detalles al pelaje en la parte superior
    const topFurGeometry = new THREE.SphereGeometry(0.8, 12, 8);
    const topFur = new THREE.Mesh(topFurGeometry, furMaterial);
    topFur.position.set(0, 2.4, 0);
    topFur.scale.set(1.4, 0.5, 1.1);
    this.yetiGroup.add(topFur);
  }

  createHead() {
    // Cabeza del yeti más detallada
    const headGeometry = new THREE.SphereGeometry(0.9, 16, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ color: COLORS.YETI });
    this.head = new THREE.Mesh(headGeometry, headMaterial);
    this.head.position.y = 2.7;
    this.head.castShadow = true;

    // Ojos del yeti
    const eyeGeometry = new THREE.SphereGeometry(0.15, 10, 10);
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });

    this.leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    this.leftEye.position.set(-0.3, 2.8, 0.7);

    this.rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    this.rightEye.position.set(0.3, 2.8, 0.7);

    // Brillo de los ojos
    const highlightGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

    const leftHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    leftHighlight.position.set(-0.25, 2.85, 0.8);

    const rightHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    rightHighlight.position.set(0.35, 2.85, 0.8);

    // Boca
    const mouthGeometry = new THREE.SphereGeometry(0.5, 16, 4);
    mouthGeometry.scale(1.2, 0.4, 0.8);
    const mouthMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    this.mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    this.mouth.position.set(0, 2.4, 0.6);
    this.mouth.rotation.x = 0.2;

    // Añadir todas las partes al grupo
    this.yetiGroup.add(this.head);
    this.yetiGroup.add(this.leftEye);
    this.yetiGroup.add(this.rightEye);
    this.yetiGroup.add(leftHighlight);
    this.yetiGroup.add(rightHighlight);
    this.yetiGroup.add(this.mouth);

    // Añadir orejas
    const earGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    earGeometry.scale(0.7, 1.2, 0.5);

    const leftEar = new THREE.Mesh(earGeometry, headMaterial);
    leftEar.position.set(-0.8, 3.0, 0.1);
    leftEar.rotation.z = -Math.PI / 6;

    const rightEar = new THREE.Mesh(earGeometry, headMaterial);
    rightEar.position.set(0.8, 3.0, 0.1);
    rightEar.rotation.z = Math.PI / 6;

    this.yetiGroup.add(leftEar);
    this.yetiGroup.add(rightEar);
  }

  createArms() {
    // Brazos del yeti
    // Grupo para el brazo y el bate (para animación de golpe) - ahora en el lado derecho
    this.armGroup = new THREE.Group();
    this.armGroup.position.set(1.2, 2.2, 0); // Mover brazo al lado derecho

    // Brazo del yeti más grueso y más realista
    const armGeometry = new THREE.CylinderGeometry(0.25, 0.2, 1.6, 10);
    const armMaterial = new THREE.MeshLambertMaterial({ color: COLORS.YETI });
    this.arm = new THREE.Mesh(armGeometry, armMaterial);
    this.arm.rotateZ(Math.PI / 2); // Rotar para el lado derecho
    this.arm.position.x = 0.6; // Posición positiva para el lado derecho
    this.arm.castShadow = true;

    // Mano al final del brazo
    const handGeometry = new THREE.SphereGeometry(0.25, 10, 10);
    const hand = new THREE.Mesh(handGeometry, armMaterial);
    hand.position.set(1.3, 0, 0);
    this.arm.add(hand);

    // Bate del yeti más detallado
    const batGeometry = new THREE.CylinderGeometry(0.15, 0.2, 1.8, 8);
    const batMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    this.bat = new THREE.Mesh(batGeometry, batMaterial);
    this.bat.position.x = 1.7; // Posición positiva para el lado derecho

    // Añadir detalles del bate
    const handleGeometry = new THREE.CylinderGeometry(0.18, 0.18, 0.3, 8);
    const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = 0.8;
    this.bat.add(handle);

    // Añadir todo al grupo de brazo
    this.armGroup.add(this.arm);
    this.armGroup.add(this.bat);

    // Segundo brazo (no utilizado para golpear, solo visual)
    const arm2Geometry = new THREE.CylinderGeometry(0.25, 0.2, 1.5, 10);
    const arm2 = new THREE.Mesh(arm2Geometry, armMaterial);
    arm2.position.set(-1.0, 1.8, 0);
    arm2.rotation.z = Math.PI / 3; // Ligeramente levantado para el lado opuesto
    arm2.castShadow = true;

    // Mano para el segundo brazo
    const hand2Geometry = new THREE.SphereGeometry(0.25, 10, 10);
    const hand2 = new THREE.Mesh(hand2Geometry, armMaterial);
    hand2.position.set(0, -0.8, 0);
    arm2.add(hand2);

    // Posición inicial del brazo (levantado, listo para golpear)
    this.armGroup.rotation.z = -Math.PI / 4; // Cambiar para el lado derecho

    this.yetiGroup.add(this.armGroup);
    this.yetiGroup.add(arm2);
  }

  createLegs() {
    // Piernas del yeti
    const legGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.0, 10);
    const legMaterial = new THREE.MeshLambertMaterial({ color: COLORS.YETI });

    // Pierna izquierda
    this.leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    this.leftLeg.position.set(-0.5, 0.4, 0);
    this.leftLeg.castShadow = true;

    // Pie izquierdo
    const footGeometry = new THREE.SphereGeometry(0.45, 10, 10);
    footGeometry.scale(1.2, 0.5, 1.5);
    const footMaterial = new THREE.MeshLambertMaterial({ color: COLORS.YETI });
    const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
    leftFoot.position.set(-0.5, 0, 0.2);
    leftFoot.castShadow = true;

    // Pierna derecha
    this.rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    this.rightLeg.position.set(0.5, 0.4, 0);
    this.rightLeg.castShadow = true;

    // Pie derecho
    const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
    rightFoot.position.set(0.5, 0, 0.2);
    rightFoot.castShadow = true;

    this.yetiGroup.add(this.leftLeg);
    this.yetiGroup.add(leftFoot);
    this.yetiGroup.add(this.rightLeg);
    this.yetiGroup.add(rightFoot);

    // Añadir sombra en el suelo
    const shadowGeometry = new THREE.CircleGeometry(1.2, 16);
    const shadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });

    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.rotation.x = -Math.PI / 2; // Colocar horizontal
    shadow.position.y = POSITIONS.GROUND_Y + 0.01; // Justo por encima del suelo

    this.yetiGroup.add(shadow);
  }

  update(deltaTime) {
    // Manejar animación de golpe
    if (this.isHitting) {
      this.animationTime += deltaTime;

      // Calcular progreso de la animación (0 a 1)
      const progress = Math.min(this.animationTime / this.hitDuration, 1);

      // Animación de golpe: rotación del brazo de -45 grados a 45 grados (para lado derecho)
      this.armGroup.rotation.z = -Math.PI / 4 + (Math.PI / 2) * progress;

      // Añadir ligera rotación del cuerpo para un movimiento más natural
      this.yetiGroup.rotation.y = -Math.PI / 12 - 0.2 * progress; // Invertir para el lado derecho

      // Si la animación ha terminado, volver a la posición original
      if (progress >= 1) {
        this.isHitting = false;
        this.animationTime = 0;

        // Devolver el brazo a su posición original gradualmente
        this.resetArmPosition();
      }
    }
  }

  hit() {
    // Iniciar animación de golpe
    this.isHitting = true;
    this.animationTime = 0;
  }

  resetArmPosition() {
    // Establecer un timeout para devolver el brazo a su posición original después del golpe
    setTimeout(() => {
      this.armGroup.rotation.z = -Math.PI / 4; // Para el lado derecho
      this.yetiGroup.rotation.y = -Math.PI / 12; // Restaurar rotación del cuerpo
    }, 500);
  }

  reset() {
    // Reiniciar la posición y estado del yeti
    this.isHitting = false;
    this.animationTime = 0;
    this.armGroup.rotation.z = -Math.PI / 4; // Para el lado derecho
    this.yetiGroup.rotation.y = -Math.PI / 12;
    this.yetiGroup.position.set(POSITIONS.YETI_X, POSITIONS.YETI_Y, POSITIONS.YETI_Z);
  }

  getPosition() {
    return this.yetiGroup.position;
  }
}
