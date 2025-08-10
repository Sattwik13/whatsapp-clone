const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Message, Contact } = require('./model.js');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect MongoDB
mongoose.connect('mongodb+srv://sattwikmanna6359:whatsapp@whatsapp.ieup5p8.mongodb.net/?retryWrites=true&w=majority&appName=whatsapp', { useNewUrlParser: true, useUnifiedTopology: true });

// WebSocket Setup
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { origin: '*' }
});

// Receive webhook data
app.post('/webhook', async (req, res) => {
  const entry = req.body.metaData.entry;
  entry.forEach(async (item) => {
    item.changes.forEach(async (change) => {
      const val = change.value;
      // Save contact
      val.contacts.forEach(async (contact) => {
        await Contact.updateOne({ waId: contact.wa_id }, { name: contact.profile.name }, { upsert: true });
      });
      // Save messages
      if (val.messages) {
        val.messages.forEach(async (msg) => {
          const m = await Message.create({
            waId: val.contacts[0].wa_id,
            conversationId: item.id,
            from: msg.from,
            body: msg.text.body,
            timestamp: Number(msg.timestamp),
            type: msg.type,
            status: 'read'
          });
          io.emit('new_message', m); // Notify frontend
        });
      }
      // Save statuses
      if (val.statuses) {
        val.statuses.forEach(async (status) => {
          await Message.updateOne({ id: status.id }, { status: status.status });
          io.emit('status_update', { id: status.id, status: status.status });
        });
      }
    });
  });
  res.sendStatus(200);
});

// Send message (storage only)
app.post('/send', async (req, res) => {
  const { waId, conversationId, body } = req.body;
  const msg = await Message.create({
    waId,
    conversationId,
    from: 'you',
    body,
    timestamp: Date.now() / 1000,
    type: 'text',
    status: 'sent'
  });
  io.emit('new_message', msg);
  res.json(msg);
});

// Get all conversations
app.get('/conversations', async (req, res) => {
  const contacts = await Contact.find();
  res.json(contacts);
});

// Get messages for a conversation
app.get('/messages/:waId', async (req, res) => {
  const msgs = await Message.find({ waId: req.params.waId }).sort('timestamp');
  res.json(msgs);
});

http.listen(5000, () => console.log('Server listening on 5000'));
