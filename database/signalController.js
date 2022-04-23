const db = require('./db');

class signalController{
    async createSignal(idUser, symbol, price, triggerValue) {
        await db.query(`INSERT INTO userSignals (idUser, symbol, price, triggerValue) 
        values (${idUser}, '${symbol}', ${price}, '${triggerValue}')`)
        .catch(err => console.log(err));
    }

    async getAllSignals(chatId) {
        let res;
        await db.query(`SELECT * FROM userSignals WHERE idUser IN (SELECT idUser FROM users WHERE idChat = '${chatId}')`)
        .then(result => {res = result.rows})
        .catch(err => console.log(err)); 
        return res;
    }

    async updateSignal(req, res) {

    }

    async deleteSignal(chatId, symbol, price) {
        let res;
        await db.query(`DELETE FROM userSignals WHERE idUser IN (SELECT idUser FROM users
            WHERE idchat = '${chatId}') AND symbol = '${symbol}' AND price = ${price}`)
        .then(result => {
            if(result.rowCount == 1){
                res = "Signal deleted!";
            }else if(result.rowCount == 0){
                res = "Signal not found!";
            }
        })
        .catch(() => {res = "Smth wrong with database..."}); 
        return res;
    }
}

exports.signalController = new signalController();