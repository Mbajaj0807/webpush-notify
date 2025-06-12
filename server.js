const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

webpush.setVapidDetails(
  'mailto:example@example.com',
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);


const Subscription = require('./models/subscription');

app.post('/subscribe', async (req, res) => {
  const newSub = req.body;

  try {
    const existing = await Subscription.findOne({ endpoint: newSub.endpoint });

    if (!existing) {
      await Subscription.create(newSub);
      console.log('Subscription stored in DB.');
    } else {
      console.log('Subscription already exists in DB.');
    }

    res.status(201).json({});
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


app.post('/send-notification', async (req, res) => {
  const payload = JSON.stringify({
    title: 'Stock Alert',
    body: 'Your item is out of stock!'
  });

  try {
    const allSubs = await Subscription.find();

    for (const sub of allSubs) {
      try {
        await webpush.sendNotification(sub, payload);
      } catch (err) {
        console.error('Failed to send notification to', sub.endpoint);
      }
    }

    res.status(200).json({ message: 'Notifications sent.' });
  } catch (err) {
    console.error('DB read error:', err);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});




app.get('/vapidPublicKey', (req, res) => {
  res.send(process.env.PUBLIC_VAPID_KEY);
});
console.log("Public VAPID Key:", process.env.PUBLIC_VAPID_KEY);

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
