// Chat.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { Container, TextField, Button, Typography, List, ListItem, Paper } from '@mui/material';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = [];
      snapshot.forEach((doc) => messagesData.push(doc.data()));
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (newMessage.trim() !== '') {
      try {
        await addDoc(collection(db, "messages"), {
          text: newMessage,
          timestamp: serverTimestamp(),
        });
        setNewMessage('');
      } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
      }
    }
  };

  return (
    <Container style={{ maxWidth: '350px', marginLeft: '20px' }}>
      <Typography variant="h4" gutterBottom style={{ color: '#fff' }}>
        Chat en Direct
      </Typography>
      <div className="messages" style={{ maxHeight: '300px', overflowY: 'auto', backgroundColor: '#36393f', padding: '10px', borderRadius: '4px' }}>
        <List>
          {messages.map((msg, index) => (
            <ListItem key={index} style={{ color: '#fff' }}>
              <Paper style={{ padding: '10px', width: '100%', backgroundColor: '#40444b' }}>
                <Typography variant="body1">{msg.text}</Typography>
              </Paper>
            </ListItem>
          ))}
        </List>
      </div>
      <form onSubmit={handleSendMessage} style={{ marginTop: '20px' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Entrez votre message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ marginBottom: '10px', backgroundColor: '#fff', borderRadius: '4px' }}
        />
        <Button variant="contained" color="primary" type="submit" style={{ backgroundColor: '#7289da', color: '#fff' }}>
          Envoyer
        </Button>
      </form>
    </Container>
  );
}

export default Chat;
