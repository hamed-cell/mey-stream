// Vote.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { Container, Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Vote.css'; // Optional CSS import

function Vote({ viewerName }) {
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [vote, setVote] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the vote has already been submitted
    const checkVoteStatus = async () => {
      const voteDocRef = doc(db, 'game', 'votes');
      const voteDocSnapshot = await getDoc(voteDocRef);

      if (voteDocSnapshot.exists()) {
        const votes = voteDocSnapshot.data();
        if (votes[viewerName]) {
          setVote(votes[viewerName]);
          setVoteSubmitted(true);
        }
      }
    };

    checkVoteStatus();
  }, [viewerName]);

  const handleVoteSubmit = async (choice) => {
    setVote(choice);
    setVoteSubmitted(true);

    try {
      const voteDocRef = doc(db, 'game', 'votes');
      const votesDocSnapshot = await getDoc(voteDocRef);

      if (!votesDocSnapshot.exists()) {
        await setDoc(voteDocRef, { [viewerName]: choice });
      } else {
        await updateDoc(voteDocRef, {
          [viewerName]: choice,
        });
      }

      alert('Votre vote a été enregistré!');
      navigate('/'); // Redirect to home or a specific route after voting
    } catch (error) {
      console.error('Erreur lors de la soumission du vote :', error);
    }
  };

  return (
    <Container className="vote-container">
      <Typography variant="h4" gutterBottom>
        Décidez de votre vote, {viewerName}
      </Typography>
      {!voteSubmitted ? (
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
        <Typography variant="h6">
          Vous avez choisi de {vote === 'keep' ? 'garder les 10€' : 'donner les 10€ à Mey'}.
        </Typography>
      )}
    </Container>
  );
}

export default Vote;
