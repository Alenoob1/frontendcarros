import React, { useState, useEffect } from 'react';
import '../layouts/topcar.css';

type ApiVehicle = {
  idvehiculo: number;
  marca: string;
  kilometraje: string;
  precio: number;
};

interface Vehicle {
  id: number;
  marca: string;
  kilometraje?: string;
  precio: number;
  // opcionales si regresan en el futuro
  modelo?: string;
  año?: string;
  estado?: string;
  color?: string;
  image?: string;
}

const currencyFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  maximumFractionDigits: 2,
});

const TopCarContainer: React.FC = () => {
  const [showAllVehicles, setShowAllVehicles] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedVehicles, setExpandedVehicles] = useState<Set<number>>(new Set());

  // edición
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ marca: string; kilometraje: string; precio: string }>({
    marca: '',
    kilometraje: '',
    precio: '',
  });
  const [saving, setSaving] = useState(false);

  // mensajes generales
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<string | null>(null);

  // eliminación
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteOk, setDeleteOk] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizeResponse = (data: unknown): Vehicle[] => {
    if (Array.isArray(data)) {
      const arr = data as ApiVehicle[];
      return arr.map((v) => ({
        id: v.idvehiculo,
        marca: v.marca,
        kilometraje: v.kilometraje,
        precio: typeof v.precio === 'number' ? v.precio : Number(v.precio),
      }));
    }
    if (data && typeof data === 'object') {
      const maybeVehiclesArray =
        Array.isArray((data as any).vehicles) ? (data as any).vehicles :
        Array.isArray((data as any).data) ? (data as any).data : null;
      if (maybeVehiclesArray) return normalizeResponse(maybeVehiclesArray);
    }
    return [];
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://localhost:44370/api/vehiculo/');
      if (!response.ok) throw new Error('Error al obtener vehículos');
      const raw = await response.json();
      const allVehicles = normalizeResponse(raw);
      if (allVehicles.length === 0) throw new Error('No se encontraron vehículos en la respuesta de la API');
      setVehicles(allVehicles);
    } catch (err) {
      console.error('Error completo:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const toggleVehicleDetails = (vehicleId: number) => {
    setExpandedVehicles((prev) => {
      const next = new Set(prev);
      if (next.has(vehicleId)) next.delete(vehicleId);
      else next.add(vehicleId);
      return next;
    });
  };

  // ----- PUT (editar) -----
  const startEdit = (v: Vehicle) => {
    setEditingId(v.id);
    setEditForm({
      marca: v.marca ?? '',
      kilometraje: v.kilometraje ?? '',
      precio: String(v.precio ?? ''),
    });
    setSaveError(null);
    setSaveOk(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSaveError(null);
    setSaveOk(null);
  };

  const onEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };

  const putVehicle = async (id: number, data: { marca: string; kilometraje: string; precio: number }) => {
    const url = `https://localhost:44370/api/Vehiculo/${id}`; // ojo a la V mayúscula
    const body = JSON.stringify({
      idvehiculo: id,
      marca: data.marca,
      kilometraje: data.kilometraje,
      precio: data.precio,
    });
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`Fallo al actualizar (HTTP ${res.status}) ${t ? `- ${t}` : ''}`);
    }
    try { return await res.json(); } catch { return { ok: true }; }
  };

  const saveEdit = async () => {
    if (editingId == null) return;
    setSaving(true);
    setSaveError(null);
    setSaveOk(null);
    try {
      const payload = {
        marca: editForm.marca.trim(),
        kilometraje: editForm.kilometraje.trim(),
        precio: Number(editForm.precio),
      };
      if (Number.isNaN(payload.precio)) throw new Error('El precio debe ser numérico.');
      await putVehicle(editingId, payload);
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === editingId ? { ...v, marca: payload.marca, kilometraje: payload.kilometraje, precio: payload.precio } : v
        )
      );
      setSaveOk('Vehículo actualizado correctamente.');
      setEditingId(null);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Error al guardar cambios.');
    } finally {
      setSaving(false);
    }
  };
  // ----- FIN PUT -----

  // ----- DELETE (eliminar) -----
  const deleteVehicle = async (id: number) => {
    if (!window.confirm('¿Desea eliminar este vehículo? Esta acción no se puede deshacer.')) return;

    setDeleteError(null);
    setDeleteOk(null);
    setDeletingId(id);
    try {
      const url = `https://localhost:44370/api/Vehiculo/${id}`; // V mayúscula
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`Fallo al eliminar (HTTP ${res.status}) ${t ? `- ${t}` : ''}`);
      }

      // Actualización optimista
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      setExpandedVehicles((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (editingId === id) setEditingId(null);

      setDeleteOk('Vehículo eliminado correctamente.');
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Error al eliminar el vehículo.');
    } finally {
      setDeletingId(null);
    }
  };
  // ----- FIN DELETE -----

  const vehiclesToShow = showAllVehicles ? vehicles : vehicles.slice(0, 6);

  if (loading) {
    return (
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>Vehículos Destacados</h2>
            <p>Cargando vehículos...</p>
          </div>
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>Vehículos Destacados</h2>
            <p>Error: {error}</p>
          </div>
          <button className="btn-outline" onClick={fetchVehicles}>Reintentar</button>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-section">
      <div className="container">
        <div className="section-header">
          <h2>Vehículos Destacados</h2>
          <p>Los mejores vehículos seleccionados para ti</p>
          {saveOk && <p className="success-msg">{saveOk}</p>}
          {saveError && <p className="error-msg">{saveError}</p>}
          {deleteOk && <p className="success-msg">{deleteOk}</p>}
          {deleteError && <p className="error-msg">{deleteError}</p>}
        </div>

        <div className="vehicles-grid">
          {vehiclesToShow.map((vehicle) => {
            const isExpanded = expandedVehicles.has(vehicle.id);
            const isEditing = editingId === vehicle.id;

            return (
              <div key={vehicle.id} className="vehicle-card">
                <div className="vehicle-image">
                  <img
                    src={vehicle.image || '/img/nose.jpg'}
                    alt={vehicle.marca || 'Vehículo'}
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      if (!img.src.endsWith('/img/nose.jpg')) img.src = '/img/nose.jpg';
                    }}
                  />
                  <div className="vehicle-badge">Destacado</div>
                  {vehicle.estado && (
                    <div className={`estado-badge estado-${vehicle.estado.toLowerCase().replace(/\s+/g, '-')}`}>
                      {vehicle.estado}
                    </div>
                  )}
                </div>

                <div className="vehicle-info">
                  <h3>{vehicle.marca}{vehicle.modelo ? ` ${vehicle.modelo}` : ''}</h3>

                  {isEditing ? (
                    <div className="vehicle-edit-form">
                      <div className="form-row">
                        <label>Marca</label>
                        <input name="marca" value={editForm.marca} onChange={onEditChange} placeholder="Marca" />
                      </div>
                      <div className="form-row">
                        <label>Kilometraje</label>
                        <input name="kilometraje" value={editForm.kilometraje} onChange={onEditChange} placeholder="Ej. 140000" />
                      </div>
                      <div className="form-row">
                        <label>Precio</label>
                        <input name="precio" value={editForm.precio} onChange={onEditChange} placeholder="Ej. 25000" type="number" step="0.01" />
                      </div>
                      <div className="actions">
                        <button className="btn-outline" onClick={cancelEdit} disabled={saving || deletingId === vehicle.id}>Cancelar</button>
                        <button className="btn-primary" onClick={saveEdit} disabled={saving || deletingId === vehicle.id}>
                          {saving ? 'Guardando…' : 'Guardar'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {isExpanded ? (
                        <div className="vehicle-details-expanded">
                          <div className="vehicle-details">
                            {vehicle.kilometraje && <span>Kilometraje: {vehicle.kilometraje}</span>}
                            <span className="brand-tag">{vehicle.marca}</span>
                          </div>
                          <div className="vehicle-price">
                            <span className="price">{currencyFormatter.format(vehicle.precio)}</span>
                            <div className="actions">
                              <button className="btn-outline" onClick={() => toggleVehicleDetails(vehicle.id)} disabled={deletingId === vehicle.id}>
                                Ver Menos
                              </button>
                              <button className="btn-primary" onClick={() => startEdit(vehicle)} disabled={deletingId === vehicle.id}>
                                Editar
                              </button>
                              <button
                                className="btn-danger"
                                onClick={() => deleteVehicle(vehicle.id)}
                                disabled={deletingId === vehicle.id || saving}
                              >
                                {deletingId === vehicle.id ? 'Eliminando…' : 'Eliminar'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="vehicle-details-collapsed">
                          <div className="vehicle-price">
                            <span className="price">{currencyFormatter.format(vehicle.precio)}</span>
                            <div className="actions">
                              <button className="btn-outline" onClick={() => toggleVehicleDetails(vehicle.id)} disabled={deletingId === vehicle.id}>
                                Ver Detalles
                              </button>
                              <button className="btn-primary" onClick={() => startEdit(vehicle)} disabled={deletingId === vehicle.id}>
                                Editar
                              </button>
                              <button
                                className="btn-danger"
                                onClick={() => deleteVehicle(vehicle.id)}
                                disabled={deletingId === vehicle.id || saving}
                              >
                                {deletingId === vehicle.id ? 'Eliminando…' : 'Eliminar'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {vehicles.length > 6 && (
          <div className="section-footer">
            {!showAllVehicles ? (
              <button className="btn-outline btn-large" onClick={() => setShowAllVehicles(true)}>
                Ver Todos los Vehículos ({vehicles.length})
              </button>
            ) : (
              <button className="btn-outline btn-large" onClick={() => setShowAllVehicles(false)}>
                Ver Menos
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default TopCarContainer;