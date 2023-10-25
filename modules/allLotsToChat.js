import { findLotsByStatus } from '../models/lots.js';
import { bot } from "../app.js";

  const getLotContentFromData = (lot) => {
    const message = `\u{1F4CA} ${lot.area} га, ₴ ${lot.price.toFixed(2)} ( ${(lot.price/lot.area).toFixed(2)} грн/га) \n дохідність ${lot.revenue} % \n ${lot.cadastral_number} \n ${lot.state} область, ${lot.region} район \n \u{1F69C} орендар: ${lot.tenant}, ${lot.lease_term} років`;

    return message;
}
  const sendAllLots = async (chatId) => {
    const lots = await findLotsByStatus('new');
    const lotsData = lots.map(el => getLotContentFromData(el));
    const sendLotsToChat = lotsData.map(async (element, index) => {
            const rowNumber = lots[index].lotNumber;
            return bot.sendMessage(chatId, element, { reply_markup: { inline_keyboard: [[{ text: "Купити ділянку", callback_data: `${rowNumber}` }]] } });
          });   
    await Promise.all(sendLotsToChat);   
    await bot.sendMessage(chatId, `${lotsData.length} лотів доступно до покупки.` );
  };

export { sendAllLots };
