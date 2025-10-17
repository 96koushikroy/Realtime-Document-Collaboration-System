import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import { initPinecone } from "./db.js"
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
    const saved = result.rows[0];
    const pc = req.app.locals.pinecone;
    const vectorId = `note-${saved.id}`;
    await upsertToPinecone(pc, vectorId, session_id, note_title, note);

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

async function upsertToPinecone(pineconeClient, note_id, session_id, note_title, note) {
  if (!pineconeClient) {
    throw new Error('Pinecone client not available');
  }
  const namespace = pineconeClient.index("my-notes-index", "https://my-notes-index-pxln6de.svc.aped-4627-b74a.pinecone.io").namespace("__default__");

  await namespace.upsertRecords([
    {
      "_id": note_id,
      "chunk_text": `${note_title}: ${note}`,
      "session_id": session_id,
      "note_title": note_title,
      "note": note
    },
  ]);
}

async function start() {
  try {
    const pc = await initPinecone()
    console.log("Pinecone initialized")
    // optionally keep pc for use elsewhere; attach to app.locals
    app.locals.pinecone = pc
  } catch (err) {
    console.error("Failed to init Pinecone:", err)
  }

  const port = process.env.PORT || 3000
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`)
  })
}

start().catch((err) => {
  console.error("Fatal error starting server:", err)
  process.exit(1)
})
