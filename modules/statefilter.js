import { findLotsByStatus } from '../models/lots.js';
import { bot } from "../app.js";

export const stateFilterKeyboard = async (chatId) => {
    const stateData = await findLotsByStatus('new');
    if (!stateData) return;
    let allStates = [];
    stateData.forEach(item => {
        if (item?.state) {
            allStates.push(item.state)
        }});
    const statesList = allStates.filter((value, index, self) => self.indexOf(value) === index);
    const result = [];
    const chunkSize = 3; 
  
    for (let i = 0; i < statesList.length; i += chunkSize) {
      const chunk = statesList.slice(i, i + chunkSize);
      const row = chunk.map(state => ({
        text: state,
        callback_data: `state${state}`
      }));
      result.push(row);
    };
  
    bot.sendMessage(chatId, `Виберіть область:`, { reply_markup: { inline_keyboard: result } });

  }
