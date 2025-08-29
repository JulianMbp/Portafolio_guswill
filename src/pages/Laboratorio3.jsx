import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

function ChessPiece({ position, color }) {
	// Cubo vertical parado
	return (
		<mesh position={position} castShadow>
			<boxGeometry args={[0.5, 1, 0.5]} />
			<meshStandardMaterial color={color} />
		</mesh>
	);
}

function ChessBoard() {
	const boardRows = 8;
	const boardCols = 8;
	const squareSize = 1;
	const squares = [];
	const pieces = [];
	for (let row = 0; row < boardRows; row++) {
		for (let col = 0; col < boardCols; col++) {
			const x = col - 3.5;
			const y = 0.05;
			const z = row - 3.5;
			squares.push(
				<mesh
					key={`sq${row}${col}`}
					position={[x, y, z]}
					receiveShadow
				>
					<boxGeometry args={[squareSize, 0.1, squareSize]} />
					<meshStandardMaterial color={(row + col) % 2 === 0 ? "#fff" : "#222"} />
				</mesh>
			);
		}
	}
	for (let row = 0; row < 2; row++) {
		for (let col = 0; col < boardCols; col++) {
			const x = col - 3.5;
			const z = row - 3.5;
			pieces.push(
				<ChessPiece
					key={`w${row}${col}`}
					position={[x, 0.6, z]}
					color="#eee"
				/>
			);
		}
	}
	for (let row = 6; row < 8; row++) {
		for (let col = 0; col < boardCols; col++) {
			const x = col - 3.5;
			const z = row - 3.5;
			pieces.push(
				<ChessPiece
					key={`b${row}${col}`}
					position={[x, 0.6, z]}
					color="#222"
				/>
			);
		}
	}
	return (
		<Canvas
			shadows
			camera={{ position: [0, 10, 10], fov: 50 }}
			style={{ background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)" }}
		>
			<ambientLight intensity={0.7} />
			<directionalLight position={[5, 10, 10]} intensity={1} castShadow />
			{squares}
			{pieces}
			<OrbitControls />
		</Canvas>
	);
}

export default function Laboratorio3() {
	return (
		<div style={{ width: "100vw", height: "100vh" }}>
			<ChessBoard />
		</div>
	);
}
