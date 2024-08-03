// components/TierManager.js
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Container, Typography } from '@mui/material';

function TierManager() {
  const [tiers, setTiers] = useState({
    S: [],
    A: [],
    B: [],
    unranked: [],
  });

  useEffect(() => {
    // Charger les spectateurs non classés depuis Firestore
    const fetchData = async () => {
      const unrankedDocRef = doc(db, 'tiers', 'unranked');
      const unrankedSnapshot = await getDoc(unrankedDocRef);
      if (!unrankedSnapshot.exists()) {
        await updateDoc(unrankedDocRef, { names: [] });
      }

      const unsubscribe = onSnapshot(unrankedDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setTiers((prevTiers) => ({ ...prevTiers, unranked: data.names || [] }));
        }
      });

      return () => unsubscribe();
    };

    fetchData();
  }, []);

  // Gestion du déplacement des spectateurs dans les tiers
  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceList = Array.from(tiers[source.droppableId]);
    const [moved] = sourceList.splice(source.index, 1);
    const destList = Array.from(tiers[destination.droppableId]);
    destList.splice(destination.index, 0, moved);

    setTiers((prevTiers) => ({
      ...prevTiers,
      [source.droppableId]: sourceList,
      [destination.droppableId]: destList,
    }));

    try {
      await updateDoc(doc(db, 'tiers', destination.droppableId), {
        names: destList,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des tiers:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Gestion des Tiers
      </Typography>
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(tiers).map(([tier, names]) => (
          <Droppable droppableId={tier} key={tier}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  margin: '10px 0',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#f7f7f7',
                }}
              >
                <Typography variant="h6">{tier} Tier</Typography>
                {names.map((name, index) => (
                  <Draggable key={name} draggableId={name} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          padding: '8px',
                          margin: '4px 0',
                          backgroundColor: '#f1f1f1',
                          borderRadius: '4px',
                        }}
                      >
                        {name}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </Container>
  );
}

export default TierManager;
