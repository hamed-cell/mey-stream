// components/Auth.js
import React, { useState } from 'react';
import { auth } from '../../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button, TextField, Container, Typography } from '@mui/material';

function Auth({ onRoleSelected }) {
  const [role, setRole] = useState('');
  const [streamerPassword, setStreamerPassword] = useState('');

  // Fonction pour gérer la connexion Google
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
    }
  };

  // Fonction pour sélectionner le rôle de l'utilisateur
  const handleRoleSelection = () => {
    if (role === 'streamer' && streamerPassword !== 'hamedestsacrementsexy') {
      alert('Mot de passe incorrect pour le streamer.');
      return;
    }
    onRoleSelected(role);
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '50px' }}>
      <Typography variant="h4" gutterBottom>
        Connexion et Sélection du Rôle
      </Typography>
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Connexion avec Google
      </Button>
      <div style={{ marginTop: '20px' }}>
        <Typography variant="h6">Sélectionnez votre rôle</Typography>
        <Button variant="outlined" onClick={() => setRole('viewer')}>
          Spectateur
        </Button>
        <Button variant="outlined" onClick={() => setRole('streamer')}>
          Streameuse
        </Button>
        {role === 'streamer' && (
          <TextField
            label="Mot de passe du Streamer"
            type="password"
            variant="outlined"
            onChange={(e) => setStreamerPassword(e.target.value)}
            style={{ marginTop: '10px' }}
          />
        )}
        <Button
          variant="contained"
          onClick={handleRoleSelection}
          style={{ marginTop: '10px' }}
        >
          Continuer
        </Button>
      </div>
    </Container>
  );
}

export default Auth;
