import { bot, admin } from "./app.js";
import { writeGoogle, readGoogle } from './crud.js';
import { dataBot, ranges } from './values.js';
import { logger } from './logger/index.js';
import { keyboards } from './language_ua.js';
import { findALLUsers, userIsBanUpdate, findUserByChatId, deleteUserByChatId } from './models/users.js';
import { getLotData } from './lotmanipulation.js';
import { createNewReserv } from './models/reservations.js';
import { updateDB } from "./modules/updateDatabase.js";
import { deleteLotById, updateMessageIdBybot_id } from './models/lots.js';

const getLotContentByID = async (lotNumber) => {
  const content = await readGoogle(ranges.postContentLine(lotNumber));
  const message = `\u{1F4CA} ${content[0]} \n ${content[1]} \n ${content[2]} \n ${content[3]} \n \u{1F69C} ${content[4]}`;
  return message;
}

const autoPosting = async () => {
  const statusValues = await readGoogle(ranges.statusColumn);
  const pendingLots = statusValues
    .map((value, index) => value === "pending" ? index + 1 : null)
    .filter(value => value !== null);
  const contentPromises = pendingLots.map(el => getLotContentByID(el));
  const lotsContent = await Promise.all(contentPromises);
  for (let index = 0; index < lotsContent.length; index++) {
    const element = lotsContent[index];
    const lotNumber = pendingLots[index];
    //here adding lot to database
    const newLot = await getLotData(lotNumber);

    try {
      const postedLot = await bot.sendMessage(dataBot.channelId, element, { reply_markup: keyboards.channelKeyboard });
      await sendLotToRegistredCustomers(element, lotNumber);
      if (postedLot) {
        try {
          const statusChangeResult = await writeGoogle(ranges.statusCell(lotNumber), [['new']]);

          const postingMessageIDResult = await writeGoogle(ranges.message_idCell(lotNumber), [[postedLot.message_id]]);
          console.log(newLot?.bot_id, postedLot.message_id);
          await updateMessageIdBybot_id(newLot?.bot_id, postedLot.message_id);

          if (statusChangeResult && postingMessageIDResult) {
            logger.info(`Lot ${newLot?.bot_id} successfully posted`);  
          }
        } catch (error) {
          logger.warn(`Lot ${newLot?.bot_id} posted But issues with updating sheet PLEASE CHECK spreadsheet data Error ${error}`);
        }
      }
    } catch (error) {
      logger.warn(`Something went wrong on autoposting lot ${lotNumber} Error ${error}`);
    }
  }
};


const userMenegment = () => {
  admin.on('message', async (message) => {
    const text = message.text;
    if (!text) {
      // Handle the case when text is not defined
      return;
    }
    const command = text.split(' ');
    switch (command[0]) {
      case 'update': 
        if (command[1] === 'ban') {
          const boolean = command[3] === '1' || command[3] === 'true' ? true : false;
          const banUpdated = await userIsBanUpdate(command[2], boolean);
          admin.sendMessage(message.chat.id, `User ${banUpdated} Ban status updated.`);
        }
        break;
      case 'find':
        const data = await findUserByChatId(command[1]);
        const string = JSON.stringify(data);
        admin.sendMessage(message.chat.id, string);
        break;
      case 'delete':
        const response = await deleteUserByChatId(command[1])
        if (response) {
          admin.sendMessage(message.chat.id, `User ${command[1]} delated`);
        } else {
          admin.sendMessage(message.chat.id, `User ${command[1]} delating fail`);
        }
        
        break; 
    }
  })
}

const postingLots = () => {
  admin.on('message', async (message) => {
        if (message.text < 9999999 && message.text != 1) {
          try {
            const rowNumber = parseInt(message.text);
            const newLot = await getLotData(rowNumber);
            const lot = await readGoogle(ranges.postContentLine(rowNumber));
            if (lot && lot.length > 0) {
              const message = `\u{1F4CA} ${lot[0]} \n ${lot[1]} \n ${lot[2]} \n ${lot[3]} \n \u{1F69C} ${lot[4]}`;
              
              const sentMessage = await bot.sendMessage(dataBot.channelId, message, { reply_markup: keyboards.channelKeyboard });
              await sendLotToRegistredCustomers(message, rowNumber);

              await writeGoogle(ranges.message_idCell(rowNumber), [[sentMessage.message_id]]);
              await updateMessageIdBybot_id(newLot?.bot_id, sentMessage.message_id);

            }
          } catch (error) {
            console.error(error);
          }
        }
    });
};

const addLotById = () => {
  admin.on('message', async (message) => {
    if (message.text.startsWith('add')) {
      const lotNumber = message.text.replace('add', '').trim();
      try {
        const newLot = await getLotData(lotNumber);
        admin.sendMessage(message.chat.id, `Лот №${newLot.bot_id} успішно успішно додано чи оновлено `);
      } catch (error) {
        logger.info(`Something wend wrong on updating ${newLot.bot_id}. Reason:${error}`);
      }
    } else if (message.text.startsWith('deleteLot')) {
      const bot_id = message.text.replace('deleteLot', '').trim();
      try {
        const result = await deleteLotById(bot_id);
        if (result) { 
          admin.sendMessage(message.chat.id, `Лот №${bot_id} успішно видалено з бази `);
        } else {
          admin.sendMessage(message.chat.id, `Лот №${bot_id} не знайдено в базі `);
        }
      } catch (error) {
        logger.info(`Something wend wrong on deleting: ${bot_id}. Reason:${error}`);
      }
    }
  });
};

const cuttingCallbackData = (cuttedWord, word) => {
  const regex = new RegExp(`${word}(.+)`, 'i');
  const match = cuttedWord.match(regex);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
};

const sendLotToRegistredCustomers = async (message, lotNumber) => {
  const users = await findALLUsers();
  if (!users) return;
  const usersChatId = users.map(el => el.chat_id);
  const groupSize = 25;
  for (let i = 0; i < usersChatId.length; i += groupSize) {
    const chatIdsGroup = usersChatId.slice(i, i + groupSize);
    chatIdsGroup.forEach(el => {
      try {
        bot.sendMessage(el, message, { reply_markup: { inline_keyboard: [[{ text: "Купити ділянку", callback_data: `${lotNumber}` }]] } });
      } catch (error) {
        logger.warn(`User: ${el}, Havn't received notification. Reason: ${error}`)
      }
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  logger.info(`*${usersChatId.length} користувачів отримали нагадування про новий лот*`);
};

export { postingLots, autoPosting, userMenegment, cuttingCallbackData, addLotById }
