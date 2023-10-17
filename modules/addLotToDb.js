import { writeGoogle, readGoogle } from '../crud.js';
import { dataBot, ranges } from '../values.js';
import { getLotContentByID } from '../interval.js';
import { logger } from '../logger/index.js';
import { getLotData } from '../lotmanipulation.js';

const addLotToDb = async (searchValue) => {
  const statusValues = await readGoogle(ranges.lotIdColumn);
  const matchingLots = statusValues
    .map((value, index) => value === searchValue ? index + 1 : null)
    .filter(value => value !== null);

  const contentPromises = matchingLots.map(el => getLotContentByID(el));
  const lotsContent = await Promise.all(contentPromises);

  for (let index = 0; index < lotsContent.length; index++) {
    const lotNumber = matchingLots[index];
    // Add the lot to the database
    const newLot = await getLotData(lotNumber);
    console.log(lotNumber);
  }
};

// Example usage:
// const variableToSearch = "yourVariableHere";

// addLotToDb(variableToSearch);

export { addLotToDb };