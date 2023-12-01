import { findLotsByStatus } from '../models/lots.js';
import { messageText } from './ordermessage.js';

export const myLotsDataList = async (chatid) => {
    const status = 'done'
    const soldLots = await findLotsByStatus(status);
    if (!soldLots) return //тимчасова заглушка
    const myLots = soldLots.filter(item => item.user_id === chatid);
    const mylotsData = myLots.map(item => messageText(item));
    const myLotsList = mylotsData.join('\n');
    return myLotsList;
}

