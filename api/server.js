import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import pool from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Notes API is running 🚀');
});

app.post('/notes', async (req, res) => {
  const { session_id, note_title, note } = req.body;
  if (!session_id || !note_title || !note)
    return res.status(400).json({ error: 'title and content are required' });

  try {
    const result = await pool.query(
      'INSERT INTO notes (session_id, note_title, note) VALUES ($1, $2, $3) RETURNING *',
      [session_id, note_title, note]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting note:', err);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// Get all notes
app.get('/notes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
