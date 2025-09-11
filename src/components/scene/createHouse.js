// src/components/scene/createHouse.js
import * as THREE from "three";

export function createHouse(textures) {
  const house = new THREE.Group();

  // Texturas relevantes
  const {
    wallColorTexture, wallARMTexture, wallNormalTexture,
    roofColorTexture, roofARMTexture, roofNormalTexture,
    doorColorTexture, doorAlphaTexture, doorAmbientOcclusionTexture,
    doorHeightTexture, doorNormalTexture, doorMetalnessTexture, doorRoughnessTexture,
    bushColorTexture, bushARMTexture, bushNormalTexture,
  } = textures;

  // Paredes
  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial({
      map: wallColorTexture,
      aoMap: wallARMTexture,
      roughnessMap: wallARMTexture,
      metalnessMap: wallARMTexture,
      normalMap: wallNormalTexture,
    })
  );
  walls.position.y = 1.25;
  walls.castShadow = true;
  walls.receiveShadow = true;
  house.add(walls);

  // Techo
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1.5, 4),
    new THREE.MeshStandardMaterial({
      map: roofColorTexture,
      aoMap: roofARMTexture,
      roughnessMap: roofARMTexture,
      metalnessMap: roofARMTexture,
      normalMap: roofNormalTexture,
    })
  );
  roof.position.y = 2.5 + 0.75;
  roof.rotation.y = Math.PI * 0.25;
  roof.castShadow = true;
  house.add(roof);

  // Puerta
  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
    new THREE.MeshStandardMaterial({
      map: doorColorTexture,
      transparent: true,
      alphaMap: doorAlphaTexture,
      aoMap: doorAmbientOcclusionTexture,
      displacementMap: doorHeightTexture,
      displacementScale: 0.15,
      displacementBias: -0.04,
      normalMap: doorNormalTexture,
      metalnessMap: doorMetalnessTexture,
      roughnessMap: doorRoughnessTexture,
    })
  );
  door.position.set(0, 1, 2.01);
  house.add(door);

  // Arbustos
  const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
  const bushMaterial = new THREE.MeshStandardMaterial({
    color: "#ccffcc",
    map: bushColorTexture,
    aoMap: bushARMTexture,
    roughnessMap: bushARMTexture,
    metalnessMap: bushARMTexture,
    normalMap: bushNormalTexture,
  });

  const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
  bush1.scale.set(0.5, 0.5, 0.5);
  bush1.position.set(0.8, 0.2, 2.2);
  bush1.rotation.x = -0.75;

  const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
  bush2.scale.set(0.25, 0.25, 0.25);
  bush2.position.set(1.4, 0.1, 2.1);
  bush2.rotation.x = -0.75;
  // ... (crear bush3 y bush4...)
  house.add(bush1, bush2);

  return house;
}