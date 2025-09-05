import SombrasEscena from "../components/SombrasEscena";

const Sombras = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          gap: "2rem",
        }}
      >
        {/* Columna izquierda: texto (más ancha) */}
        <div style={{ flex: 2, textAlign: "left" }}>
          <h3>Introducción a las Sombras</h3>
          <p style={{ lineHeight: "1.6", fontSize: "0.8rem" }}>
            Las sombras son un elemento esencial en escenas 3D porque aportan
            profundidad, realismo y contexto a los objetos. En Three.js, las
            sombras se generan a partir de la interacción entre luces y
            superficies, lo que permite percibir mejor la posición, tamaño y
            relación espacial de cada elemento en la escena. Comprender cómo se
            configuran y proyectan las sombras es clave para lograr entornos más
            creíbles y visualmente atractivos.
          </p>
        </div>

        {/* Columna derecha: canvas con GUI (más angosta) */}
        <div
          style={{
            flex: 1,
            height: "400px",
            border: "1px solid #ccc",
            position: "relative",
          }}
        >
          <SombrasEscena />
        </div>
      </div>
    </div>
  );
};

export default Sombras;
