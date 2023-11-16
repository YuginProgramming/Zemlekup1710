import { readGoogle } from './crud.js';
import { dataBot } from './values.js';
import { createNewLot } from './models/lots.js';
import { findLotByBotId, updateLotBybot_id } from './models/lots.js';
import { createNewReserv, clearResrvBybot_id, findReservByLotNumber } from './models/reservations.js';

const getLotData = async (lotNumber) => {
    const range = `${dataBot.googleSheetName}!A${lotNumber}:X${lotNumber}`;
    const data = await readGoogle(range);
    const lotData = {
        cadastral_number: data[2],
        state: data[6],
        user_name: data[9],
        user_id: data[10],
        region: data[21],
        lot_status: 'new',
        lotNumber: lotNumber,
        area: data[18],
        price: data[19],
        revenue: data[20],
        tenant: data[22],
        lease_term: data[23],
        bot_id: data[15]
    };

    if (lotData.bot_id) {
        const result = await findLotByBotId(lotData.bot_id);

        if (result) {
            const updatedLot = await updateLotBybot_id(lotData.bot_id, lotData);
            const reserv = await findReservByLotNumber(lotData.bot_id);
            if (reserv) {
                const updatedReserv = await clearResrvBybot_id(lotData.bot_id);
            } else {
                const newReserv = await createNewReserv(lotData.bot_id);
            }
            return updatedLot;

        } else {
            const newLot = await createNewLot(lotData);
            const newReserv = await createNewReserv(lotData.bot_id);
            return newLot;
        }
        
    }  else {
        logger.warn(`Impossible to create lot without bot_id`);
    }
}

export { getLotData };