import { bot } from '../app.js';
import { dataBot } from '../values.js';

 const sendDB = async () => {
    try {
        bot.sendDocument(dataBot.loggerId, '../db.db')
    } catch (error) {console.log(error)}
  };
  
export const timerForDBbackup = () => {
    const now = new Date();
    const hour = now.getUTCHours();
    const minute = now.getUTCMinutes();
    if (hour === 6  && minute === 0) {
        sendDB();
    } else if (hour === 18 && minute === 0) {
        sendDB();
    }
  };
  
  
  