import React, { useState } from 'react';
import '../layouts/search.css';

interface Vehicle {
  idvehiculo: number;
  marca: string;
  kilometraje: number;
  precio: number;
}

const SearchContainer: React.FC = () => {
  const [id, setId] = useState('');
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!id) {
      setError('Por favor, ingresa un ID de vehículo');
      setVehicle(null);
      return;
    }

    try {
      setError(null);
      setVehicle(null);

      const response = await fetch(`https://localhost:44370/api/vehiculo/${id}`);
      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status}`);
      }

      const data = await response.json();
      setVehicle(data);
    } catch (error) {
      console.error(error);
      setError('No se pudo obtener el vehículo. Verifica el ID.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="search-section">
      <div className="search-container">
        <div className="search-box">
          <div className="search-input">
            <input 
              type="text" 
              placeholder="Ingresa ID del vehículo"
              value={id}
              onChange={(e) => setId(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <button className="btn-primary" onClick={handleSearch}>
            Buscar por ID
          </button>
        </div>

        {/* Mostrar mensajes de error */}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Mostrar resultados si existe el vehículo */}
        {vehicle && (
          <div className="vehicle-card">
            <h3>Vehículo encontrado</h3>
            <p><strong>ID:</strong> {vehicle.idvehiculo}</p>
            <p><strong>Marca:</strong> {vehicle.marca}</p>
            <p><strong>Kilometraje:</strong> {vehicle.kilometraje}</p>
            <p><strong>Precio:</strong> Q{vehicle.precio}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchContainer;
