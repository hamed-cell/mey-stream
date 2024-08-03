// Viewer.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, setDoc, getDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { Button, TextField, Container, Typography, Box } from '@mui/material';
import './Viewer.css';  // Import the CSS file

function Viewer() {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [defense, setDefense] = useState('');
  const [currentPhase, setCurrentPhase] = useState(1);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [vote, setVote] = useState(null);

  useEffect(() => {
    // Check the current phase
    const unsubscribePhase = onSnapshot(doc(db, 'game', 'phase'), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setCurrentPhase(data.currentPhase || 1);
      }
    });

    return () => {
      unsubscribePhase();
    };
  }, []);

  const handleNameSubmit = async (e) => {
    e.preventDefault();

    if (name.trim() === '') {
      alert('Veuillez entrer votre nom.');
      return;
    }

    try {
      const unrankedDocRef = doc(db, 'tiers', 'unranked');
      await updateDoc(unrankedDocRef, {
        names: arrayUnion(name),
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Erreur lors de l'ajout à la liste non classée :", error);
    }
  };

  const handleDefenseSubmit = async (e) => {
    e.preventDefault();

    if (defense.trim() === '') {
      alert('Veuillez entrer votre plaidoyer.');
      return;
    }

    try {
      const defensesDocRef = doc(db, 'tiers', 'defenses');
      const defensesDocSnapshot = await getDoc(defensesDocRef);

      if (!defensesDocSnapshot.exists()) {
        await setDoc(defensesDocRef, { [name]: defense });
      } else {
        await updateDoc(defensesDocRef, {
          [name]: defense,
        });
      }

      alert('Plaidoyer soumis avec succès!');
    } catch (error) {
      console.error('Erreur lors de la soumission du plaidoyer :', error);
    }
  };

  const handleVoteSubmit = async (choice) => {
    setVote(choice);
    setVoteSubmitted(true);

    try {
      const voteDocRef = doc(db, 'game', 'votes');
      const votesDocSnapshot = await getDoc(voteDocRef);

      if (!votesDocSnapshot.exists()) {
        await setDoc(voteDocRef, { [name]: choice });
      } else {
        await updateDoc(voteDocRef, {
          [name]: choice,
        });
      }

      alert('Votre vote a été enregistré!');
    } catch (error) {
      console.error('Erreur lors de la soumission du vote :', error);
    }
  };

  const getInstructions = (phase) => {
    switch (phase) {
      case 1:
        return 'Attendez votre classement dans la Tier List.';
      case 2:
        return 'Écrivez un texte pour vous défendre et expliquez pourquoi vous méritez de passer à la prochaine manche.';
      case 3:
        return 'Décidez si vous souhaitez garder les 10€ pour vous ou les donner à Mey.';
      default:
        return 'En attente de la prochaine phase.';
    }
  };

  return (
    <Container className="container">
      <Typography variant="h4" gutterBottom>
        Bienvenue, {name || 'Viewer'}
      </Typography>

      <Box className="phase-info">
        <Typography variant="h6">Phase actuelle : Manche {currentPhase}</Typography>
        <Typography variant="body1">{getInstructions(currentPhase)}</Typography>
      </Box>

      {!submitted ? (
        <form onSubmit={handleNameSubmit}>
          <TextField
            label="Entrez votre nom"
            variant="outlined"
            fullWidth
            className="text-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button type="submit" variant="contained" className="submit-button">
            Soumettre
          </Button>
        </form>
      ) : currentPhase === 2 ? (
        <form onSubmit={handleDefenseSubmit}>
          <TextField
            label="Entrez votre plaidoyer"
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            className="text-field"
            value={defense}
            onChange={(e) => setDefense(e.target.value)}
          />
          <Button type="submit" variant="contained" className="submit-button">
            Soumettre le plaidoyer
          </Button>
        </form>
      ) : currentPhase === 3 && !voteSubmitted ? (
        <Box>
          <Typography variant="h6">Quelle est votre décision concernant les 10€ ?</Typography>
          <Button
            variant="contained"
            className="vote-button"
            onClick={() => handleVoteSubmit('keep')}
          >
            Garder pour moi
          </Button>
          <Button
            variant="contained"
            className="vote-button"
            onClick={() => handleVoteSubmit('mey')}
          >
            Donner à Mey
          </Button>
        </Box>
      ) : (
        <Typography variant="h6" className="decision-message">
          {voteSubmitted ? `Vous avez choisi de ${vote === 'keep' ? 'garder les 10€' : 'donner les 10€ à Mey'}.` : ''}
        </Typography>
      )}
    </Container>
  );
}

export default Viewer;
