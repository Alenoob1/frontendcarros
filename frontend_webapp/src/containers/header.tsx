import React, { useState } from 'react';
import { Link } from 'react-scroll'; // 👈 importamos react-scroll
import '../layouts/header.css';

interface HeaderContainerProps {
  onLogout: () => void;
}

const HeaderContainer: React.FC<HeaderContainerProps> = ({ onLogout }) => {
  const [dark, setDark] = useState(false);

  const toggleTheme = () => {
    document.body.classList.toggle('dark-mode');
    setDark(!dark);
  };

  const handleLogout = () => {
    onLogout();
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo">
          <h1>CarOnline</h1>
        </div>

        {/* Navegación con react-scroll */}
        <nav className="nav">
          <Link 
            to="inicio" 
            smooth={true} 
            duration={500} 
            offset={-70} 
            className="nav-link"
          >
            Inicio
          </Link>
          <Link 
            to="vehiculos" 
            smooth={true} 
            duration={500} 
            offset={-70} 
            className="nav-link"
          >
            Vehículos
          </Link>
          <Link 
            to="servicios" 
            smooth={true} 
            duration={500} 
            offset={-70} 
            className="nav-link"
          >
            Servicios
          </Link>
          <Link 
            to="contacto" 
            smooth={true} 
            duration={500} 
            offset={-70} 
            className="nav-link"
          >
            Contacto
          </Link>
        </nav>

        {/* Botones de acciones */}
        <div className="header-actions">
          <button className="btn-theme-toggle" onClick={toggleTheme}>
            {dark ? '☀️ Claro' : '🌙 Oscuro'}
          </button>
          {/* <button className="btn-logout" onClick={handleLogout}>
            🚪 Cerrar Sesión
          </button> */}
        </div>
      </div>
    </header>
  );
};

export default HeaderContainer;
