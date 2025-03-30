import express from 'express';
import cors from 'cors';
import usersRouter from './routers/usersRouter.js';

// Create express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/users', usersRouter);

// Default route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});