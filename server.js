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
  const subscription = req.body;

  if (!subscription?.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription object' });
  }

  try {
    await Subscription.updateOne(
      { endpoint: subscription.endpoint },
      subscription,
      { upsert: true }
    );

    res.status(201).json({ message: 'Subscription saved successfully' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});



app.post('/send-notification', async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required.' });
  }

  const payload = JSON.stringify({ title, body });

  try {
    const subscriptions = await Subscription.find(); 

    if (subscriptions.length === 0) {
      return res.status(404).json({ message: 'No subscriptions found.' });
    }

    for (const sub of subscriptions) {
      await webpush.sendNotification(sub, payload).catch(err => {
        console.error('Error sending to a subscription:', err.message);
      });
    }

    res.status(200).json({ message: 'Notifications sent.' });
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ error: 'Failed to send notifications.', details: error.message });
  }
});



app.get('/vapidPublicKey', (req, res) => {
  res.send(process.env.PUBLIC_VAPID_KEY);
});
console.log("Public VAPID Key:", process.env.PUBLIC_VAPID_KEY);

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
