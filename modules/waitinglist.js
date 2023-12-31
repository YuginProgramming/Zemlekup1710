import { 
    findReservByLotNumber,
    updateWaitlist_idsByLotNumber,
    updateReservist_idByLotNumber
} from '../models/reservations.js';
import { bot } from "../app.js";
import { logger } from '../logger/index.js';
import { messageText } from './ordermessage.js';
import { updateLotIDByBotId, findLotByBotId } from '../models/lots.js';
import { reservReminderTimerScript } from '../interval.js';


const hasMatch = (waitlist, chatId) => {
    for (let i = 0; i < waitlist.length; i++) {
        if (waitlist[i] == chatId) {
            return true;
        }
    }
    return false;
};

const addUserToWaitingList = async (bot_id, chatId) => {
    const reservData = await findReservByLotNumber(bot_id);
    let waitlist = reservData.waitlist_ids;
    if (!waitlist) {
        waitlist = [];
    } 
    else {
        waitlist = waitlist.toString();
        waitlist = waitlist.split(', ');
    }
    const match = hasMatch(waitlist, chatId);
    if (!match) {
        waitlist.push(chatId);
        const waitlistString = waitlist.join(', ');
        const newWaitlist = await updateWaitlist_idsByLotNumber(waitlistString, bot_id);
        const updatedStr = newWaitlist.waitlist_ids.toString();
        const updatedArray = updatedStr.split(', ')
        const arrayLength = updatedArray.length;
        return arrayLength;
    }
};

const moveWaitlistOneStepInFront = async (bot_id) => {
    const reservData = await findReservByLotNumber(bot_id);

    if (reservData.waitlist_ids == '') return;
    let waitlistArray = reservData.waitlist_ids.split(', ');
    if (waitlistArray[0] === '') {
        waitlistArray = reservData.waitlist_ids;
    } 

    const nextUser = waitlistArray[0];
    const updatedReserv = await updateReservist_idByLotNumber(nextUser, bot_id);

    bot.sendMessage(nextUser, `Ваша черга на покупку лоту, можете купити лот що вас цікавив`);
    await updateLotIDByBotId(bot_id, nextUser);

    try {
        const lotData = await findLotByBotId(bot_id);
        const message = messageText(lotData);
        await bot.sendMessage(nextUser, message, { reply_markup: { inline_keyboard: [[{ text: "Купити ділянку", callback_data: `${lotData.lotNumber}` }]] } });
        
        reservReminderTimerScript(bot_id, nextUser);
    
    } catch (error) {
        console.log(`ПОМИЛКА ${error}`)
    }

    const deleteFirstElement = (arr) => {
        if (arr.length === 1) {
          return [];
        } else {
          return arr.slice(1);
        }
    }

    const newWaitlist = deleteFirstElement(waitlistArray);

    let newWaitlistString = '';
    if (newWaitlist.length >= 1) {
        newWaitlistString = newWaitlist.join(', ');
    }
    const updatedWaitlist = await updateWaitlist_idsByLotNumber(newWaitlistString, bot_id);
    /*
    console.log(`newWaitlist: ${newWaitlist}`)
    newWaitlist.forEach(el => {
        try {
            bot.sendMessage(el, `Черга підійшла на одного користувача вперід. Ви #${ [index] + 1 } в черзі`);
        } catch (error) {
            logger.warn(`User: ${el}, Havn't received waitlist notification. Reason: ${error}`)
        }
    });
    logger.info(`${newWaitlist.length} користувачів отримали нагадування про те що черга підійшла ближче`);
    */
    return updatedReserv.reservist_id;
};

const sendSoldToWaitingIDs = async (bot_id) => {
    const reservData = await findReservByLotNumber(bot_id);
    if (!reservData?.waitlist_ids) {
        return;
    }
    const usersChatId = reservData?.waitlist_ids.split(', ');
    const groupSize = 25;
    for (let i = 0; i < usersChatId.length; i += groupSize) {
        const chatIdsGroup = usersChatId.slice(i, i + groupSize);
        chatIdsGroup.forEach(el => {
            try {
                bot.sendMessage(el, `Лот за яким ви стали в чергу проданий.`);
            } catch (error) {
                logger.warn(`User: ${el}, Havn't received waitlist notification. Reason: ${error}`)
            }
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    logger.info(`${usersChatId.length} користувачів отримали нагадування про новий завершення черги`);
}

export {
    addUserToWaitingList,
    moveWaitlistOneStepInFront,
    sendSoldToWaitingIDs
}