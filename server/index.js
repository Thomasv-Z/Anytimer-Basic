const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const dbConnect = require('./db/dbConnect');
const DataSchema = require('./db/resDataModel');
const UserModel = require('./db/usersModel'); // Import the user model

const app = express();
const port = process.env.PORT || '3000';
dbConnect();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Define HTTP routes
app.post("/api/:randomEndpoint", async (req, res) => {
  const { code, message } = req.body;
  if (code == 200 && message == 'con-succes') {
    console.log('AnyTimer successfully connected');
    return res.status(200).json({ message: 'AnyTimer successfully connected' });
  } else {
    await saveData(req, res);
  }
});

async function saveData(req, res) {
  const { uid, time } = req.body;
  const randomEndpoint = req.params['randomEndpoint'];

  if (!uid || !time) {
    return res.status(400).json({ message: 'Validation error: Missing uid or time' });
  }

  try {
    // Check if UID already exists in UserModel
    const existingUser = await UserModel.findOne({ uid });

    if (!existingUser) {
      // UID not found, proceed with saving the new data
      let DynamicModel = mongoose.models[randomEndpoint] || mongoose.model(randomEndpoint, DataSchema, randomEndpoint);
      const data = new DynamicModel({ uid, time });
      const result = await data.save();

      console.log('Data saved successfully:', result);

      // Broadcast the new score to all connected WebSocket clients
      broadcastNewScore(result);

      res.status(200).json({ message: 'Data saved successfully', data: result });
    } else {
      // UID already exists, no action required
      res.status(200).json({ message: 'UID already exists' });
    }
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ message: 'Error saving data' });
  }
}

// Define other HTTP endpoints
app.get("/api/:randomEndpoint", async (req, res) => {
  const randomEndpoint = req.params['randomEndpoint'];
  try {
    let DynamicModel = mongoose.models[randomEndpoint];
    if (!DynamicModel) {
      return res.status(404).json({ message: 'Model not found' });
    }
    const data = await DynamicModel.find();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data' });
  }
});

app.get("/api/device/endpoints", async (req, res) => {
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

app.post("/api/user/saveUser", async (req, res) => {
  const { uid, name } = req.body;

  if (!uid || !name) {
    return res.status(400).json({ message: 'Validation error: Missing uid or name' });
  }

  try {
    const user = new UserModel({ uid, user: name });
    const result = await user.save();

    console.log('User saved successfully:', result);
    res.status(200).json({ message: 'User saved successfully', data: result });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ message: 'Error saving user' });
  }
});

// Set up WebSocket server
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Function to broadcast new scores to all connected clients
  const broadcastNewScore = (score) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(score));
      }
    });
  };

  // Handle new scores from HTTP requests and broadcast them
  app.post("/api/:randomEndpoint", async (req, res) => {
    const { code, message } = req.body;
    if (code == 200 && message == 'con-succes') {
      console.log('AnyTimer successfully connected');
      return res.status(200).json({ message: 'AnyTimer successfully connected' });
    } else {
      await saveData(req, res);
    }
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});