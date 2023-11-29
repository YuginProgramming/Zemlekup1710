import { bot } from "./app.js";
import { editingMessage, editingMessageCompleate, reservReminderTimerScript } from './interval.js';
import { phrases, keyboards } from './language_ua.js';
import { cuttingCallbackData } from './postingLot.js';
import { logger } from './logger/index.js';
import { 
  updateRecentMessageByChatId,
  updateChatStatusByChatId,
  createNewUserByChatId,
  updateUserByChatId,
  findUserByChatId
} from './models/users.js';
import { updateReservist_idByLotNumber, findReservByLotNumber, clearResrvBybot_id, findReservsByChatId } from './models/reservations.js';
import { updateStatusAndUserIdBybot_id, updateLotIDByLotNumber, findLotBylotNumber, updateStatusByLotNumber, findLotsByStatusAndChatID } from './models/lots.js';
import { myLotsDataList } from './modules/mylots.js';
import { addUserToWaitingList } from './modules/waitinglist.js';
import { getLotData } from './lotmanipulation.js';
import { regionFilterKeyboard, sendFiltredByRegToChat } from './modules/regionfilter.js';
import { stateFilterKeyboard } from './modules/statefilter.js';
import { sendAllLots } from './modules/allLotsToChat.js';
import { messageText } from './modules/ordermessage.js';
import { checkReservs } from './modules/checkReservs.js';
import { updateStatusColumnById, updateCustomerDataById } from './modules/updateStatusColumnById.js';


export const anketaListiner = async() => {
    bot.setMyCommands([
      {command: '/start', description: 'Почати'},
      {command: '/list', description: 'Показати усі доступні лоти'},
      {command: '/filter', description: 'Фільтрувати ділянки за областями'},
      {command: '/reserved', description: 'Переглянути заброньовані ділянки'},
      {command: '/mylots', description: 'Переглянути придбані ділянки'}
    ]);

    bot.on("callback_query", async (query) => {
      const action = query.data;
      const chatId = query.message.chat.id;
      const userInfo = await findUserByChatId(chatId);
      
      
      const checkRegex = (string, word) => {
        const regex = new RegExp(`${word}\\p{L}+`, 'gu');
        return regex.test(string);
      }

      if (userInfo?.isBan) {
        await bot.sendMessage(chatId, `Відсутні доступні для купівлі ділянки`);
        return
      } else if(!isNaN(Number(action))) {

          let lotData = await findLotBylotNumber(action);
          if (!lotData) {
              const newLot = await getLotData(action);
              lotData = await findLotBylotNumber(action);
          } else {
              const reserv = await findReservByLotNumber(lotData?.bot_id);
              if (!reserv) {
                lotData = await getLotData(action);
              }
          }
          const reserv = await findReservByLotNumber(lotData?.bot_id);

          if (lotData.lot_status === 'new' || reserv?.reservist_id == chatId ) {
              try {
                  if (!userInfo) await createNewUserByChatId(chatId);

                  await updateStatusColumnById('reserve', lotData?.bot_id);
                  await updateStatusAndUserIdBybot_id(lotData?.bot_id, 'reserve', chatId);
                  
                  await editingMessage(lotData?.bot_id, "РЕЗЕРВ 🙄 \n");

                  if (userInfo?.isAuthenticated) {
                      logger.info(`*User: ${userInfo?.firstname} reserved lot#${action}. Contact information: ${userInfo?.contact}*`);
                  } else {
                      logger.info(`*Unregistred user reserved lot#${action}, USERID: ${chatId}* `);
                  }

                  await updateChatStatusByChatId(chatId, '');
              } catch (error) {
                  logger.warn(`Impossible reserve lot#${action}. Error: ${error}`);
              }

              try {
                  await updateReservist_idByLotNumber(chatId, lotData.bot_id); 
              } catch (error) {
                  logger.warn(`Impossible to write chatId#${chatId} to *RESERV* sheet. Error: ${error}`);
              }
              
              reservReminderTimerScript(lotData?.bot_id, chatId);

              await updateUserByChatId(chatId, { lotNumber: action });

              if (userInfo?.isAuthenticated) {
                const message = await bot.sendMessage(chatId, `Раді вас знову бачити ${userInfo.firstname}`, { reply_markup: keyboards.finishOrder });
                await updateRecentMessageByChatId(chatId, message.message_id);  
              } else {
                const message = await bot.sendMessage(chatId, phrases.contactRequest, { reply_markup: keyboards.contactRequestInline });
                await updateRecentMessageByChatId(chatId, message.message_id);  
              }

          } else if (lotData.lot_status === 'reserve') {

              bot.sendMessage(chatId, 'Ділянку заброньовано');
            /*
              const waitlist = await addUserToWaitingList(lotData.bot_id, chatId);

              if (waitlist) {
                  await bot.sendMessage(chatId, `${phrases.waitlist}${waitlist}`);
              } else {
                  await bot.sendMessage(chatId, phrases.alreadyWaiting);
              }
          */
          } else if (lotData.lot_status === 'done') {

              bot.sendMessage(chatId, phrases.aleadySold);

          }
          //тут поки приховали
          
          /*
          const reservs = await checkReservs(chatId);
          if (!reservs) return;
          */
      } else if(checkRegex(action, 'state')) {
        const stateName = cuttingCallbackData(action, 'state');
        await regionFilterKeyboard(chatId, stateName);
      } else if(checkRegex(action, 'region')) {
       const regionName = cuttingCallbackData(action, 'region');
       await sendFiltredByRegToChat(chatId, regionName);
    }
      switch (action) {
        case '/start':
          bot.deleteMessage(chatId, userInfo?.recentMessage).catch((error) => {logger.warn(`Помилка видалення повідомлення: ${error}`);});
          const message3 = bot.sendMessage(chatId, phrases.greetings, { reply_markup: keyboards.listInline });
          await updateRecentMessageByChatId(chatId, message3.message_id);
          break;
        case '/filter': 
          await stateFilterKeyboard(chatId);
          //await filterKeyboard(chatId, 'Область', ranges.stateColumn);
          break;
        case '/list':
          bot.deleteMessage(chatId, userInfo?.recentMessage).catch((error) => {logger.warn(`Помилка видалення повідомлення: ${error}`);});
          await sendAvaliableToChat(chatId, bot);
          break;
        case '/autocontact':
          bot.deleteMessage(chatId, userInfo?.recentMessage).catch((error) => {logger.warn(`Помилка видалення повідомлення: ${error}`);});
          const message = await bot.sendMessage(chatId, `Для користувачів Telegram WEB` , {
            reply_markup: { inline_keyboard: [[{ text: 'Ввести контакти', callback_data: '/manualcontact' }]] },
          });
          bot.sendMessage(chatId, 'Натисніть на кнопку "Легко поділитися номером" щоб ми отримали доступ до вашого номеру телефону' ,{ reply_markup: { keyboard: [[{ text: 'Легко поділитися номером', request_contact: true, } ]], resize_keyboard: true, one_time_keyboard: true }});  
          await updateRecentMessageByChatId(chatId, message.message_id);
          break;
        case  '/manualcontact':
          bot.deleteMessage(chatId, userInfo?.recentMessage).catch((error) => {logger.warn(`Помилка видалення повідомлення: ${error}`);});
          await updateChatStatusByChatId(chatId, 'phoneManual')
          const message1 = await bot.sendMessage(chatId, phrases.phoneRules, {
            reply_markup: { inline_keyboard: [[{ text: 'Почати спочатку', callback_data: '/start' }]] },
          });
          await updateRecentMessageByChatId(chatId, message1.message_id);
          break;
        case '/comleate':
          bot.deleteMessage(chatId, userInfo?.recentMessage).catch((error) => {logger.warn(`Помилка видалення повідомлення: ${error}`);});
          //const status = await readGoogle(ranges.statusCell(userInfo?.lotNumber));
          const status = await findLotBylotNumber(userInfo?.lotNumber);
          if (status.lot_status === 'reserve') {
            try {
              const updatedLot = await updateStatusByLotNumber(userInfo.lotNumber, 'done');
              await updateLotIDByLotNumber(userInfo.lotNumber, chatId);

              await updateStatusColumnById('done', updatedLot.bot_id);
              await updateCustomerDataById(userInfo.firstname, userInfo.contact, chatId, updatedLot.bot_id);

              await clearResrvBybot_id(updatedLot.bot_id);
              await editingMessageCompleate(updatedLot.bot_id, "📌 ");
              const soldLotContent = messageText(updatedLot);
              await bot.sendMessage(chatId, phrases.thanksForOrder(userInfo.firstname));
              await bot.sendMessage(chatId, soldLotContent); 
              logger.warn(`*USERID ${chatId} comleate order Lot#${userInfo.lotNumber} Name: ${userInfo.firstname} Contact: ${userInfo.contact}*`);
              //here sanding reminder for users in waiting list that lot they waitng already sold
              await updateUserByChatId(chatId, 
              { 
                isAuthenticated: true,
                lotNumber: null,
              }) 
            } catch (error) {
              logger.error(`*Something went wrong on finishing order for lot#${userInfo?.lotNumber} from customer ${chatId}. Name: ${userInfo?.firstname}. Contact: ${userInfo?.contact}*. Error: ${error}`);
            }
          } else {
            bot.sendMessage(chatId, phrases.aleadySold);
          }
        break;
      }
    })
    
    bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const userInfo = await findUserByChatId(chatId);
      if (userInfo?.isBan) {
        await bot.sendMessage(chatId, `Відсутні доступні для купівлі ділянки`);
        return
      } else if (msg.contact) {
        bot.deleteMessage(chatId, userInfo?.recentMessage).catch((error) => {logger.warn(`Помилка видалення повідомлення: ${error}`);});
        const userData = await updateUserByChatId(chatId, { 
          firstname: msg.contact.first_name,
          contact: msg.contact.phone_number,
        });
        logger.info(`*Unregistred user ID: ${chatId} shared contact. Name: ${msg.contact.first_name}, Phone: ${msg.contact.phone_number}*`);
        const message = await bot.sendMessage(chatId, phrases.dataConfirmation(userData?.contact, userData?.firstname), { 
          reply_markup: keyboards.inlineConfirmation });
        await updateRecentMessageByChatId(chatId, message.message_id);

      } else if (userInfo?.chatStatus === 'phoneManual') {
        bot.deleteMessage(chatId, userInfo?.recentMessage).catch((error) => {logger.warn(`Помилка видалення повідомлення: ${error}`);});
        await updateUserByChatId(chatId, { contact: msg.text, chatStatus: 'nameManual' });
        logger.info(`*Unregistred user ID: ${chatId} posted contact. Contact: ${msg.text}*`);
        const message = await bot.sendMessage(chatId, phrases.nameRequest);
        await updateRecentMessageByChatId(chatId, message.message_id)
      } else if (userInfo?.chatStatus === 'nameManual') {
        bot.deleteMessage(chatId, userInfo?.recentMessage).catch((error) => {logger.warn(`Помилка видалення повідомлення: ${error}`);});
        const message = await bot.sendMessage(chatId, phrases.dataConfirmation(userInfo.contact, msg.text), {
          reply_markup: keyboards.inlineConfirmation });
        await updateRecentMessageByChatId(chatId, message.message_id);
        logger.info(`*Unregistred user ID: ${chatId} posted name. Name: ${msg.text}*`);
        await updateUserByChatId(chatId, {
          firstname: msg.text,
          chatStatus: '',
          recentMessage: message.message_id,
        })
      }
//
      switch (msg.text) {
        case '/reserved': 
          const data = await findLotsByStatusAndChatID('reserve', chatId);
          if (!data) { await bot.sendMessage(chatId, `У вас немає заброньованих ділянок`); 
          } else {
            await bot.sendMessage(chatId, `Ваші заброньовані ділянки:`);
            data.forEach(async item => {
              
              await bot.sendMessage(chatId, `📊 ${item.area} га, ₴  ${item.price} ( ${(item.price/item.area).toFixed(2)} грн/га) 
дохідність ${item.revenue}% 
${item.cadastral_number} 
${item.state} область, ${item.region} район 
🚜 орендар: ${item.tenant} , ${item.lease_term} років
                      
              `, { reply_markup: { inline_keyboard: [[{ text: "Купити ділянку", callback_data: `${item.lotNumber}` }]] } });
            })
          }
          break;
        case '/filter': 
          await stateFilterKeyboard(chatId);
          //filterKeyboard(chatId, 'Область', ranges.stateColumn);
          break;
        case '/start':
          if (!userInfo) await createNewUserByChatId(chatId);
          const message = await bot.sendMessage(msg.chat.id, phrases.greetings, { reply_markup: keyboards.listInline });
          await updateRecentMessageByChatId(chatId, message.message_id);
          break;
        case 'Зробити замовлення':
        case '/list':
          await sendAllLots(chatId);

          //await sendAvaliableToChat(msg.chat.id, bot);
          break;
        case '/mylots':
          await bot.sendMessage(chatId, '*Лоти які належать вам:*', { parse_mode: 'Markdown' });
          const messageText = await myLotsDataList(chatId);
          if (messageText) bot.sendMessage(chatId, messageText) 
          else bot.sendMessage(chatId, 'Нічого не знайдено');
          break;
      };
  });
};