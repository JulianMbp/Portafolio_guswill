// src/app/router.jsx
import Ejercicio1 from "./pages/Ejercicio1";
import Ejercicio2 from "./pages/Ejercicio2";
import Ejercicio3 from "./pages/Ejercicio3";
import Ejercicio4 from "./pages/Ejercicio4";
import Ejercicio5 from "./pages/Ejercicio5";
import Inicio from "./pages/Inicio";
import Laboratorio1 from "./pages/Laboratorio1";
import Laboratorio2 from "./pages/Laboratorio2";
import Luces from "./pages/Luces";


import Laboratorio3 from "./pages/Laboratorio3";

const routes = [
  { path: "/", element: <Inicio />, index: true },
  { path: "ejercicio1", element: <Ejercicio1 /> },
  { path: "ejercicio2", element: <Ejercicio2 /> },
  { path: "ejercicio3", element: <Ejercicio3 /> },
  { path: "ejercicio4", element: <Ejercicio4 /> },
  { path: "ejercicio5", element: <Ejercicio5 /> },
  { path: "luces", element: <Luces /> },
  { path: "laboratorio1", element: <Laboratorio1 /> },
  { path: "laboratorio2", element: <Laboratorio2 /> },
  { path: "laboratorio3", element: <Laboratorio3 /> }, // Laboratorio 3
];

export default routes;
