require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const importedSupabase = require('./supabase');
const supabase = importedSupabase.supabase || importedSupabase;

const app = express();
app.use(cors());
app.use(express.json());

function getClassifierPath() {
  const possiblePaths = [
    path.resolve(__dirname, 'sih-ai-services/classifier.py'),
    path.resolve(__dirname, '../sih-ai-services/classifier.py'),
    path.resolve(__dirname, 'SIH-2026/sih-ai-services/classifier.py'),
    'C:/Users/deepa/sih-backend/SIH-2026/sih-ai-services/classifier.py',
    'C:/Users/deepa/OneDrive/Documents/SIH/SIH-2026/sih-ai-services/classifier.py'
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return possiblePaths[0];
}

function isValidUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function classifyProblemText(text) {
  return new Promise((resolve) => {
    const sanitized = text.replace(/"/g, '\\"');
    const scriptPath = getClassifierPath();

    exec(`python "${scriptPath}" "${sanitized}"`, (err, stdout, stderr) => {
      if (err) {
        return resolve({
          category: "General Public Works",
          assigned_hei_id: null,
          confidence_score: 0.50
        });
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (e) {
        resolve({
          category: "General Public Works",
          assigned_hei_id: null,
          confidence_score: 0.50
        });
      }
    });
  });
}

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// 2. Submit Problem / Challenge
app.post('/api/problems', async (req, res) => {
  try {
    const { title, description, location } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const fullDescription = location ? `${description} (Location: ${location})` : description;
    const aiResult = await classifyProblemText(`${title} ${fullDescription}`);
    const heiUUID = isValidUUID(aiResult.assigned_hei_id) ? aiResult.assigned_hei_id : null;

    // Schema payload - lets Supabase apply the table's default status
    const payload = {
      title,
      description: fullDescription,
      category: aiResult.category,
      assigned_hei_id: heiUUID
    };

    const { data, error } = await supabase
      .from('challenges')
      .insert([payload])
      .select();

    if (error) throw error;

    res.status(201).json({
      message: 'Problem submitted and classified successfully',
      data: {
        ...data[0],
        ai_recommendation: {
          category: aiResult.category,
          recommended_hei: aiResult.assigned_hei_id,
          confidence_score: aiResult.confidence_score
        }
      }
    });
  } catch (err) {
    console.error('Submission Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// 3. Fetch Challenges (For HEI Portal & Citizen Dashboard)
app.get('/api/problems', async (req, res) => {
  try {
    const { hei_id, category, status } = req.query;
    let query = supabase.from('challenges').select('*').order('created_at', { ascending: false });

    if (hei_id && isValidUUID(hei_id)) query = query.eq('assigned_hei_id', hei_id);
    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    res.status(200).json({ problems: data });
  } catch (err) {
    console.error('Fetch Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

