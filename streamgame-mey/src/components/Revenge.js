// Revenge.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { Container, Typography, Button, Box, CircularProgress } from '@mui/material';
import './Revenge.css';

function Revenge() {
  const [remainingViewers, setRemainingViewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState({});
  const [meyVote, setMeyVote] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [correctVote, setCorrectVote] = useState(null);

  useEffect(() => {
    const fetchRemainingViewers = () => {
      // Assume viewers are in a specific tier named "remaining" or fetch from spared ones
      const tierCollection = onSnapshot(collection(db, 'tiers'), (snapshot) => {
        let remaining = [];
        snapshot.forEach((doc) => {
          if (doc.id !== 'unranked' && doc.id !== 'defenses' && doc.id !== 'state') {
            remaining = [...remaining, ...doc.data().names];
          }
        });
        setRemainingViewers(remaining);
        setLoading(false);
      });

      return () => tierCollection();
    };

    fetchRemainingViewers();
  }, []);

  useEffect(() => {
    // Initialize votes for each remaining viewer
    const initializeVotes = async () => {
      const voteDocRef = doc(db, 'game', 'votes');
      const voteDocSnapshot = await getDoc(voteDocRef);

      if (!voteDocSnapshot.exists()) {
        const votesInit = {};
        remainingViewers.forEach((viewer) => {
          votesInit[viewer] = null;
        });
        await setDoc(voteDocRef, votesInit);
        setVotes(votesInit);
      } else {
        setVotes(voteDocSnapshot.data());
      }
    };

    if (remainingViewers.length > 0) {
      initializeVotes();
    }
  }, [remainingViewers]);

  const handleVote = (viewer, choice) => {
    setVotes((prevVotes) => ({
      ...prevVotes,
      [viewer]: choice,
    }));

    // Update the vote in Firestore
    const voteDocRef = doc(db, 'game', 'votes');
    updateDoc(voteDocRef, { [viewer]: choice });
  };

  const handleMeyChoice = (choice) => {
    setMeyVote(choice);
    const viewersForMey = Object.values(votes).filter((vote) => vote === 'mey').length;

    if (choice === viewersForMey) {
      alert(`Correct! ${viewersForMey} viewers voted for Mey.`);
    } else {
      alert(`Incorrect! Only ${viewersForMey} viewers voted for Mey. Game Over!`);
      setGameOver(true);
    }

    setCorrectVote(viewersForMey);
  };

  if (loading) {
    return (
      <Container className="loading-container">
        <CircularProgress />
        <Typography variant="h5">Chargement des viewers...</Typography>
      </Container>
    );
  }

  return (
    <Container className="revenge-container">
      <Typography variant="h4" className="revenge-title">
        Manche 3 : REVENGE
      </Typography>
      <Typography variant="body1" className="revenge-instructions">
        Chaque viewer peut décider de garder 10€ pour eux ou de les donner à Mey. Mey doit deviner combien de viewers ont choisi de lui donner les 10€.
      </Typography>
      <Box className="game-area">
        {gameOver ? (
          <Typography variant="h5" className="game-over">
            Le jeu est terminé !
          </Typography>
        ) : (
          <>
            {remainingViewers.map((viewer, index) => (
              <Box key={index} className="viewer-vote-box">
                <Typography variant="h6">{viewer}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleVote(viewer, 'keep')}
                  disabled={votes[viewer] !== null}
                >
                  Garder pour moi
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleVote(viewer, 'mey')}
                  disabled={votes[viewer] !== null}
                >
                  Donner à Mey
                </Button>
              </Box>
            ))}
            <Box className="mey-choice-box">
              <Typography variant="h5">Mey, combien de viewers ont voté pour toi ?</Typography>
              <div className="mey-choices">
                {[...Array(7).keys()].map((num) => (
                  <Button
                    key={num}
                    variant="contained"
                    color="success"
                    onClick={() => handleMeyChoice(num)}
                    disabled={meyVote !== null}
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
}

export default Revenge;
