import express from 'express';
import bodyParser from 'body-parser';
const app = express();
const port = 3001;
import { findAllLots, deleteLotById, updateLotBybot_id } from '../models/lots.js';

export const apiServer = () => {
    app.use(bodyParser.json());
    
    app.listen(port, () => {
        console.log(`Server ON ${port}`);
      });
      
      app.get('/api/lots', async (req, res) => {
          // Отримати список користувачів з бази даних
          const users = await findAllLots();
          res.json(users);
      });
        
      app.post('/api/lots', async (req, res) => {
          const command = req.body;
          console.log(command);
          if (command?.action === 'delete') {
            const removingLot = await deleteLotById(command?.bot_id);
            res.json(removingLot);
          }
          if (command?.action === 'update') {
            const updatingLot = await updateLotBybot_id(command?.bot_id, command?.lotData);
            res.json(updatingLot);
          }
          console.log(command);
          //const newUser = /* ... */;
          //res.status(201).json('newUser');
      });
        
}

