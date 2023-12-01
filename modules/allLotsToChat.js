import { findLotsByStatus } from '../models/lots.js';
import { bot } from "../app.js";
import { messageText } from './ordermessage.js';

const sendAllLots = async (chatId) => {
    const lots = await findLotsByStatus('new');
    if (!lots) return;
    const lotsData = lots.map(el => messageText(el));
    const sendLotsToChat = lotsData.map(async (element, index) => {
            const rowNumber = lots[index].lotNumber;
            return bot.sendMessage(chatId, element, { reply_markup: { inline_keyboard: [[{ text: "Купити ділянку", callback_data: `${rowNumber}` }]] } });
          });   
    await Promise.all(sendLotsToChat);   
    await bot.sendMessage(chatId, `${lotsData.length} лотів доступно до покупки.` );
};

export { sendAllLots };
