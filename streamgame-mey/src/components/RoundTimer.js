import React, { useState, useEffect } from 'react';

function RoundTimer({ onTimerEnd }) {
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onTimerEnd();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimerEnd]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="RoundTimer">
      <h2>Temps Restant: {minutes}:{seconds < 10 ? '0' : ''}{seconds}</h2>
    </div>
  );
}

export default RoundTimer;
