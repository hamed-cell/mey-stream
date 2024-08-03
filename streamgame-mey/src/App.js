// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TierList from './components/TierList';
import Tribunal from './components/Tribunal'; // Import the Tribunal component
import Login from './components/Login';
import Viewer from './components/Viewer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/tierlist" element={<TierList />} />
        <Route path="/tribunal" element={<Tribunal />} /> {/* Add Tribunal route */}
        <Route path="/viewer" element={<Viewer />} />
      </Routes>
    </Router>
  );
}

export default App;
