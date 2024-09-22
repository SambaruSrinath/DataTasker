const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const fs = require('fs');
require('dotenv').config();
const app = express();
app.use(bodyParser.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const contacts = JSON.parse(fs.readFileSync('contacts.json', 'utf-8'));

let sentMessages = [];

// Serve static files (Frontend)
app.use(express.static('../frontend'));

// API to send OTP
app.post('/send-otp', (req, res) => {
  const contactId = req.query.id;
  const contact = contacts.find(c => c.id == contactId);
  
  const otp = Math.floor(100000 + Math.random() * 900000);
  
  client.messages.create({
    body: `Hi. Your OTP is: ${otp}`,
    from: '+1234567890',  // Twilio Number
    to: contact.phone
  }).then(message => {
    const messageLog = {
      name: `${contact.first_name} ${contact.last_name}`,
      time: new Date().toLocaleString(),
      otp: otp
    };
    sentMessages.push(messageLog);
    res.json({ status: 'success', otp: otp });
  }).catch(error => {
    res.status(500).json({ status: 'error', message: error.message });
  });
});

// API to get sent messages
app.get('/sent-messages', (req, res) => {
  res.json(sentMessages);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
