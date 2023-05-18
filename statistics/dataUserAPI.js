const dbAPI = require('../database/controllers/apiController').apiController
const binance = require('node-binance-api')
const moment = require('moment')

class dataUserAPI {
  async getUserAPI(idChat) {
    return JSON.parse(JSON.stringify(await dbAPI.showAPI(idChat)))
  }
  async getBalance(idChat) {
    const userApi = await this.getUserAPI(idChat)
    userApi.forEach(async (element) => {
      
      //console.log(element.apikey, element.apisecret)
      const connect = new binance().options({
        APIKEY: element.apikey,
        APISECRET: element.apisecret,
      })
      const balancesAndPositions = JSON.parse(
        JSON.stringify(await connect.futuresUserTrades("BTCUSDT", "startTime=1593511200000 endTime=1593512200000"))
      )
      console.log(balancesAndPositions)
      balancesAndPositions.forEach( (element, i) => {
        element.time = moment(element.time).format('MMMM Do YYYY, h:mm:ss a')
        //if(i < 40)console.log(element)
      })

      //////////////////  
      console.log(await connect.promiseRequest( 'v1/trades'))
      //promiseRequest(url: string, data?: any, flags?: any)
    
    })
    // const connect = new binance().options({
    //     APIKEY: userApi.apikey,
    //     APISECRET: userApi.secretkey,
    //   })
    //console.info( await binance.futuresBalance() );
  }
}

exports.dataUserAPI = new dataUserAPI()
