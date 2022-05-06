const bot = require('../bot/main');
const bdSignal = require('../database/signalController');
const bdUser = require('../database/userController');
const binance  =  require('node-binance-api');
const keys = require('../config');
const  connect  =  new  binance ().options({ 
    APIKEY : keys.MyApiKeys.apiKey, 
    APISECRET : keys.MyApiKeys.apiSecret 
});

let str = ["BTCUSDT","BTCUSCD","BTCUPUSDT","BTCDOWNUSDT"];

str.forEach(element=>{
    console.log(element.match(/^((?!UP|DOWN).)*USDT$/));
});



function getTopActive(){
    
    new Promise ((resolve) => {

        let resultObj = [];
        let result = '';

        connect.prevDay(false, (error, prevDay) => {
            prevDay.forEach((element) => {
                //Фільтрація непотрібних монет
                // if(element.symbol.search(/USDT/) != -1 && 
                // element.symbol.search(/UP/) == -1 && 
                // element.symbol.search(/DOWN/) == -1 &&
                // element.priceChangePercent >= 0){
                let symbol = element.symbol;
                if(symbol.match(/^((?!UP|DOWN).)*USDT$/) != null){
                    element.priceChangePercent = Math.floor(element.priceChangePercent * 100) / 100;
                    resultObj.push(element);
                    // сonsole.log(element);
                }
            });
            resultObj.sort(byField('priceChangePercent'));
            resultObj = resultObj.slice(0, 10);
            for(let obj of resultObj) {
                result += `${obj.symbol} +${obj.priceChangePercent}%\n`;
            }
            resolve(result);
          });
         
    }).then(result => bot.botMessage(result)
    ).catch(err => bot.botMessage(err));
}


function getTopVolume(){
    
    new Promise ((resolve) => {

        let resultObj = [];
        let result = '';

        connect.prevDay(false, (error, prevDay) => {
            prevDay.forEach((element) => {
                //Фільтрація непотрібних монет
                let symbol = element.symbol;
                if(symbol.match(/^((?!UP|DOWN).)*USDT$/) != null){
                    // console.log(element.volume, element.price);
                    element.volume = Math.floor(element.volume * element.lastPrice * 1/1000) / 1000;
                    resultObj.push(element);
                }
            });
            resultObj.sort(byField('volume'));
            resultObj = resultObj.slice(0, 10);
            for(let obj of resultObj) {
                result += `${obj.symbol} ${obj.volume}M$\n`;
            }
            resolve(result);
          });
         
    }).then(result => bot.botMessage(result)
    ).catch(err => {bot.botMessage(err)});
}

async function createSignal(ticker, price, chatId){//////переписати функцію, працює криво
    let idUser = await bdUser.userController.getUserId(chatId);
    
    new Promise ( (resolve, reject) => {
        if(isNaN(+price))reject();

        let symbolObj = {};
        // let result = "Bad enter! Write again...";
        let trigger;

        ////////потрібно дістати ід юзера з бд
        
        
        
        //////api binance
        connect.prevDay(false, (error, prevDay) => {
            prevDay.forEach((element) => {
                symbolObj[element.symbol] = element.lastPrice;
            });

        
            for(let key in symbolObj){
                if(key == ticker){
                    // result = "Signal created!";
                    if(+symbolObj[key] > price){
                        trigger = '<';
                    }else if(+symbolObj[key] < price){
                        trigger = '>';
                    }
                    // console.log(idUser, key, symbolObj[key], trigger);
                    break;
                }
            }
            resolve({idUser, ticker, price, trigger});
        });
    }).then(({idUser, ticker, price, trigger}) => {
        bdSignal.signalController.createSignal(idUser, ticker, price, trigger);
        bot.botMessage("Signal created!");
    })
    .catch(() => bot.botMessage("Bad enter! Write again..."));

}

async function showSignals(chatId){
    let query = await bdSignal.signalController.getAllSignals(chatId);
    let result = 'You can delete signals. Write "/delete_signal *ticker* *price*"  (For example "/delete_signal btcusdt 4000").\n \nYour signals:\n';
    query.forEach((element) => {
        result += element.symbol + " " + element.price +"\n";
    });
    bot.botMessage(result);
}

async function deleteSignal(ticker, price, chatId){
    let query = await bdSignal.signalController.deleteSignal(chatId, ticker, price);
    bot.botMessage(query);
}

function byField(field) {
    return (a, b) => a[field] > b[field] ? -1 : 1;
}

    
exports.getTopActive = getTopActive;
exports.getTopVolume = getTopVolume;
exports.createSignal = createSignal;
exports.showSignals = showSignals;
exports.deleteSignal = deleteSignal;
