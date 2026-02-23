import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { config } from '@autowala/shared/constants/config';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
    console.log('WhatsApp webhook verified');
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

app.post('/webhook', async (req, res) => {
  try {
    const { entry } = req.body;
    
    if (entry && entry[0]?.changes) {
      const changes = entry[0].changes;
      
      for (const change of changes) {
        if (change.value?.messages) {
          for (const message of change.value.messages) {
            await handleIncomingMessage(message);
          }
        }
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error');
  }
});

async function handleIncomingMessage(message: any) {
  const from = message.from;
  const type = message.type;
  
  console.log(`Received message from ${from}:`, type);
  
  if (type === 'text') {
    const text = message.text.body.toLowerCase();
    await handleTextMessage(from, text);
  } else if (type === 'interactive') {
    const buttonReply = message.interactive?.button_reply;
    if (buttonReply) {
      await handleButtonReply(from, buttonReply);
    }
  }
}

async function handleTextMessage(from: string, text: string) {
  if (text.includes('hi') || text.includes('hello') || text.includes('नमस्ते')) {
    await sendMessage(from, 'नमस्ते! Welcome to Autowala 🚕\n\nBook your auto easily in Kolhapur.\n\nSend your pickup location to book.');
  } else if (text.includes('help')) {
    await sendHelpMessage(from);
  } else if (text.includes('auto') || text.includes('ऑटो')) {
    await sendMessage(from, 'Please share your pickup location or type the area name (e.g., "Railway Station", "Bus Stand", "Rankala")');
  }
}

async function handleButtonReply(from: string, reply: any) {
  const buttonId = reply.id;
  console.log(`Button clicked: ${buttonId} by ${from}`);
}

async function sendHelpMessage(from: string) {
  const helpText = `Autowala Help 📚

Commands:
• Send "hi" to start booking
• Type pickup location to begin
• Send "help" for this message

Popular Locations:
• Railway Station
• Bus Stand
• Rankala
• Mahalaxmi Temple
• Shivaji Udyamnagar

Need help? Call: +91XXXXXXXXX`;

  await sendMessage(from, helpText);
}

async function sendMessage(to: string, message: string) {
  console.log(`Sending to ${to}: ${message}`);
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🤖 WhatsApp bot running on port ${PORT}`);
});
