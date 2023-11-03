import express from 'express';
const app = express();
const port = 3001;
import { findAllLots } from '../models/lots.js';

export const apiServer = () => {
    app.listen(port, () => {
        console.log(`Server ON ${port}`);
      });
      
      app.get('/api/lots', async (req, res) => {
          // Отримати список користувачів з бази даних
          const users = await findAllLots();
          res.json(users);
      });
        
      app.post('/api/lots', (req, res) => {
          const command = req.body;
          console.log(command);
          //const newUser = /* ... */;
          res.status(201).json('newUser');
      });
        
}

