import * as CANNON from 'cannon-es';
import GUI from 'lil-gui';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Componente principal que monta una escena THREE + motor físico cannon-es
const EscenarioCannon = () => {
    // ref al contenedor DOM donde se incrustará el canvas del renderer
    const mountRef = useRef(null);

    useEffect(() => {
        // Si el ref no está disponible, salir
        if (!mountRef.current) return;
        // Guardamos una copia local del mount para usar en el cleanup (evita problemas si cambia la ref)
        const currentMount = mountRef.current;

    // Creamos la GUI (lil-gui) y un objeto para exponer controles
    const gui = new GUI();
    const debugObject = {};
    // valores por defecto para parámetros ajustables
    debugObject.impulseStrength = 1.4; // fuerza para iniciar la cadena
    debugObject.particleSize = 0.015; // tamaño de las partículas

    // ...existing code...
        // === SCENE (THREE) ===
        // Creamos la escena donde añadiremos meshes y luces
        const scene = new THREE.Scene();

        // === SONIDO DE IMPACTO ===
        // Preparamos un audio simple para reproducir cuando haya colisiones fuertes
        const hitSound = new Audio('/sounds/hit.mp3');
        // Función que reproduce sonido según la fuerza del impacto
        const playHitSound = (collision) => {
            // impactStrength: magnitud del impacto a lo largo de la normal del contacto
            const impactStrength = collision.contact.getImpactVelocityAlongNormal();
            // Si la fuerza excede un umbral, reproducir sonido
            if (impactStrength > 1.5) {
                hitSound.volume = Math.random(); // volumen aleatorio para variar
                hitSound.currentTime = 0; // reiniciar sonido si estaba reproduciéndose
                hitSound.play();
            }
        };

        // === MAPA DE ENTORNO ===
        // Cargamos un environment map (cubo) para mejorar materiales
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        const environmentMapTexture = cubeTextureLoader.load([
            '/textures/environmentMaps/0/px.png',
            '/textures/environmentMaps/0/nx.png',
            '/textures/environmentMaps/0/py.png',
            '/textures/environmentMaps/0/ny.png',
            '/textures/environmentMaps/0/pz.png',
            '/textures/environmentMaps/0/nz.png'
        ]);
        // Asignamos textura de entorno como background y environment (iluminación PBR)
        scene.background = environmentMapTexture;
        scene.environment = environmentMapTexture;

        // === MUNDO FÍSICO (CANNON) ===
        const world = new CANNON.World();
        // SAPBroadphase para mejores resultados cuando hay muchos cuerpos estáticos
        world.broadphase = new CANNON.SAPBroadphase(world);
        world.allowSleep = true; // habilitar sleep para mejorar rendimiento
        world.gravity.set(0, -9.82, 0); // gravedad estándar

        // Material físico por defecto y contacto
        const defaultMaterial = new CANNON.Material('default');
        const defaultContactMaterial = new CANNON.ContactMaterial(
            defaultMaterial,
            defaultMaterial,
            { friction: 0.01, restitution: 0.6 } // fricción y restitución por defecto
        );
        world.addContactMaterial(defaultContactMaterial);
        world.defaultContactMaterial = defaultContactMaterial;

        // Exponemos parámetros físicos en la GUI para poder ajustarlos en tiempo real
        debugObject.friction = defaultContactMaterial.friction;
        debugObject.restitution = defaultContactMaterial.restitution;
        gui.add(debugObject, 'friction').min(0).max(1).step(0.01).name('Fricción').onChange((v) => {
            // actualizar fricción del contact material al mover el slider
            defaultContactMaterial.friction = v;
        });
        gui.add(debugObject, 'restitution').min(0).max(1).step(0.01).name('Rebote').onChange((v) => {
            // actualizar restitución (bounciness)
            defaultContactMaterial.restitution = v;
        });
        // controles para la fuerza del impulso y el tamaño de partículas
        gui.add(debugObject, 'impulseStrength').min(0).max(5).step(0.1).name('Impulso');
        gui.add(debugObject, 'particleSize').min(0.005).max(0.05).step(0.005).name('Tamaño Part.');

        // === SUELO FÍSICO ===
        // Plane en cannon (cuerpo inmóvil)
        const floorShape = new CANNON.Plane();
        const floorBody = new CANNON.Body({ mass: 0 }); // masa 0 => objeto estático
        floorBody.addShape(floorShape);
        // Rotamos el plano para que quede horizontal (cannon usa X,Y,Z distintos)
        floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
        world.addBody(floorBody);

        // === SUELO VISUAL (THREE) ===
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10),
            new THREE.MeshStandardMaterial({ color: '#777777', metalness: 0.6, roughness: 0.3, envMapIntensity: 1 })
        );
        floor.receiveShadow = true; // recibe sombras
        floor.rotation.x = -Math.PI * 0.5; // rotamos para coincidir con el plano físico
        scene.add(floor);

        // === LUCES ===
        const ambientLight = new THREE.AmbientLight(0xffffff, 2.1);
        scene.add(ambientLight);
        // Exponemos intensidad de luz ambiental en la GUI
        gui.add(ambientLight, 'intensity').min(0).max(3).step(0.1).name('Amb. Light');

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.castShadow = true; // emite sombras
        directionalLight.shadow.mapSize.set(1024, 1024);
        directionalLight.shadow.camera.far = 15;
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // === CÁMARA ===
        const sizes = { width: window.innerWidth, height: window.innerHeight };
        const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
        camera.position.set(-3, 3, 3); // posición inicial de cámara
        scene.add(camera);

        // === RENDERER ===
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.shadowMap.enabled = true; // habilitar sombras
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        // añadimos el canvas al contenedor del componente (usamos currentMount guardado arriba)
        currentMount.appendChild(renderer.domElement);

        // Controles de órbita para poder mover la cámara con el ratón
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // suavizado

        // Manejo del resize de ventana: actualiza cámara y renderer
        const handleResize = () => {
            sizes.width = window.innerWidth;
            sizes.height = window.innerHeight;
            camera.aspect = sizes.width / sizes.height;
            camera.updateProjectionMatrix();
            renderer.setSize(sizes.width, sizes.height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        };
        window.addEventListener('resize', handleResize);

        // === OBJETOS DINÁMICOS Y PARTICULAS ===
        // Lista de objetos (mesh + body) para sincronizar en el loop
        const objectsToUpdate = [];
        // Sistema de partículas optimizado: pool de meshes reutilizables
        const particles = []; // lista de partículas activas
        const particlePool = [];
        const particleMaterials = {}; // cache de materiales por color
        const MAX_PARTICLES = 300;
        // Geometría base (unit) para las partículas; el tamaño se ajusta por escala
        const baseParticleGeometry = new THREE.SphereGeometry(1, 6, 6);
        // Material por defecto usado si no hay color cacheado
        const defaultParticleMaterial = new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            emissive: 0xffaa00,
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 1,
            metalness: 0.1,
            roughness: 0.4
        });
        // Inicializar pool
        for (let i = 0; i < MAX_PARTICLES; i++) {
            const m = new THREE.Mesh(baseParticleGeometry, defaultParticleMaterial);
            m.visible = false;
            m.castShadow = false;
            m.receiveShadow = false;
            scene.add(m);
            particlePool.push(m);
        }

        const getMaterialForColor = (hex) => {
            const key = hex.toString(16);
            if (particleMaterials[key]) return particleMaterials[key];
            const mat = defaultParticleMaterial.clone();
            mat.color.setHex(hex);
            mat.emissive.setHex(hex);
            particleMaterials[key] = mat;
            return mat;
        };

        // Función auxiliar: crea una partícula visual en una posición, con color opcional
    // Añadimos lifetime para controlar cuánto tiempo permanece la partícula
    const addParticle = (position, color = 0xffaa00, lifetime = 0.8) => {
            if (particlePool.length === 0) return; // no hay más partículas disponibles en el pool
            const mesh = particlePool.pop();
            // asignar material adecuado por color (cacheado)
            mesh.material = getMaterialForColor(color);
            // tamaño controlable por GUI (usamos escala sobre la geometría unit)
            const size = typeof debugObject.particleSize === 'number' ? debugObject.particleSize : 0.015;
            mesh.scale.set(size, size, size);
            mesh.position.copy(position);
            mesh.visible = true;
            mesh.userData = {
                velocity: new THREE.Vector3((Math.random() - 0.5) * 0.6, Math.random() * 1 + 0.3, (Math.random() - 0.5) * 0.6),
                lifetime: lifetime,
                age: 0
            };
            particles.push(mesh);
        };

        // Crea varias partículas alrededor de un punto (emisor simple). Se puede especificar lifetime
        const spawnParticles = (point, count = 12, color = 0xffaa00, lifetime = 0.8) => {
            // limitar la cantidad para no agotar el pool y evitar lag
            const realCount = Math.min(count, particlePool.length);
            for (let i = 0; i < realCount; i++) {
                const jitter = new THREE.Vector3((Math.random() - 0.5) * 0.03, (Math.random() - 0.5) * 0.03, (Math.random() - 0.5) * 0.03);
                const pos = new THREE.Vector3(point.x + jitter.x, point.y + jitter.y, point.z + jitter.z);
                addParticle(pos, color, lifetime);
            }
        };

        // === GEOMETRÍAS Y CREADORES DE OBJETOS ===
        // Reutilizamos geometrías y materiales para eficiencia
        const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
        const sphereMaterial = new THREE.MeshStandardMaterial({ metalness: 0.7, roughness: 0.2, envMapIntensity: 1 });

        // Ahora createSphere acepta opciones: { emitParticles: boolean }
        const createSphere = (radius, position, options = {}) => {
            const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
            mesh.scale.set(radius, radius, radius);
            mesh.castShadow = true;
            mesh.position.copy(position);
            scene.add(mesh);

            const shape = new CANNON.Sphere(radius);
            const body = new CANNON.Body({
                mass: 1,
                position: new CANNON.Vec3(position.x, position.y, position.z),
                shape,
                material: defaultMaterial
            });
            body.position.copy(position);
            // Registrar flag en el body para saber si debe emitir partículas al colisionar
            body.userData = { emitParticles: options.emitParticles === true };
            body.addEventListener('collide', (e) => {
                playHitSound(e);
                // Si el objeto fue creado con emitParticles, generamos partículas y las mantenemos unos segundos
                if (body.userData && body.userData.emitParticles) {
                    // partículas más duraderas para objetos que caen
                    spawnParticles(body.position, Math.min(30, Math.floor(radius * 60)), 0x66ccff, 2.5);
                }
            });
            world.addBody(body);

            objectsToUpdate.push({ mesh, body });
        };

        const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
        const boxMaterial = new THREE.MeshStandardMaterial({ metalness: 0.7, roughness: 0.3, envMapIntensity: 1 });

        // createBox ahora acepta opciones: { emitParticles: boolean }
        const createBox = (width, height, depth, position, options = {}) => {
            const mesh = new THREE.Mesh(boxGeometry, boxMaterial);
            mesh.scale.set(width, height, depth);
            mesh.castShadow = true;
            mesh.position.copy(position);
            scene.add(mesh);

            const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
            const body = new CANNON.Body({
                mass: 1,
                position: new CANNON.Vec3(position.x, position.y, position.z),
                shape,
                material: defaultMaterial
            });
            body.position.copy(position);
            // Registrar flag en el body para saber si debe emitir partículas al colisionar
            body.userData = { emitParticles: options.emitParticles === true };
            body.addEventListener('collide', (e) => {
                playHitSound(e);
                if (body.userData && body.userData.emitParticles) {
                    spawnParticles(body.position, Math.min(30, Math.floor((width + height + depth) * 30)), 0xffaa00, 2.5);
                }
            });
            world.addBody(body);

            objectsToUpdate.push({ mesh, body });
        };

        /** GUI para crear objetos */
        debugObject.createSphere = () => {
            createSphere(0.5, { x: (Math.random() - 0.5) * 3, y: 3, z: (Math.random() - 0.5) * 3 });
        };

        debugObject.createBox = () => {
            createBox(
                Math.random() * 0.5 + 0.2,
                Math.random() * 0.5 + 0.2,
                Math.random() * 0.5 + 0.2,
                { x: (Math.random() - 0.5) * 3, y: 3, z: (Math.random() - 0.5) * 3 }
            );
        };

        gui.add(debugObject, 'createSphere').name('+ Crear Esfera');
        gui.add(debugObject, 'createBox').name('- Crear Caja');

        // --- Actividades físicas con cannon-es ---
        const createDominoWall = ({ count = 10, spacing = 0.12, startPos = { x: -1, y: 0, z: 0 } } = {}) => {
            // Dominós delgados y en posición para reposar sobre el plano (startPos.y = 0)
            // w = ancho (en X), h = altura (en Y), d = profundidad (en Z)
            const w = 0.12; // ancho delgado
            const h = 0.6;  // altura razonable
            const d = 0.2; // profundidad pequeña
            for (let i = 0; i < count; i++) {
                const x = startPos.x + i * (w + spacing);
                const y = startPos.y + h / 2; // colocar la base sobre el plano
                const z = startPos.z;
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), boxMaterial);
                mesh.scale.set(w, h, d);
                // No rotamos en Y: orientamos la cara delgada en Z y la anchura en X
                mesh.rotation.y = 0;
                // Marca visual para identificarlo en el raycast
                mesh.userData.isDomino = true;
                mesh.castShadow = true;
                mesh.position.set(x, y, z);
                scene.add(mesh);

                const shape = new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2));
                // Masa moderada para que caigan con facilidad pero tengan inercia
                const body = new CANNON.Body({ mass: 0.6, material: defaultMaterial });
                body.addShape(shape);
                // Posicionar el cuerpo para que su base toque el plano
                body.position.set(x, y, z);
                // Mantener estable al inicio: permitir sleep y algo de damping
                body.allowSleep = true;
                body.sleepSpeedLimit = 0.1;
                body.linearDamping = 0.01;
                body.angularDamping = 0.4;
                // Guardar altura para uso al aplicar impulso
                body.userData = Object.assign(body.userData || {}, { isDomino: true, dominoHeight: h });
                // Poner a dormir para que no caigan al crearse
                body.velocity.set(0, 0, 0);
                body.angularVelocity.set(0, 0, 0);
                body.sleep();
                body.addEventListener('collide', (e) => {
                    playHitSound(e);
                    // Partículas de dominó con mayor duración para que no desaparezcan tan rápido
                    spawnParticles(body.position, 12, 0xff66, 2.0);
                });
                world.addBody(body);
                objectsToUpdate.push({ mesh, body });
            }
        };

        const spawnFallingObjects = ({ count = 8, area = 1.8 } = {}) => {
            for (let i = 0; i < count; i++) {
                const x = (Math.random() - 0.5) * area;
                const y = 2 + Math.random() * 2;
                const z = (Math.random() - 0.5) * area;
                if (Math.random() > 0.5) {
                    // Estos objetos deben emitir partículas al colisionar y permanecer un tiempo
                    createBox(0.2 + Math.random() * 0.6, 0.2 + Math.random() * 0.6, 0.2 + Math.random() * 0.6, { x, y, z }, { emitParticles: true });
                } else {
                    createSphere(0.15 + Math.random() * 0.5, { x, y, z }, { emitParticles: true });
                }
            }
        };

        debugObject.activity1 = () => createDominoWall();
        debugObject.activity2 = () => spawnFallingObjects();
        // Botón para iniciar la cadena de dominós aplicando un pequeño golpe al primero
        debugObject.startChain = () => {
            const dominos = objectsToUpdate.filter(o => o.body && o.body.userData && o.body.userData.isDomino);
            if (dominos.length === 0) return;
            // Elegir el dominó con menor X (el primero en la fila)
            let first = dominos.reduce((a, b) => (a.body.position.x < b.body.position.x ? a : b));
            if (!first || !first.body) return;
            // Asegurar que esté despierto
            first.body.wakeUp();
            const h = first.body.userData && first.body.userData.dominoHeight ? first.body.userData.dominoHeight : 0.6;
            // Aplicar el impulso en la parte superior para generar torque
            const applicationPoint = new CANNON.Vec3(first.body.position.x, first.body.position.y + h / 2, first.body.position.z);
            const impulse = new CANNON.Vec3(1.4, 0, 0);
            first.body.applyImpulse(impulse, applicationPoint);
        };
        gui.add(debugObject, 'activity1').name('Actividad 1: Muro Dominó');
        gui.add(debugObject, 'activity2').name('Actividad 2: Objetos Caen');
        gui.add(debugObject, 'startChain').name('Iniciar Cadena');

        // CAMBIO: Se ha eliminado el cubo controlable y sus listeners para que no estorbe el muro de dominós

        // Raycaster para detectar clicks sobre mallas (iniciar el efecto dominó)
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        const onPointerDown = (event) => {
            // Normalizar coordenadas del pointer
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);
            if (intersects.length > 0) {
                // Buscar la primera malla que sea un domino
                const hit = intersects.find(i => i.object.userData && i.object.userData.isDomino);
                if (hit) {
                    const mesh = hit.object;
                    // Encontrar el objetoToUpdate que corresponde a esta malla
                    const found = objectsToUpdate.find(o => o.mesh === mesh || o.mesh === mesh.parent);
                    if (found && found.body) {
                        // Despertar el cuerpo y aplicar un impulso localizado en la parte superior
                        found.body.wakeUp();
                        const h = found.body.userData && found.body.userData.dominoHeight ? found.body.userData.dominoHeight : 0.6;
                        // Punto de aplicación: un poco arriba del centro para generar torque
                        const applicationPoint = new CANNON.Vec3(found.body.position.x, found.body.position.y + h / 2, found.body.position.z);
                        // Impulso hacia +X para que caiga hacia los demás (asumimos la fila en X creciente)
                        const impulse = new CANNON.Vec3(1.4, 0, 0);
                        found.body.applyImpulse(impulse, applicationPoint);
                        // Evitar aplicarlo repetidamente por varios clicks: quitar listener después de iniciar
                        window.removeEventListener('pointerdown', onPointerDown);
                    }
                }
            }
        };
        window.addEventListener('pointerdown', onPointerDown);

        /** Animación */
        const clock = new THREE.Clock();
        let oldElapsedTime = 0;

        let animationId;
        const tick = () => {
            const elapsedTime = clock.getElapsedTime();
            const deltaTime = elapsedTime - oldElapsedTime;
            oldElapsedTime = elapsedTime;

            world.step(1 / 60, deltaTime, 3);

            // CAMBIO: se removió la lógica del cubo controlable (player) para no interferir con el muro

            objectsToUpdate.forEach(object => {
                object.mesh.position.copy(object.body.position);
                object.mesh.quaternion.copy(object.body.quaternion);
            });

            // actualizar partículas (reutilizar desde el pool en lugar de eliminarlas)
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.userData.age += deltaTime;
                p.userData.velocity.y -= 9.82 * deltaTime * 0.6;
                p.position.addScaledVector(p.userData.velocity, deltaTime);
                const remaining = Math.max(0, 1 - p.userData.age / p.userData.lifetime);
                if (p.material && p.material.opacity !== undefined) p.material.opacity = remaining;
                if (p.userData.age >= p.userData.lifetime) {
                    // reciclar la partícula: ocultar, limpiar userData y devolver al pool
                    p.visible = false;
                    p.userData = {};
                    particles.splice(i, 1);
                    particlePool.push(p);
                }
            }

            controls.update();
            renderer.render(scene, camera);

            animationId = requestAnimationFrame(tick);
        };
        tick();

        /** Cleanup */
        return () => {
            gui.destroy();
            window.removeEventListener('resize', handleResize);
            if (animationId) cancelAnimationFrame(animationId);
            if (currentMount) currentMount.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} />;
};

export default EscenarioCannon;
