import { dataBot } from '../values.js';
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot('', { polling: true });

const sendDB = async () => {
    try {
        bot.sendDocument(dataBot.loggerId, '../db.db')
    } catch (error) {console.log(error)}
  };
  
const timerForDBbackup = () => {
    const now = new Date();
    const hour = now.getUTCHours();
    console.log(hour);
    const minute = now.getUTCMinutes();
    console.log(minute);
    if (hour === 6  && minute === 0) {
        sendDB();
    } else if (hour === 18 && minute === 0) {
        sendDB();
    }
  };

setInterval(timerForDBbackup, 60000);
  
  
  