import { readGoogle } from './crud.js';
import { dataBot } from './values.js';
import { createNewLot } from './models/lots.js';
import { lotExistsInDatabase } from './models/lots.js';
import { createNewReserv } from './models/reservations.js';



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
        lotNumber: lotNumber-1,
        area: data[18],
        price: data[19],
        revenue: data[20],
        tenant: data[22],
        lease_term: data[23],
        bot_id: data[15]
    };
    if (lotData?.bot_id) {
        const result = await lotExistsInDatabase(lotData?.bot_id);
        if (result) return;
        const newReserv = await createNewReserv(lotData.bot_id);
    }
    const newLot = await createNewLot(lotData);
    console.log(newLot);
}

const addDataToDb = async (lotNumber) => {
    // Check if the lot already exists in the database
    //const lotExists = await lotExistsInDatabase(searchValue);

    // Add the lot to the database only if it doesn't exist
    //if (!lotExists) {
        const range = `${dataBot.googleSheetName}!A${lotNumber}:X${lotNumber}`;
        const data = await readGoogle(range);
        const lotData = {
            cadastral_number: data[2],
            state: data[6],
            user_name: data[9],
            user_id: data[10],
            region: data[21],
            lot_status: data[13],
            lotNumber: lotNumber-1,
            area: data[18],
            price: data[19],
            revenue: data[20],
            tenant: data[22],
            lease_term: data[23],
            bot_id: data[15]
        };
        const newLot = await createNewLot(lotData);
        console.log(newLot);
        console.log(`Lot with ID ${lotNumber} added to the database.`);
    }
    // else {
       // console.log(`Lot with ID ${bot_id} already exists in the database. Skipped.`);
    //}
//}
export { getLotData, addDataToDb };