import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';

class Lot extends Model {}
Lot.init({
    area: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    revenue: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    cadastral_number: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'not specified'
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'not specified'
    },
    region: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'not specified'
    },
    tenant: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'not specified',
        
    },
    lease_term: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    lot_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'new'
    },
    message_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    user_name: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    contact: {
        type: DataTypes.STRING,
        allowNull: true
    },
    lotNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    bot_id: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    comment: {
        type: DataTypes.STRING,
        allowNull: true
    }


}, {
    freezeTableName: false,
    timestamps: true,
    modelName: 'lots',
    sequelize
});

const createNewLot = async (lotData) => {
    let res;
    try {
        res = await Lot.create(lotData);
        res = res.dataValues;
        logger.info(`Created lot with id: ${res.id}`);
    } catch (err) {
        logger.error(`Impossible to create lot: ${err}`);
    }
    return res;
};

const updateStatusAndUserIdBybot_id = async (bot_id, status, chat_id) => {
    const res = await Lot.update({ lot_status: status, user_id: chat_id } , { where: { bot_id } });
    if (res[0]) {
        const data = await findLotByBotId(bot_id);
        if (data) {
            logger.info(`Lot# ${data.bot_id} status updated. New status: ${data.lot_status}`);
            return data;
        }
        logger.info(`Lot#  ${bot_id} updated, but can't read result data`);
    } 
    return undefined;
};

const updateLotBybot_id = async (bot_id, lot) => {
    const res = await Lot.update(lot , { where: { bot_id } });
    if (res[0]) {
        const data = await findLotByBotId(bot_id);
        if (data) {
            logger.info(`Lot# ${data.bot_id} status updated. New status: ${data.lot_status}`);
            return data;
        }
        logger.info(`Lot#  ${bot_id} updated, but can't read result data`);
    } 
    return undefined;
};

const updateMessageIdBybot_id = async (bot_id, message_id) => {
    const res = await Lot.update({ message_id } , { where: { bot_id } });
    if (res[0]) {
        const data = await findLotByBotId(bot_id);
        if (data) {
            logger.info(`Lot# ${data.bot_id} status updated. New status: ${data.lot_status}`);
            return data;
        }
        logger.info(`Lot#  ${bot_id} updated, but can't read result data`);
    } 
    return undefined;
};

const updateStatusByLotNumber = async (lotNumber, status) => {
    const res = await Lot.update({ lot_status: status } , { where: { lotNumber } });
    if (res[0]) {
        const data = await findLotBylotNumber(lotNumber);
        if (data) {
            logger.info(`Lot# ${data.bot_id} status updated. New status: ${data.lot_status}`);
            return data;
        }
        logger.info(`Lot#  ${bot_id} updated, but can't read result data`);
    } 
    return undefined;
};

const updateLotIDByLotNumber = async (lotNumber, user_id) => {
    const res = await Lot.update({ user_id } , { where: { lotNumber } });
    if (res[0]) {
        const data = await findLotBylotNumber(lotNumber);
        if (data) {
            logger.info(`Lot# ${data.chat_id} userid updated.`);
            return data;
        }
        logger.info(`Lot  ${lotNumber} updated but cant read result data`);
    } 
    return undefined;
};





const findLotBylotNumber = async (lotNumber) => {
    const res = await Lot.findOne({ where: { lotNumber } });
    if (res) return res.dataValues;
    return;
};

const lotExistsInDatabase = async (bot_id) => {
    const res = await Lot.findOne({ where: { bot_id } });
    if (res) {
        return res.dataValues;
      } else {
        return false;
      }
  };

const findLotByBotId = async (bot_id) => {
    const res = await Lot.findOne({ where: { bot_id } });
    if (res) {
        return res.dataValues;
    } else {
        return;
    }
};


const findLotsByStatus = async (status) => {
    const res = await Lot.findAll({ where: { lot_status: status } });
    if (res.length > 0) return res.map(el => el.dataValues);
    return;
};

const findLotsByStatusAndState = async (status, state) => {
    const res = await Lot.findAll({ where: { lot_status: status, state } });
    if (res.length > 0) return res.map(el => el.dataValues);
    return;
};

const findLotsByStatusAndChatID = async (status, chatId) => {
    const res = await Lot.findAll({ where: { lot_status: status, user_id: chatId } });
    if (res.length > 0) return res;
    return;
};

const findLotsByStatusAndRegion = async (status, region) => {
    const res = await Lot.findAll({ where: { lot_status: status, region } });
    if (res.length > 0) return res.map(el => el.dataValues);
    return;
};

const findAllLots = async () => {
    const res = await Lot.findAll({ where: {  } });
    if (res.length > 0) return res.map(el => el.dataValues);
    return;
};

const deleteLotById = async (bot_id) => {
    const res = await Lot.destroy({ where: { bot_id } });
    if (res) logger.info(`Deleted status: ${res}. Lot id ${bot_id}`);
    return res ? true : false;
};



export {
    Lot,
    findAllLots,
    createNewLot,
    updateStatusAndUserIdBybot_id,
    findLotBylotNumber,
    findLotsByStatus,
    updateLotIDByLotNumber,
    findLotsByStatusAndState,
    findLotsByStatusAndRegion,
    lotExistsInDatabase,
    findLotByBotId,
    updateStatusByLotNumber,
    findLotsByStatusAndChatID,
    deleteLotById,
    updateMessageIdBybot_id,
    updateLotBybot_id
};   