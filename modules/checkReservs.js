import { findReservsByChatId } from '../models/reservations.js';
import { findLotByBotId } from '../models/lots.js';
import { bot } from "../app.js";

export const checkReservs = async (chatId) => {
    const reservs = await findReservsByChatId(chatId);
    if (!reservs || reservs.lenght == 1) {
        return true;
    } else {
        await bot.sendMessage(chatId, `Ваші заброньовані ділянки:`);
        reservs.forEach(async item => {
            console.log(`LANDS: ${item.bot_id}`);
            const lot = await findLotByBotId(item.bot_id);
            console.log(`BASE:${JSON.stringify(lot)}`);
            if (lot) {
                bot.sendMessage(chatId, `📊 ${lot.area} га, ₴  ${lot.price} ( ${(lot.price/lot.area).toFixed(2)} грн/га) 
дохідність ${lot.revenue}% 
очікуваний річний дохід  ${lot.price*lot.revenue/100} грн
${lot.cadastral_number} 
${lot.state} область, ${lot.region} район 
🚜 орендар: ${lot.tenant} , ${lot.lease_term} років
                  
            `, { reply_markup: { inline_keyboard: [[{ text: "Купити ділянку", callback_data: `${lot.lotNumber}` }]] } });
            }
            
        })
      
    }
} 