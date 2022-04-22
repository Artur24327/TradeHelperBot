const db = require('./db');

class userController{
    async createUser(idChat) {
        /////////при нажиманні на /start йде перевірка в базі на юзера
        let addUser = true;
        await db.query(`SELECT * FROM users WHERE idChat = '${idChat}'`)
                    .then(result => {
                        if(result.rows[0] != undefined)addUser = false;
                    })
                    .catch(err => console.log(err)); 
        //////////
        if(addUser == true){
            await db.query(`INSERT INTO users (idChat) values (${idChat})`);
        }
       
    }

    async getUserId(idChat) {
        let res;
        await db.query(`SELECT iduser FROM users WHERE idChat = '${idChat}'`)
        .then(result => {res = result.rows[0].iduser})
        .catch(err => console.log(err));  
        return res;
    }

    async deleteUser(idChat) {
        await db.query(`DELETE FROM users WHERE idChat = ${idChat}`)
                    .then(result => console.log(result.rows[0]));
    }
}
exports.userController = new userController();

// exports.userController = new userController();