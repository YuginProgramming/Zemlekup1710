import { dataBot } from './values.js';
import { bot } from "./app.js";
import { logger } from './logger/index.js';
import { messageText } from './modules/ordermessage.js';
import { findLotByBotId, updateStatusAndUserIdBybot_id } from './models/lots.js';
import { updateStatusColumnById } from './modules/updateStatusColumnById.js';
import { clearResrvBybot_id } from './models/reservations.js';

//Цей файл працює на bot_id І вичищений від сміття

const reservReminderTimerScript = async (bot_id, chat_id) => {
    setTimeout(async () => {

        const lotData = await findLotByBotId(bot_id);
        const message = messageText(lotData);

        if (lotData?.lot_status === 'reserve') {
            try {
                await bot.sendMessage(chat_id, 'Ви забронювали ділянку, завершіть замовлення. Незабаром ділянка стане доступною для покупки іншим користувачам');
                await bot.sendMessage(chat_id, message, { reply_markup: { inline_keyboard: [[{ text: "Купити ділянку", callback_data: `${lotData?.lotNumber}` }]] } });
                logger.info(`USER ID: ${chat_id}  received first reminder about lotID: ${bot_id}`);
            } catch (error) {
                logger.error(`Impossible to send remind about lotID: ${bot_id}. Error: ${err}`);
            }

            setTimeout(async () => {
                const lotData = await findLotByBotId(bot_id);

                if (lotData?.lot_status === 'reserve') {
                    try {
                        bot.sendMessage(chat_id, 'Ділянка яку ви бронювали доступна для покупки');

                        await updateStatusColumnById('new', bot_id);
                        await updateStatusAndUserIdBybot_id(bot_id, 'new', '');

                        await clearResrvBybot_id(bot_id);

                        await editingMessage(bot_id, "Знову доступна 😉 \n ");

                        await bot.sendMessage(chat_id, message, { reply_markup: { inline_keyboard: [[{ text: "Купити ділянку", callback_data: `${lotData?.lotNumber}` }]] } });
                        logger.info(`USERID: ${chat_id} received second reminder about lotID${bot_id}. Lot avaliable for selling again ⛵`);
                    } catch (error) {
                        logger.error(`Impossible to send remind about lotID${bot_id}. Error: ${error}`);
                    }

                    setTimeout(async () => {
                        const lotData = await findLotByBotId(bot_id);
                        if (lotData?.lot_status === 'new') {
                            try {
                                await bot.sendMessage(chat_id, 'Ділянка якою ви цікавились ще не продана');
                                await bot.sendMessage(chat_id, message, { reply_markup: { inline_keyboard: [[{ text: "Купити ділянку", callback_data: `${lotData?.lotNumber}` }]] } });
                                logger.info(`USERID: ${chat_id} received LAST CHANCE 🚸 remind about lot${lotData?.lotNumber}`);
                            } catch (error) {
                                logger.error(`Impossible to send remind about lot#${rowNumber}. Error: ${err}`);
                            }
                        } else return false;

                    }, dataBot.lastChanceFirst);

                } else return false;

            }, dataBot.secondReminder);

        } else return false;

    }, dataBot.firstReminder);
}

const editingMessage = async (bot_id, note) => {
    const lotData = await findLotByBotId(bot_id);

    const message = messageText(lotData);
    const newMessage = `${note + message}`;
    
    try {
        await bot.editMessageText(newMessage, {chat_id: dataBot.channelId, message_id: lotData?.message_id});
    } catch (error) {
        logger.warn(`Неможливо відредагувати повідомлення. ID повідомлення ${lotData?.message_id}. Reason: ${error}`);
    }
  } 

export { editingMessage, reservReminderTimerScript };