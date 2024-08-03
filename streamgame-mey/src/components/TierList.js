// TierList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import './TierList.css';

function TierList() {
  const [tiers, setTiers] = useState({
    S: [],
    A: [],
    B: [],
    C: [],
    unranked: [],
  });
  const [timerStarted, setTimerStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [round, setRound] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent page refresh or closing
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // Display a confirmation dialog
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    // Load initial state from Firestore and Local Storage
    const loadInitialState = async () => {
      const stateDoc = await getDoc(doc(db, 'tiers', 'state'));
      if (stateDoc.exists()) {
        const stateData = stateDoc.data();
        setRound(stateData.round);
        setTimerStarted(stateData.timerStarted);
        setTimeLeft(stateData.timeLeft);
      } else {
        // Load from local storage if Firestore does not have state
        const localState = JSON.parse(localStorage.getItem('tierlistState'));
        if (localState) {
          setRound(localState.round);
          setTimerStarted(localState.timerStarted);
          setTimeLeft(localState.timeLeft);
        }
      }
    };

    loadInitialState();

    const tierCollection = collection(db, 'tiers');

    const unsubscribe = onSnapshot(tierCollection, (snapshot) => {
      const newTiers = {
        S: [],
        A: [],
        B: [],
        C: [],
        unranked: [],
      };

      snapshot.forEach((doc) => {
        const tierData = doc.data();
        if (tierData.names) {
          newTiers[doc.id] = tierData.names;
        }
      });

      setTiers(newTiers);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let timer;
    if (timerStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [timerStarted, timeLeft]);

  useEffect(() => {
    // Update state in Firestore whenever state changes
    const updateStateInFirestore = async () => {
      await setDoc(doc(db, 'tiers', 'state'), {
        round,
        timerStarted,
        timeLeft,
      });

      // Also save state in local storage
      localStorage.setItem(
        'tierlistState',
        JSON.stringify({ round, timerStarted, timeLeft })
      );
    };

    updateStateInFirestore();
  }, [round, timerStarted, timeLeft]);

  const startTimer = () => {
    setTimerStarted(true);
  };

  const nextRound = () => {
    setTimerStarted(false);
    setTimeLeft(15 * 60); // Reset time for next round
    setRound((prevRound) => prevRound + 1);
    if (round + 1 > 1) {
      // Transition to tribunal
      navigate('/tribunal');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleDragStart = (e, user) => {
    if (!timerStarted) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', user);
  };

  const handleDrop = async (e, targetTier) => {
    if (!timerStarted) return;

    const user = e.dataTransfer.getData('text/plain');
    if (user) {
      setTiers((prev) => {
        const updatedTiers = { ...prev };
        // Remove user from all tiers
        for (let t in updatedTiers) {
          updatedTiers[t] = updatedTiers[t].filter((u) => u !== user);
        }
        // Add user to the target tier
        updatedTiers[targetTier].push(user);

        // Update Firestore with new tier states
        Object.keys(updatedTiers).forEach((tier) => {
          updateTierInFirestore(tier, updatedTiers[tier]);
        });

        return updatedTiers;
      });
    }
    e.preventDefault();
  };

  const updateTierInFirestore = async (tier, names) => {
    try {
      const tierRef = doc(db, 'tiers', tier);
      await updateDoc(tierRef, { names });
    } catch (error) {
      console.error(`Error updating Firestore for ${tier}: `, error);
    }
  };

  const handleDragOver = (e) => {
    if (timerStarted) {
      e.preventDefault();
    }
  };

  return (
    <div className="tierlist-container">
      <h1>Classement des Viewers</h1>
      {!timerStarted && (
        <button className="start-button" onClick={startTimer}>
          Commencer la Tierlist
        </button>
      )}
      {timerStarted && (
        <div className="timer-and-message">
          <div className="manche-message">Manche {round}</div>
          <div className="timer-display">{formatTime(timeLeft)}</div>
          {timeLeft > 0 && (
            <button className="next-round-button" onClick={nextRound}>
              Passer à la Manche {round + 1}
            </button>
          )}
        </div>
      )}
      {Object.keys(tiers).map((tier) => (
        <div
          key={tier}
          className="tier-section"
          onDrop={(e) => handleDrop(e, tier)}
          onDragOver={handleDragOver}
        >
          <h2>{tier.toUpperCase()} Tier</h2>
          <div className="tier-list">
            {tiers[tier].map((user, index) => (
              <div
                key={`${user}-${index}`}
                className={`tier-item ${timerStarted ? 'draggable' : ''}`}
                draggable={timerStarted}
                onDragStart={(e) => handleDragStart(e, user)}
              >
                {user}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TierList;
