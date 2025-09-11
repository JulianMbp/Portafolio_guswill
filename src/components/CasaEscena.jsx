// src/components/CasaEscena.jsx
import { useEffect, useRef, useState, useCallback } from "react"; // --- NUEVO: Se añade useCallback
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Timer } from "three/addons/misc/Timer.js";
import { Sky } from "three/addons/objects/Sky.js";

// componentes separados
import { createFloor } from "./scene/createFloor";
import { createHouse } from "./scene/createHouse";
import { createGraves } from "./scene/createGraves";

const CasaEscena = () => {
  const canvasRef = useRef();

  // Estados para controlar la escena 3D
  const [verGeometria, setVerGeometria] = useState(true);
  const [mostrarTexturas, setMostrarTexturas] = useState(false);
  const [activarLuces, setActivarLuces] = useState(false);
  const [activarFantasmas, setActivarFantasmas] = useState(false);
  const [mostrarEntorno, setMostrarEntorno] = useState(false);

  // Estados y Refs para el panel de controles UI
  const [isMinimized, setIsMinimized] = useState(false); 
  const [panelPosition, setPanelPosition] = useState({ x: 20, y: 120 });
  const dragInfo = useRef({ isDragging: false, offsetX: 0, offsetY: 0 });
  
  const sceneObjects = useRef({});

  // useEffect principal para montar la escena (sin cambios)
  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const { current: objects } = sceneObjects;
    objects.scene = scene;
    const textureLoader = new THREE.TextureLoader();
    const textures = {
      floorAlphaTexture: textureLoader.load("./floor/alpha.webp"),
      floorColorTexture: textureLoader.load("./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.webp"),
      floorARMTexture: textureLoader.load("./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.webp"),
      floorNormalTexture: textureLoader.load("./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.webp"),
      floorDisplacementTexture: textureLoader.load("./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.webp"),
      wallColorTexture: textureLoader.load("./wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.webp"),
      wallARMTexture: textureLoader.load("./wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.webp"),
      wallNormalTexture: textureLoader.load("./wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.webp"),
      roofColorTexture: textureLoader.load("./roof/roof_slates_02_1k/roof_slates_02_diff_1k.webp"),
      roofARMTexture: textureLoader.load("./roof/roof_slates_02_1k/roof_slates_02_arm_1k.webp"),
      roofNormalTexture: textureLoader.load("./roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.webp"),
      bushColorTexture: textureLoader.load("./bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.webp"),
      bushARMTexture: textureLoader.load("./bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.webp"),
      bushNormalTexture: textureLoader.load("./bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.webp"),
      graveColorTexture: textureLoader.load("./grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.webp"),
      graveARMTexture: textureLoader.load("./grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.webp"),
      graveNormalTexture: textureLoader.load("./grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.webp"),
      doorColorTexture: textureLoader.load("./door/color.webp"),
      doorAlphaTexture: textureLoader.load("./door/alpha.webp"),
      doorAmbientOcclusionTexture: textureLoader.load("./door/ambientOcclusion.webp"),
      doorHeightTexture: textureLoader.load("./door/height.webp"),
      doorNormalTexture: textureLoader.load("./door/normal.webp"),
      doorMetalnessTexture: textureLoader.load("./door/metalness.webp"),
      doorRoughnessTexture: textureLoader.load("./door/roughness.webp"),
    };
    objects.floor = createFloor(textures);
    objects.house = createHouse(textures);
    objects.graves = createGraves(textures);
    objects.ambientLight = new THREE.AmbientLight("#86cdff", 0.275);
    objects.directionalLight = new THREE.DirectionalLight("#86cdff", 1);
    objects.directionalLight.position.set(3, 2, -8);
    objects.doorLight = new THREE.PointLight("#ff7d46", 5);
    objects.doorLight.position.set(0, 2.2, 2.5);
    objects.house.add(objects.doorLight);
    objects.ghost1 = new THREE.PointLight("#8800ff", 6);
    objects.ghost2 = new THREE.PointLight("#ff0088", 6);
    objects.ghost3 = new THREE.PointLight("#ff0000", 6);
    objects.sky = new Sky();
    objects.sky.scale.set(100, 100, 100);
    scene.fog = new THREE.FogExp2("#04343f", 0.1);
    scene.add(
      objects.floor, objects.house, objects.graves, objects.ambientLight, 
      objects.directionalLight, objects.ghost1, objects.ghost2, objects.ghost3, objects.sky
    );
    const sizes = { width: window.innerWidth, height: window.innerHeight };
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
    camera.position.set(4, 2, 5);
    scene.add(camera);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    objects.renderer = renderer;
    const handleResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", handleResize);
    const timer = new Timer();
    const tick = () => {
      timer.update();
      const elapsedTime = timer.getElapsed();
      const ghost1Angle = elapsedTime * 0.5;
      objects.ghost1.position.x = Math.cos(ghost1Angle) * 4;
      objects.ghost1.position.z = Math.sin(ghost1Angle) * 4;
      objects.ghost1.position.y = Math.sin(ghost1Angle) * Math.sin(ghost1Angle * 2.34) * Math.sin(ghost1Angle * 3.45);
      const ghost2Angle = -elapsedTime * 0.38;
      objects.ghost2.position.x = Math.cos(ghost2Angle) * 5;
      objects.ghost2.position.z = Math.sin(ghost2Angle) * 5;
      objects.ghost2.position.y = Math.sin(ghost2Angle) * Math.sin(ghost2Angle * 2.34) * Math.sin(ghost2Angle * 3.45);
      const ghost3Angle = elapsedTime * 0.23;
      objects.ghost3.position.x = Math.cos(ghost3Angle) * 6;
      objects.ghost3.position.z = Math.sin(ghost3Angle) * 6;
      objects.ghost3.position.y = Math.sin(ghost3Angle) * Math.sin(ghost3Angle * 2.34) * Math.sin(ghost3Angle * 3.45);
      controls.update();
      renderer.render(scene, camera);
      window.requestAnimationFrame(tick);
    };
    tick();
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  // useEffects para reaccionar a los cambios de estado---
  useEffect(() => {
    const { house, floor, graves } = sceneObjects.current;
    if (!house) return;
    const basicMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, wireframe: verGeometria });
    [house, floor, graves].forEach(group => {
      group.traverse((child) => {
        if (child.isMesh) {
          if (!child.userData.finalMaterial) child.userData.finalMaterial = child.material;
          child.material = mostrarTexturas ? child.userData.finalMaterial : basicMaterial;
        }
      });
    });
  }, [mostrarTexturas, verGeometria]);
  useEffect(() => {
    const { ambientLight, directionalLight, doorLight } = sceneObjects.current;
    if (!ambientLight) return;
    ambientLight.intensity = activarLuces ? 0.275 : 0.1;
    directionalLight.intensity = activarLuces ? 1 : 0;
    doorLight.intensity = activarLuces ? 5 : 0;
  }, [activarLuces]);
  useEffect(() => {
    const { ghost1, ghost2, ghost3 } = sceneObjects.current;
    if (!ghost1) return;
    ghost1.visible = activarFantasmas;
    ghost2.visible = activarFantasmas;
    ghost3.visible = activarFantasmas;
  }, [activarFantasmas]);
  useEffect(() => {
    const { scene, sky } = sceneObjects.current;
    if (!scene || !sky) return;
    sky.visible = mostrarEntorno;
    scene.fog = mostrarEntorno ? new THREE.FogExp2("#04343f", 0.1) : null;
  }, [mostrarEntorno]);

  // Lógica para hacer el panel arrastrable

  const handleMouseDown = (e) => {
    dragInfo.current.isDragging = true;
    // Calcula el desfase entre el clic y la esquina superior izquierda del panel
    dragInfo.current.offsetX = e.clientX - panelPosition.x;
    dragInfo.current.offsetY = e.clientY - panelPosition.y;
  };

  const handleMouseMove = useCallback((e) => {
    if (dragInfo.current.isDragging) {
      const newX = e.clientX - dragInfo.current.offsetX;
      const newY = e.clientY - dragInfo.current.offsetY;
      setPanelPosition({ x: newX, y: newY });
    }
  }, []); // useCallback para optimización

  const handleMouseUp = useCallback(() => {
    dragInfo.current.isDragging = false;
  }, []);

  // useEffect para añadir y quitar listeners globales
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div>
      <div 
        style={{ 
          position: 'absolute', 
          top: `${panelPosition.y}px`, 
          left: `${panelPosition.x}px`, 
          color: 'white', 
          background: 'rgba(0,0,0,0.7)', 
          padding: '10px', 
          borderRadius: '8px', 
          zIndex: 1, 
          fontFamily: 'sans-serif',
          width: '220px'
        }}
      >
        <div 
          onMouseDown={handleMouseDown}
          style={{ 
            cursor: 'move', 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: isMinimized ? '0' : '5px',
            borderBottom: isMinimized ? 'none' : '1px solid white'
          }}
        >
          <h3 style={{marginTop: 0, marginBottom: '5px' }}>Controles de Escena</h3>
          <span 
            onClick={() => setIsMinimized(!isMinimized)}
            style={{ cursor: 'pointer', fontSize: '1.2em', userSelect: 'none' }}
          >
            {isMinimized ? '[+]' : '[-]'}
          </span>
        </div>
        
        {!isMinimized && (
          <div style={{ paddingTop: '10px' }}>
            <div><label><input type="checkbox" checked={verGeometria} onChange={(e) => setVerGeometria(e.target.checked)} /> Ver Wireframe</label></div>
            <div><label><input type="checkbox" checked={mostrarTexturas} onChange={(e) => setMostrarTexturas(e.target.checked)} /> Mostrar Texturas</label></div>
            <div><label><input type="checkbox" checked={activarLuces} onChange={(e) => setActivarLuces(e.target.checked)} /> Activar Luces</label></div>
            <div><label><input type="checkbox" checked={activarFantasmas} onChange={(e) => setActivarFantasmas(e.target.checked)} /> Activar Fantasmas</label></div>
            <div><label><input type="checkbox" checked={mostrarEntorno} onChange={(e) => setMostrarEntorno(e.target.checked)} /> Mostrar Entorno</label></div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="webgl"></canvas>
    </div>
  );
};

export default CasaEscena;