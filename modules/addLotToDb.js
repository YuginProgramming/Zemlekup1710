import { writeGoogle, readGoogle } from '../crud.js';
import { dataBot, ranges } from '../values.js';
import { getLotContentByID } from '../interval.js';
import { logger } from '../logger/index.js';
import { getLotData, addDataToDb } from '../lotmanipulation.js';
import { lotExistsInDatabase, findLotByBotId  } from '../models/lots.js';

const addLotToDb = async (searchValue) => {
  const statusValues = await readGoogle(ranges.lotIdColumn);
  const matchingLots = statusValues
    .map((value, index) => value === searchValue ? index + 1 : null)
    .filter(value => value !== null);
  const result = await lotExistsInDatabase(searchValue)
  if (result) return
  matchingLots.forEach( async element => {
    await addDataToDb(element);
  });

};

export { addLotToDb };