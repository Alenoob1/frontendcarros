import React, { useState } from "react";
const AnalizarImg: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null); 
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
          parsedResult = JSON.parse(parsedResult);
        } catch {
    
        }
      }

      setResultado(parsedResult);
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
      <button onClick={handleUpload} disabled={loading} style={{ marginLeft: "1rem" }}>
        {loading ? "Analizando..." : "Subir y Analizar"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {resultado && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Resultado</h3>
          <pre style={{ background: "#e8f0fe", padding: "1rem", borderRadius: "5px", overflowX: "auto", whiteSpace: "pre-wrap" }}>
            {JSON.stringify(resultado, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AnalizarImg;
