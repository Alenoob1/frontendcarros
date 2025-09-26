import React, { useState } from "react";

const AnalizarImg: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [resultadoCrudo, setResultadoCrudo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor selecciona una imagen.");
      return;
    }
    setLoading(true);
    setError(null);
    setResultado(null);
    setResultadoCrudo(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "https://localhost:44370/api/Vehiculo/upload-image",
        { method: "POST", body: formData }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detalle || `Error HTTP ${response.status}`);
      }

      let parsedResult = data.resultado;

      if (typeof parsedResult === "string") {
        try {
          // limpiar ```json y ``` que mete el backend
          const limpio = parsedResult.replace(/```json|```/g, "").trim();
          parsedResult = JSON.parse(limpio);
          setResultado(parsedResult);
        } catch (err) {
          console.error("Error al parsear JSON:", err);
          setResultadoCrudo(parsedResult); // mostrar como texto si falla
        }
      } else {
        setResultado(parsedResult);
      }
    } catch (err) {
      console.error(err);
      setError("Error al analizar la imagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Analizar Imagen de Vehículo</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        disabled={loading}
        style={{ marginLeft: "1rem" }}
      >
        {loading ? "Analizando..." : "Subir y Analizar"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {resultado && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1.5rem",
            borderRadius: "12px",
            background: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            maxWidth: "400px",
          }}
        >
          <h3 style={{ marginBottom: "1rem", color: "#2563eb" }}>
            🚗 Detalles del Vehículo
          </h3>
          <p>
            <strong>Marca:</strong> {resultado.marca}
          </p>
          <p>
            <strong>Modelo:</strong> {resultado.modelo}
          </p>
          <p>
            <strong>Color:</strong> {resultado.color}
          </p>

          {resultado.caracteristicas && (
            <>
              <h4 style={{ marginTop: "1rem" }}>Características:</h4>
              <ul>
                {resultado.caracteristicas.map((c: string, i: number) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {resultadoCrudo && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Resultado (JSON crudo)</h3>
          <pre
            style={{
              background: "#e8f0fe",
              padding: "1rem",
              borderRadius: "5px",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {resultadoCrudo}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AnalizarImg;
