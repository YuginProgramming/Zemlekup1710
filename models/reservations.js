import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';


class Reserv extends Model {}
Reserv.init({
    waitlist_ids: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    reservist_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    bot_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    freezeTableName: false,
    timestamps: true,
    modelName: 'reservs',
    sequelize
});

const createNewReserv = async (bot_id) => {
    const reserv = await findReservByLotNumber(bot_id);
    if (reserv) return;
    let res;
    try {
        res = await Reserv.create({ bot_id });
        res = res.dataValues;
        logger.info(`Created reserv with id: ${res.id}`);
    } catch (err) {
        logger.error(`Impossible to create reserv: ${err}`);
    }
    return res;
};


const updateReservist_idByLotNumber = async (reservist_id, bot_id) => {
    const res = await Reserv.update({ reservist_id } , { where: { bot_id } });
    if (res[0]) {
        const data = await findReservByLotNumber(bot_id);
        if (data) {
            logger.info(`Reserv for ID:#${data.bot_id} updated`);
            return data;
        }
        logger.info(`Reserv ${bot_id} updated, but can't read result data`);
    } 
    return undefined;
};

const clearResrvBybot_id = async ( bot_id) => {
    const res = await Reserv.update({ reservist_id: 0, waitlist_ids: '' } , { where: { bot_id } });
    if (res[0]) {
        const data = await findReservByLotNumber(bot_id);
        if (data) {
            logger.info(`Reserv for ID:#${data.bot_id} updated`);
            return data;
        }
        logger.info(`Reserv ${bot_id} updated, but can't read result data`);
    } 
    return undefined;
};

const updateWaitlist_idsByLotNumber = async (waitlist_ids, bot_id) => {
    const res = await Reserv.update( { waitlist_ids }, { where: { bot_id } });
    if (res[0]) {
        const data = await findReservByLotNumber(bot_id);
        if (data) {
            logger.info(`Reserv for ID:#${data.bot_id} updated`);
            return data;
        }
        logger.info(`Reserv ${bot_id} updated, but can't read result data`);
    } 
    return undefined;
};

const findReservByLotNumber = async (bot_id) => {
    const res = await Reserv.findOne({ where: { bot_id } });
    if (res) return res.dataValues;
    return res;
};

export {
    Reserv,
    createNewReserv,
    updateReservist_idByLotNumber,
    findReservByLotNumber,
    updateWaitlist_idsByLotNumber,
    clearResrvBybot_id
};   