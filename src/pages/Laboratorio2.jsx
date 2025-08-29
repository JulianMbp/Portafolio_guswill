import { Environment, OrbitControls, useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
function Laboratorio2() {
  return (
    <Canvas className="position-absolute w-100 h-100" style={{ position: "fixed", width: "100vw", height: "100vh" }} camera={{ position: [10, 5, 10], fov: 40 }}>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 20, 5]} intensity={1.2} />
      <Environment preset="city" />
      <Lab2 />
      <OrbitControls enableRotate={true} />
    </Canvas>
  );
}

function Lab2() {
  // Cargar texturas
  // Nuevas texturas y alpha
  const texturaCubo = useTexture("/imagenes/wood.jpeg");
  const alphaCubo = useTexture("/imagenes/alpha leaves.png");
  const texturaEsfera = useTexture("/imagenes/Metal.jpeg");
  const alphaEsfera = useTexture("/imagenes/alphacloud.png");
  const texturaCilindro = useTexture("/imagenes/fabirc.jpg");
  const alphaCilindro = useTexture("/imagenes/alpha smoke.png");
  const texturaPlano = useTexture("/imagenes/leather.jpeg");
  const alphaPlano = useTexture("/imagenes/alphafire.png");

  return (
    <>
      {/* Cubo */}
      <mesh position={[-3, 1, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial
          map={texturaCubo}
          alphaMap={alphaCubo}
          transparent={true}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      {/* Esfera */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          map={texturaEsfera}
          alphaMap={alphaEsfera}
          transparent={true}
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>
      {/* Cilindro */}
      <mesh position={[3, 1, 0]}>
        <cylinderGeometry args={[1, 1, 2, 32]} />
        <meshStandardMaterial
          map={texturaCilindro}
          alphaMap={alphaCilindro}
          transparent={true}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>
      {/* Plano */}
      <mesh position={[0, 0, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial
          map={texturaPlano}
          alphaMap={alphaPlano}
          transparent={true}
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>
    </>
  );
}

export default Laboratorio2;
