import { findLotsByStatusAndChatID } from '../models/lots.js';
import { messageText } from './ordermessage.js';

const lotData = (item) => {
    const data = {
        lot: messageText(item),
        lotNumber: item.lotNumber
    }
    return data;
}

export const myReservedLotsList = async (chatId) => {
    const status = 'reserve';
    const reservedLots = await findLotsByStatusAndChatID(status, chatId);
    if (!reservedLots) { 
        return;
    } else {
        const lotsData = reservedLots.map(item => lotData(item));
        return lotsData;
    } 
}

