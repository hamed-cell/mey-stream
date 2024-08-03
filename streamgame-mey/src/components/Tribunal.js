import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Container, Typography, Button, CircularProgress, Box } from '@mui/material';
import './Tribunal.css';

function Tribunal() {
  const [tiers, setTiers] = useState({});
  const [currentViewerIndex, setCurrentViewerIndex] = useState(0);
  const [viewerTimer, setViewerTimer] = useState(5 * 60); // 5 minutes for each viewer
  const [loading, setLoading] = useState(true);
  const [defenses, setDefenses] = useState({});

  useEffect(() => {
    // Listen for changes in Firestore collection
    const unsubscribeTiers = onSnapshot(collection(db, 'tiers'), (snapshot) => {
      const newTiers = {};
      snapshot.forEach((doc) => {
        newTiers[doc.id] = doc.data().names || [];
      });
      setTiers(newTiers);
      setLoading(false);
    });

    const unsubscribeDefenses = onSnapshot(doc(db, 'tiers', 'defenses'), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setDefenses(docSnapshot.data());
      } else {
        setDefenses({});
      }
    });

    return () => {
      unsubscribeTiers();
      unsubscribeDefenses();
    };
  }, []);

  useEffect(() => {
    // Countdown timer for each viewer
    const viewerTimerInterval = setInterval(() => {
      setViewerTimer((prevTime) => {
        if (prevTime <= 0) {
          handleKill(); // Automatically kill if time runs out
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(viewerTimerInterval);
  }, [viewerTimer]);

  useEffect(() => {
    // Reset timer when the current viewer changes
    setViewerTimer(5 * 60);
  }, [currentViewerIndex]);

  // Flatten all viewers from tiers except 'unranked'
  const getViewersList = () => {
    return Object.values(tiers).flat().filter((viewer) => viewer !== 'unranked');
  };

  // Get the current viewer based on index
  const getCurrentViewer = () => {
    const viewersList = getViewersList();
    if (currentViewerIndex >= viewersList.length) {
      return null;
    }
    return viewersList[currentViewerIndex];
  };

  // Move to the next viewer
  const moveToNextViewer = () => {
    const viewersList = getViewersList();
    if (currentViewerIndex + 1 < viewersList.length) {
      setCurrentViewerIndex((prevIndex) => prevIndex + 1);
    } else {
      alert('Tribunal terminé !');
    }
  };

  // Handle killing the current viewer
  const handleKill = async () => {
    const currentViewer = getCurrentViewer();
    if (currentViewer) {
      const updatedTiers = { ...tiers };
      Object.keys(updatedTiers).forEach((tier) => {
        updatedTiers[tier] = updatedTiers[tier].filter((viewer) => viewer !== currentViewer);
      });

      // Update Firestore with updated tiers
      await Promise.all(
        Object.keys(updatedTiers).map((tier) =>
          updateDoc(doc(db, 'tiers', tier), { names: updatedTiers[tier] })
        )
      );

      moveToNextViewer();
    }
  };

  // Handle sparing the current viewer
  const handleSpare = () => {
    moveToNextViewer();
  };

  // Format seconds into mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <Container className="loading-container">
        <CircularProgress />
        <Typography variant="h5">Chargement des viewers...</Typography>
      </Container>
    );
  }

  const currentViewer = getCurrentViewer();

  if (!currentViewer) {
    return (
      <Container className="no-viewers-container">
        <Typography variant="h5">Aucun viewer à juger.</Typography>
      </Container>
    );
  }

  return (
    <Container className="tribunal-container">
      <Typography variant="h4" className="tribunal-title">
        Tribunal de la Manche 2
      </Typography>
      <Typography variant="body1" className="tribunal-instructions">
        Bienvenue au Tribunal ! Chaque viewer doit écrire un plaidoyer pour expliquer pourquoi il mérite de rester en jeu.
        Vous avez 5 minutes par viewer pour décider de leur sort.
      </Typography>
      <Box className="current-viewer-box">
        <Typography variant="h6">Viewer Actuel : {currentViewer}</Typography>
        <Typography variant="body1">
          Temps restant pour décider: <span className="timer">{formatTime(viewerTimer)}</span>
        </Typography>
        <Typography variant="body2" className="defense-text">
          {defenses[currentViewer] || 'Aucune défense soumise.'}
        </Typography>
        <div className="decision-buttons">
          <Button variant="contained" color="error" onClick={handleKill}>
            Tuer
          </Button>
          <Button variant="contained" color="success" onClick={handleSpare}>
            Épargner
          </Button>
        </div>
      </Box>
    </Container>
  );
}

export default Tribunal;
