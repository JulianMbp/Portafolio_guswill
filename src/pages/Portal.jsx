//src\pages\Portal.jsx
import { Canvas } from "@react-three/fiber";
import PortalEfects from "../components/PortalEfects";


const Portal = () => {
    return (
        <div style={{ padding: "2rem" }}>
            <div style={{ height: "600px" }}>
                <Canvas
                    flat
                    camera={{ fov: 45, near: 0.1, far: 50, position: [1, 2, 6] }}
                >
                    <PortalEfects />
                </Canvas>
            </div>
        </div>
    );
};

export default Portal;
