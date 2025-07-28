// server.mjs
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors()); // <-- This enables CORS
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/query', async (req, res) => {
  const { csvData, userQuery } = req.body;

  if (!csvData || !userQuery) {
    return res.status(400).json({ error: 'Missing csvData or userQuery.' });
  }

  try {
    const messages = [
      {
        role: 'system',
        content: 'You are an assistant that answers questions based on spreadsheet data provided in CSV format.'
      },
      {
        role: 'user',
        content: `Spreadsheet data:
\`\`\`csv
${csvData}
\`\`\`
Question: ${userQuery}`
      }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.3
    });

    const answer = response.choices[0].message.content;
    res.json({ response: answer });
  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).json({ error: 'Failed to get response from OpenAI.' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
