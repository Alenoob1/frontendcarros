import React from 'react';
import HeaderContainer from '../containers/header';
import InitialView from '../containers/initialview';
import SearchContainer from '../containers/serachs';
import TopCarContainer from '../containers/topcar';
import ServicesContainer from '../containers/services';
import FooterContainer from '../containers/flooter';
import CreatedCar from '../containers/createcar';
import AnalizarImg from '../containers/analizarimg';

interface HomepageProps {
  onLogout: () => void;
}

const Homepage: React.FC<HomepageProps> = ({ onLogout }) => {
  return (
    <div className="homepage">
      {/* Header con el menú */}
      <HeaderContainer onLogout={onLogout} />

      {/* Secciones con IDs para react-scroll */}
      <section id="inicio">
        <InitialView />
      </section>

      <section id="crear-auto">
        <CreatedCar />
      </section>

      <section id="vehiculos">
        <SearchContainer />
        <TopCarContainer />
      </section>

      <section id="analizar">
        <h2 style={{ textAlign: 'center', margin: '2rem 0' }}>Analizar Imagen</h2>
        <AnalizarImg />
      </section>

      <section id="servicios">
        <ServicesContainer />
      </section>

      <section id="contacto">
        <FooterContainer />
      </section>
    </div>
  );
};

export default Homepage;
