import express from 'express';
import cors from 'cors';
import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const hf = new HfInference(process.env.HF_TOKEN);

app.post('/api/embeddings', async (req, res) => {
  try {
    const { text, model = 'sentence-transformers/paraphrase-multilingual-mpnet-base-v2' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const output = await hf.featureExtraction({
      model: model,
      inputs: text,
    });

    res.json({ embeddings: output });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
