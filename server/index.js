const express = require('express');
const cors = require('cors');
const dbConnect = require("./db/dbConnect");
const DataSchema = require("./db/resDataModel");
const path = require('path');
const mongoose = require('mongoose');
const WebSocket = require('ws'); // Import WebSocket

const app = express();
const port = process.env.PORT || '3000';
dbConnect();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Set up WebSocket server
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Function to send new scores to connected clients
  const sendNewScore = (score) => {
    ws.send(JSON.stringify(score));
  };

  // Endpoint to save score and notify clients
  app.post("/api/:randomEndpoint", (req, res) => {
    const { code, message } = req.body;
    if (code == 200 && message == 'con-succes') {
      console.log('AnyTimer successfully connected');
      return res.status(200).json({ message: 'AnyTimer successfully connected' });
    } else {
      saveData(req, res, sendNewScore);
    }
  });

  async function saveData(req, res, sendNewScore) {
    const { uid, time } = req.body;
    const randomEndpoint = req.params['randomEndpoint'];

    if (!uid || !time) {
      return res.status(400).json({ message: 'Validation error: Missing uid or time' });
    }

    try {
      let DynamicModel = mongoose.models[randomEndpoint] || mongoose.model(randomEndpoint, DataSchema, randomEndpoint);
      const data = new DynamicModel({ uid, time });
      const result = await data.save();

      console.log('Data saved successfully:', result);
      sendNewScore(result); // Notify clients with new score
      res.status(200).json({ message: 'Data saved successfully', data: result });
    } catch (error) {
      console.error('Error saving data:', error);
      res.status(500).json({ message: 'Error saving data' });
    }
  }
});

// Endpoint to get filtered collections
app.get("/api/endpoints", async (req, res) => {
  try {
    const allEndpoints = await mongoose.connection.db.listCollections().toArray();
    const filteredEndpoints = allEndpoints.filter(
      (endpoint) => !['users', 'roles'].includes(endpoint.name)
    );
    res.status(200).json(filteredEndpoints);
  } catch (error) {
    console.error('Error fetching endpoints:', error);
    res.status(500).json({ message: 'Error fetching endpoints' });
  }
});

// Endpoint to get data from a specific collection
app.get("/api/:randomEndpoint", async (req, res) => {
  const randomEndpoint = req.params['randomEndpoint'];
  try {
    let DynamicModel = mongoose.models[randomEndpoint];
    const data = await DynamicModel.find();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data' });
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
