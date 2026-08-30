require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');

const importedSupabase = require('./supabase');
const supabase = importedSupabase.supabase || importedSupabase;

const app = express();

// Enable CORS for Next.js frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Setup Multer for memory storage (Images & PDF documents)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// FastAPI Microservice URL
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

function isValidUUID(str) {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Keyword Fallback Classifier
function keywordFallbackClassifier(text) {
  const lower = text.toLowerCase();
  
  if (lower.includes('road') || lower.includes('pothole') || lower.includes('bridge') || lower.includes('traffic') || lower.includes('drain')) {
    return { category: 'Urban Infrastructure', assigned_hei_id: null, confidence_score: 0.85 };
  }
  if (lower.includes('water') || lower.includes('leak') || lower.includes('pipeline') || lower.includes('sewage')) {
    return { category: 'Water & Sanitation', assigned_hei_id: null, confidence_score: 0.88 };
  }
  if (lower.includes('light') || lower.includes('power') || lower.includes('electric') || lower.includes('solar') || lower.includes('energy')) {
    return { category: 'Energy & Power Systems', assigned_hei_id: null, confidence_score: 0.90 };
  }
  if (lower.includes('waste') || lower.includes('garbage') || lower.includes('trash') || lower.includes('pollution')) {
    return { category: 'Waste Management', assigned_hei_id: null, confidence_score: 0.82 };
  }
  
  return { category: 'General Public Works', assigned_hei_id: null, confidence_score: 0.60 };
}

// Microservice HTTP Poster
async function classifyProblemText(title, description, fileBuffer, fileName) {
  try {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);

    if (fileBuffer) {
      formData.append('image', fileBuffer, fileName || 'upload.jpg');
    }

    const response = await axios.post(`${FASTAPI_URL}/classify-and-route`, formData, {
      headers: formData.getHeaders(),
      timeout: 10000 
    });

    return {
      category: response.data.predicted_category,
      assigned_hei_id: response.data.assigned_university,
      confidence_score: response.data.confidence_score,
      extracted_location: response.data.extracted_location,
      ocr_applied: response.data.ocr_applied
    };
  } catch (error) {
    console.warn('[AI Warning] FastAPI connection failed. Using fallback:', error.message);
    return keywordFallbackClassifier(`${title} ${description}`);
  }
}

// 1. Health Check
app.get('/api/health', async (req, res) => {
  let aiStatus = 'offline';
  try {
    const aiRes = await axios.get(`${FASTAPI_URL}/health`);
    if (aiRes.status === 200) aiStatus = 'online';
  } catch (e) {
    aiStatus = 'unreachable';
  }

  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date(), 
    ai_microservice: aiStatus 
  });
});

// 2. Submit Problem / Challenge
app.post('/api/problems', upload.single('image'), async (req, res) => {
  try {
    const { title, description, location } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const aiResult = await classifyProblemText(
      title, 
      description, 
      req.file ? req.file.buffer : null, 
      req.file ? req.file.originalname : null
    );

    const heiUUID = isValidUUID(aiResult.assigned_hei_id) ? aiResult.assigned_hei_id : null;
    const finalLocation = location || aiResult.extracted_location || null;

    const payload = {
      title,
      description: finalLocation ? `${description} (Location: ${finalLocation})` : description,
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
          confidence_score: aiResult.confidence_score,
          extracted_location: aiResult.extracted_location,
          ocr_applied: aiResult.ocr_applied
        }
      }
    });
  } catch (err) {
    console.error('Submission Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// 3. Check Duplicate Endpoint
app.post('/api/problems/check-duplicate', async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: 'Description is required' });

    const { data: existingProblems, error } = await supabase
      .from('challenges')
      .select('description')
      .limit(100);

    if (error) throw error;

    const existingDescriptions = existingProblems.map(p => p.description);

    const aiResponse = await axios.post(`${FASTAPI_URL}/check-duplicate`, {
      new_description: description,
      existing_descriptions: existingDescriptions
    });

    res.status(200).json(aiResponse.data);
  } catch (err) {
    console.error('Deduplication Error:', err.message);
    res.status(500).json({ error: 'Failed to perform duplicate check' });
  }
});

// 4. Fetch Challenges
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

// 5. Update Problem Status & Assignment
app.patch('/api/problems/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_hei_id } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid problem ID format' });
    }

    const updatePayload = {};
    if (status) updatePayload.status = status;
    if (assigned_hei_id && isValidUUID(assigned_hei_id)) {
      updatePayload.assigned_hei_id = assigned_hei_id;
    }

    const { data, error } = await supabase
      .from('challenges')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.status(200).json({ message: 'Status updated successfully', data: data[0] });
  } catch (err) {
    console.error('Status Update Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// 6. Submit Solution Proposal (Supports PDF file attachment & Multipart form-data)
app.post('/api/problems/:id/solutions', upload.single('proposal'), async (req, res) => {
  try {
    const { id: problem_id } = req.params;
    const { abstract, proposal_text, description, hei_lead_id, hei_id, faculty_mentor, student_lead, budget_requested, estimated_budget } = req.body;

    if (!isValidUUID(problem_id)) {
      return res.status(400).json({ error: 'Invalid problem ID format' });
    }

    const proposalAbstract = abstract || proposal_text || description || `Submitted by ${student_lead || 'Student Lead'}`;
    const leadId = hei_lead_id || hei_id;
    const budget = budget_requested || estimated_budget;

    const payload = {
      challenge_id: problem_id,
      abstract: proposalAbstract,
      faculty_mentor: faculty_mentor || null,
      student_lead: student_lead || null,
      hei_lead_id: isValidUUID(leadId) ? leadId : null,
      budget_requested: budget ? Number(budget) : null
    };

    const { data, error } = await supabase
      .from('proposals')
      .insert([payload])
      .select();

    if (error) throw error;

    res.status(201).json({ message: 'Solution proposal submitted successfully', data: data[0] });
  } catch (err) {
    console.error('Solution Submission Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Gateway active on http://localhost:${PORT}`);
});