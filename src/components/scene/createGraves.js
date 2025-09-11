// src/components/scene/createGraves.js
import * as THREE from "three";

export function createGraves(textures) {
  const { graveColorTexture, graveARMTexture, graveNormalTexture } = textures;
  const graves = new THREE.Group();

  const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
  const graveMaterial = new THREE.MeshStandardMaterial({
    map: graveColorTexture,
    normalMap: graveNormalTexture,
    aoMap: graveARMTexture,
    roughnessMap: graveARMTexture,
    metalnessMap: graveARMTexture,
  });

  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 4;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;

    const grave = new THREE.Mesh(graveGeometry, graveMaterial);
    grave.position.set(x, Math.random() * 0.4, z);
    grave.rotation.set(
      (Math.random() - 0.5) * 0.4,
      (Math.random() - 0.5) * 0.4,
      (Math.random() - 0.5) * 0.4
    );
    grave.castShadow = true;
    grave.receiveShadow = true;
    graves.add(grave);
  }
  return graves;
}