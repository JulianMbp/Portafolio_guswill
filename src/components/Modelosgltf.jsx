import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

const Modelosgltf = () => {
    const mountRef = useRef(null)

    useEffect(() => {
        // --- CONFIGURACIÓN BÁSICA ---
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        // Scene
        const scene = new THREE.Scene()

        // Camera
        const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
        camera.position.z = 3
        scene.add(camera)

        // Renderer
        const renderer = new THREE.WebGLRenderer()
        renderer.setSize(sizes.width, sizes.height)
        mountRef.current.appendChild(renderer.domElement)

        // --- BUCLE DE ANIMACIÓN Y RENDERIZADO ---
        const tick = () => {
            renderer.render(scene, camera)
            window.requestAnimationFrame(tick)
        }
        tick()

        // --- LIMPIEZA ---
        return () => {
            if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement)
            }
        }
    }, [])

    return <div ref={mountRef} />
}

export default Modelosgltf