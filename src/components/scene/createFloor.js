// src/components/scene/createFloor.js
import * as THREE from "three";

export function createFloor(textures) {
  const {
    floorAlphaTexture,
    floorColorTexture,
    floorARMTexture,
    floorNormalTexture,
    floorDisplacementTexture,
  } = textures;

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 100, 100),
    new THREE.MeshStandardMaterial({
      alphaMap: floorAlphaTexture,
      transparent: true,
      map: floorColorTexture,
      aoMap: floorARMTexture,
      roughnessMap: floorARMTexture,
      metalnessMap: floorARMTexture,
      normalMap: floorNormalTexture,
      displacementMap: floorDisplacementTexture,
      displacementScale: 0.3,
      displacementBias: -0.2,
    })
  );

  floor.rotation.x = -Math.PI * 0.5;
  floor.receiveShadow = true; 

  return floor;
}