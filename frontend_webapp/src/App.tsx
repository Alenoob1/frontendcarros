import React, { useState, useEffect } from 'react';
import Homepage from './components/homepage';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Simular verificación de autenticación (ejemplo)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // espera 1.5 segundos
    return () => clearTimeout(timer);
  }, []);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Homepage />
    </div>
  );
}

export default App;
