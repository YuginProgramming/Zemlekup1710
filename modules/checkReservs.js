import { findReservsByChatId } from '../models/reservations.js';
import { findLotByBotId } from '../models/lots.js';
import { bot } from "../app.js";
import { messageText } from './ordermessage.js';

export const checkReservs = async (chatId) => {
    const reservs = await findReservsByChatId(chatId);
    if (!reservs || reservs.lenght == 1) {
        return true;
    } else {
        await bot.sendMessage(chatId, `Ваші заброньовані ділянки:`);
        reservs.forEach(async item => {

            const lot = await findLotByBotId(item.bot_id);
            
            if (lot) {
                bot.sendMessage(chatId, messageText(lot), { reply_markup: { inline_keyboard: [[{ text: "Купити ділянку", callback_data: `${lot.lotNumber}` }]] } });
            }
            
        })
      
    }
} 