import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    application: 'GameVault API',
    message: 'Backend is working correctly.'
  });
});

app.listen(port, () => {
  console.log(`GameVault API is running at http://localhost:${port}`);
});