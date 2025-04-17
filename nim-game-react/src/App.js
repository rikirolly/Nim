import React from 'react';
import Game from './components/Game'; // Assicurati che il percorso sia corretto
import './index.css'; // Importa il CSS globale

function App() {
  return (
    <div className="App">
      <h1>Gioco del Nim</h1>
      <Game />
    </div>
  );
}

export default App;