import { writeGoogle, readGoogle } from '../crud.js';
import { ranges } from '../values.js';
import { logger } from '../logger/index.js'

export const updateStatusColumnById = async (status, lotId) => {
    const idsList = await readGoogle(ranges.lot_idColumn);
    const choosedLot = idsList.indexOf(lotId);
    if (choosedLot === -1 ) {
        logger.warn(`Cannt find id:${lotId} in the sheet, throught status update process`);
        return;
    } 
    await writeGoogle(ranges.statusCell(choosedLot + 1), [[status]]);  
}

export const updateCustomerDataById = async (firstname, surname, userId, lotId) => {
    const idsList = await readGoogle(ranges.lot_idColumn);
    const choosedLot = idsList.indexOf(lotId);
    if (choosedLot === -1 ) {
        logger.warn(`Cannt find id${lotId} in the sheet throught status update process`);
        return;
    } 
    const lotRow = choosedLot + 1;
    await writeGoogle(ranges.userNameCell(lotRow), [[firstname]]);
    await writeGoogle(ranges.userPhoneCell(lotRow), [[surname]]);
    await writeGoogle(ranges.user_idCell(lotRow), [[`${userId}`]]);
}