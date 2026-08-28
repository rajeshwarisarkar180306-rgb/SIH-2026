
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./supabase');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 2. Challenges: Fetch all challenges
app.get('/api/challenges', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Challenges: Submit a new challenge
app.post('/api/challenges', async (req, res) => {
  const { title, description, category, district, media_url, submitted_by } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, error: 'Title and description are required' });
  }

  try {
    const { data, error } = await supabase
      .from('challenges')
      .insert([{ title, description, category, district, media_url, submitted_by }])
      .select();

    if (error) throw error;
    res.status(201).json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Proposals: Submit an HEI / Student Proposal
app.post('/api/proposals', async (req, res) => {
  const { challenge_id, hei_lead_id, abstract, budget_requested } = req.body;

  if (!challenge_id || !abstract || !budget_requested) {
    return res.status(400).json({ success: false, error: 'Missing required proposal fields' });
  }

  try {
    const { data, error } = await supabase
      .from('proposals')
      .insert([{ challenge_id, hei_lead_id, abstract, budget_requested }])
      .select();

    if (error) throw error;
    res.status(201).json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Sponsorships: Pledge CSR Escrow Funds
app.post('/api/pledge', async (req, res) => {
  const { challenge_id, proposal_id, sponsor_id, amount, csr_tax_ref } = req.body;

  if (!challenge_id || !amount || !sponsor_id) {
    return res.status(400).json({ success: false, error: 'Missing pledge required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('sponsorships')
      .insert([{ challenge_id, proposal_id, sponsor_id, amount, csr_tax_ref, escrow_status: 'locked' }])
      .select();

    if (error) throw error;
    res.status(201).json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Base server active on http://localhost:${PORT}`);
});

