// models.js
const mongoose = require('mongoose');


const MessageSchema = new mongoose.Schema({
  waId: String,
  conversationId: String,
  from: String,
  body: String,
  timestamp: Number,
  type: String,
  status: String
});

const ContactSchema = new mongoose.Schema({
  waId: String,
  name: String
});

module.exports = {
  Message: mongoose.model('Message', MessageSchema),
  Contact: mongoose.model('Contact', ContactSchema)
};
