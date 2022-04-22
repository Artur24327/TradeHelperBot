const db = require('./db');

class signalController{
    async createSignal(idUser, symbol, price, triggerValue) {
        await db.query(`INSERT INTO userSignals (idUser, symbol, price, triggerValue) values (${idUser}, '${symbol}', ${price}, '${triggerValue}')`)
        .catch(err => console.log(err));
    }

    async getAllSignals(req, res) {

    }

    async updateSignal(req, res) {

    }

    async deleteSignal(req, res) {
        
    }
}

exports.signalController = new signalController();