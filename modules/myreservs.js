import { findLotsByStatusAndChatID } from '../models/lots.js';

const lotData = (item) => {
    const data = {
        lot: `📊 ${item.area} га, ₴  ${item.price} ( ${(item.price/item.area).toFixed(2)} грн/га) 
        дохідність ${item.revenue}% 
        ${item.cadastral_number} 
        ${item.state} область, ${item.region} район 
        🚜 орендар: ${item.tenant} , ${item.lease_term} років
                
        `,
        lotNumber: item.lotNumber
    }
    return data;
}

export const myReservedLotsList = async (chatId) => {
    const status = 'reserve';
    let reservedLots = await findLotsByStatusAndChatID(status, chatId);
    if (!reservedLots) { 
        return;
    } else {
        reservedLots.map(item => lotData(item));
        return reservedLots;
    } 
}

