//src\components\PortalEfects.jsx
import { useGLTF, OrbitControls } from '@react-three/drei'

export default function PortalEfects() {
    const { nodes } = useGLTF('./models/portal.glb')
    console.log(nodes)
    return <>

        <OrbitControls makeDefault />
        <color args={['#030202']} attach="background" />
        <mesh scale={1.5}>
            <boxGeometry />
            <meshNormalMaterial />
        </mesh>

    </>
}