const bot = require('../bot/main');
const bdSignal = require('../database/signalController');
const bdUser = require('../database/userController');
const  binance  =  require('node-binance-api');
const  connect  =  new  binance ().options({ 
    APIKEY : 'dkl5SmAcvSAtzXWi8kCHUojw03Npeghi7A3ErXgVoO7vsNFMpr9BLxevkH6dYUZh' , 
    APISECRET : 'Q7a91imDhCHNfROw63LaOEm4FnPZqKXljh7GG0DINDAtr9sZ4BK8e59MJhC6d3CR' 
});


function getTopActive(){
    
    new Promise ((resolve) => {

        let resultObj = [];
        let result = '';

        connect.prevDay(false, (error, prevDay) => {
            prevDay.forEach((element) => {
                //Фільтрація непотрібних монет
                if(element.symbol.search(/USDT/) != -1 && 
                element.symbol.search(/UP/) == -1 && 
                element.symbol.search(/DOWN/) == -1 &&
                element.priceChangePercent >= 0){
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
    ).catch(err => bot.botMessage("Error"));
}


function getTopVolume(){
    
    new Promise ((resolve) => {

        let resultObj = [];
        let result = '';

        connect.prevDay(false, (error, prevDay) => {
            prevDay.forEach((element) => {
                //Фільтрація непотрібних монет
                if(element.symbol.search(/USDT/) != -1 &&
                element.symbol.endsWith("USDT") &&  
                element.symbol.search(/UP/) == -1 && 
                element.symbol.search(/DOWN/) == -1){
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
    ).catch(err => bot.botMessage("Error"));
}

function createSignal(ticker, price, chatId){//////переписати функцію, працює криво
    new Promise (async (resolve) => {

        let symbolObj = {};
        let result = false;
        let trigger = "Bad enter! Write again...";

         ////////потрібно дістати ід юзера з бд
        let idUser = await bdUser.userController.getUserId(chatId);
        
        //////api binance
        connect.prevDay(false, (error, prevDay) => {
            prevDay.forEach((element) => {
                
                symbolObj[element.symbol] = element.lastPrice;
            });

            try{
                for(key in symbolObj){
                    if(key == ticker){
                        result = "Signal created!";
                        if(+symbolObj[key] > +price){
                            trigger = '<';
                        }else if(+symbolObj[key] < +price){
                            trigger = '>';
                        }
                        // console.log(idUser, key, symbolObj[key], trigger);
                        break;
                    }
                }
            }catch (error){
                result = "Bad enter! Write again...";
            }
            
            resolve({result, idUser, ticker, price, trigger});
        });
    }).then(({result, idUser, ticker, price, trigger}) => {
        bdSignal.signalController.createSignal(idUser, ticker, price, trigger);
        bot.botMessage(result)
    }
    ).catch(err => bot.botMessage("Error"));
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