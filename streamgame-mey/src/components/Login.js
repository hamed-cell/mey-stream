// Login.js
import React, { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase';
import { Button, Container, Typography, TextField } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [userRole, setUserRole] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
    }
  };

  const handleRoleSelection = () => {
    if (userRole === 'streamer' && password === 'hamedestsacrementsexy') {
      navigate('/tierlist');
    } else if (userRole === 'viewer') {
      navigate('/viewer');
    } else {
      alert("Mot de passe incorrect ou rôle non sélectionné.");
    }
  };

  return (
    <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '100px' }}>
      <Typography variant="h3" gutterBottom>
        Connexion
      </Typography>
      {!isLoggedIn ? (
        <Button
          variant="contained"
          color="primary"
          startIcon={<GoogleIcon />}
          onClick={handleLogin}
          style={{ marginBottom: '20px' }}
        >
          Se connecter avec Google
        </Button>
      ) : (
        <div>
          <Typography variant="h6">Choisissez votre rôle :</Typography>
          <Button variant="outlined" onClick={() => setUserRole('streamer')} style={{ margin: '10px' }}>
            Je suis Mey (Streameuse)
          </Button>
          <Button variant="outlined" onClick={() => setUserRole('viewer')} style={{ margin: '10px' }}>
            Je suis Viewer
          </Button>

          {userRole === 'streamer' && (
            <div style={{ marginTop: '20px' }}>
              <TextField
                label="Mot de passe du streameur"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                style={{ marginBottom: '10px' }}
              />
              <Button variant="contained" color="secondary" onClick={handleRoleSelection}>
                Valider
              </Button>
            </div>
          )}

          {userRole === 'viewer' && (
            <Button variant="contained" color="secondary" onClick={handleRoleSelection}>
              Continuer comme Viewer
            </Button>
          )}
        </div>
      )}
    </Container>
  );
}

export default Login;
