import { readGoogle } from '../crud.js';
import { ranges, dataBot } from '../values.js';
import { findAllLots, findLotByBotId } from '../models/lots.js';
//шось якась фігня

function compareObjects(obj1, obj2) {
    for (const key in obj1) {
        if (obj1[key] !== obj2[key]) {
            return false; // Об'єкти не однакові
        }
    }
    return true; // Всі елементи однакові
}

export const updateDB = async () => {
    const IDsArray = await readGoogle(ranges.lot_idColumn);
    IDsArray.forEach( async (element, index) => {
        if (index !== 0) {
            console.log(`element${element}`)
            const data = await findLotByBotId(element);
            const range = `${dataBot.googleSheetName}!A${index+1}:X${index+1}`;
            const sheet = await readGoogle(range);
            const lotData = {
                cadastral_number: sheet[2],
                state: sheet[6],
                user_name: sheet[9],
                user_id: sheet[10],
                region: sheet[21],
                lot_status: sheet[13],
                lotNumber: index,
                area: sheet[18],
                price: sheet[19],
                revenue: sheet[20],
                tenant: sheet[22],
                lease_term: sheet[23],
            };
            console.log(data);
            console.log(lotData);
            const result = compareObjects(data, lotData);
            console.log(result);
        }
    });
    
}