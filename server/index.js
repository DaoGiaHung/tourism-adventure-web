const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory data
let checkpoints = [
  {
    id: 'cp-1',
    name: 'Grand Central Terminal',
    description: 'Historic transportation hub',
    address: '89 E 42nd St, New York, NY 10017, USA',
    latitude: 40.7527,
    longitude: -73.9772,
    radius: 100,
    type: 'landmark',
    difficulty: 'easy',
    reward: '5 coins',
    unlocksNearby: ['cp-2','cp-3'],
    questions: [
      { id: 'q-1', text: 'What year did Grand Central open?', options: ['1913','1920','1930','1940'], correctAnswer: 0 }
    ]
  },
  {
    id: 'cp-2',
    name: 'Times Square',
    description: 'Famous entertainment district',
    address: 'Manhattan, NY 10036, USA',
    latitude: 40.758,
    longitude: -73.9855,
    radius: 150,
    type: 'landmark',
    difficulty: 'medium',
    reward: '10 coins',
  },
  {
    id: 'cp-3',
    name: 'Bryant Park',
    description: 'Public park in midtown',
    address: 'Between 40th and 42nd St & 5th and 6th Ave, New York, NY 10018, USA',
    latitude: 40.7536,
    longitude: -73.9832,
    radius: 80,
    type: 'natural',
    difficulty: 'easy',
    reward: '3 coins',
  }
];

let visits = [];

function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (n) => (n * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1)*Math.cos(φ2) * Math.sin(Δλ/2)*Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

app.get('/api/checkpoints', (req, res) => {
  res.json(checkpoints);
});

app.get('/api/checkpoints/nearby', (req, res) => {
  const lat = parseFloat(req.query.latitude);
  const lon = parseFloat(req.query.longitude);
  const radius = parseInt(req.query.radius || '5000', 10);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return res.status(400).json({ error: 'latitude and longitude required' });
  }

  const nearby = checkpoints.map(cp => ({
    ...cp,
    distance: Math.round(distanceMeters(lat, lon, cp.latitude, cp.longitude))
  })).filter(cp => cp.distance <= (cp.radius || 0) + radius);

  res.json(nearby);
});

app.get('/api/checkpoints/:id', (req, res) => {
  const id = req.params.id;
  const cp = checkpoints.find(c => c.id === id);
  if (!cp) return res.status(404).json({ error: 'not found' });
  res.json(cp);
});

app.post('/api/visits', (req, res) => {
  const { userId, checkpointId, method, location } = req.body;
  if (!checkpointId || !method || !location) return res.status(400).json({ error: 'missing fields' });

  const id = uuidv4();
  const visitedAt = Date.now();
  const visit = { id, userId: userId || 'anonymous', checkpointId, method, location, visitedAt };
  visits.push(visit);

  const cp = checkpoints.find(c => c.id === checkpointId);
  res.json({ success: true, id, reward: cp?.reward || null, unlockedNearby: cp?.unlocksNearby || [] });
});

app.get('/api/visits/history', (req, res) => {
  const userId = req.query.userId || 'anonymous';
  const userVisits = visits.filter(v => v.userId === userId || userId === 'anonymous');
  res.json(userVisits);
});

app.post('/api/qr-code/verify', (req, res) => {
  const { qrData } = req.body;
  // expected format: checkpoint:ID:token
  if (!qrData || typeof qrData !== 'string') return res.status(400).json({ valid: false });
  const parts = qrData.split(':');
  if (parts.length < 2) return res.json({ valid: false });
  const id = parts[1];
  const cp = checkpoints.find(c => c.id === id);
  if (!cp) return res.json({ valid: false });
  res.json({ valid: true, checkpointId: id, checkpointName: cp.name });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Mock server running on http://localhost:${port}`));
