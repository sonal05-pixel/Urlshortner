// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const validUrl = require('valid-url');
const shortId = require('shortid');
require('dotenv').config();

// Initialize Express app
const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(`MongoDB connection error: ${err}`));

// Define URL Schema
const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Url = mongoose.model('Url', urlSchema);

// Define API routes
app.post('/api/shorten', async (req, res) => {
  const { originalUrl } = req.body;
  if (!validUrl.isWebUri(originalUrl)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  try {
    const existingUrl = await Url.findOne({ originalUrl });
    if (existingUrl) {
      return res.json(existingUrl);
    }
    const shortUrl = shortId.generate();
    const newUrl = new Url({ originalUrl, shortUrl });
    await newUrl.save();
    res.json(newUrl);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;
  try {
    const url = await Url.findOne({ shortUrl });
    if (url) {
      url.clicks++;
      await url.save();
      return res.redirect(url.originalUrl);
    } else {
      return res.status(404).json({ error: 'URL not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
const PORT = process.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Import dotenv package
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Access environment variables
console.log(process.env.MONGODB_URI); // Example: Print the value of MONGODB_URI environment variable



  
