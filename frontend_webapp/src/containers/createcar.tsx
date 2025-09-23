import React, { useState } from "react";

type ApiVehicle = {
  idvehiculo: number;
  marca: string;
  kilometraje: string; // la API actual lo maneja como string
  precio: number;      // number
};

type CreatePayload = {
  marca: string;
  kilometraje: string;
  precio: number;
};

type CreatedCarProps = {
  /** Se dispara al crear correctamente; útil para refrescar listados en el padre */
  onCreated?: (vehicle: ApiVehicle | null) => void;
};

const CreatedCar: React.FC<CreatedCarProps> = ({ onCreated }) => {
  const [form, setForm] = useState({
    marca: "",
    kilometraje: "",
    precio: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.marca.trim()) return "El nombre del vehículo (marca) es obligatorio.";
    if (form.precio.trim() === "" || Number.isNaN(Number(form.precio))) {
      return "El precio debe ser un número.";
    }
    // Kilometraje llega como string en tu API, pero validamos que parezca numérico
    if (form.kilometraje.trim() === "" || Number.isNaN(Number(form.kilometraje))) {
      return "El kilometraje debe ser un número.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOkMsg(null);

    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }

    const payload: CreatePayload = {
      marca: form.marca.trim(),
      kilometraje: form.kilometraje.trim(),
      precio: Number(form.precio),
    };

    try {
      setSubmitting(true);

      const res = await fetch("https://localhost:44370/api/Vehiculo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`No se pudo crear el vehículo (HTTP ${res.status}) ${t ? `- ${t}` : ""}`);
      }

      let created: ApiVehicle | null = null;
      try {
        created = (await res.json()) as ApiVehicle;
      } catch {
        // si la API no retorna JSON, seguimos igual
        created = null;
      }

      setOkMsg("Vehículo creado correctamente.");
      setForm({ marca: "", kilometraje: "", precio: "" });
      onCreated?.(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido al crear el vehículo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="featured-section">
      <div className="container">
        <div className="section-header">
          <h2>Crear Vehículo</h2>
          <p>Ingrese los datos del nuevo vehículo</p>
          {okMsg && <p className="success-msg">{okMsg}</p>}
          {error && <p className="error-msg">{error}</p>}
        </div>

        <form onSubmit={handleSubmit} className="vehicle-edit-form" style={{ maxWidth: 560 }}>
          <div className="form-row">
            <label htmlFor="marca">Nombre (Marca) *</label>
            <input
              id="marca"
              name="marca"
              value={form.marca}
              onChange={onChange}
              placeholder="Ej. Mazda"
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="kilometraje">Kilometraje *</label>
            <input
              id="kilometraje"
              name="kilometraje"
              value={form.kilometraje}
              onChange={onChange}
              placeholder="Ej. 140000"
              inputMode="numeric"
            />
          </div>

          <div className="form-row">
            <label htmlFor="precio">Precio (GTQ) *</label>
            <input
              id="precio"
              name="precio"
              value={form.precio}
              onChange={onChange}
              placeholder="Ej. 25000"
              type="number"
              step="0.01"
              min="0"
            />
          </div>

          <div className="actions" style={{ marginTop: 12 }}>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Creando…" : "Crear vehículo"}
            </button>
          </div>
        </form>

        <p style={{ fontSize: 12, marginTop: 8 }}>* Campo obligatorio</p>
      </div>
    </section>
  );
};

export default CreatedCar;