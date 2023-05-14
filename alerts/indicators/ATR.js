// true range function
//the high of a particular time frame. seen in the candle stick
//the low of a particular time frame. seen in the candle stick
//the close of a particular time frame. seen in the candle stick
function calculatingATR(marketData) {
  const timePeriod = 14
  if (marketData) {
    const trueRange = ({ high, low, close }) => {
      let trueRange = Math.max(high - low, high - close, close - low)
      return trueRange
    }

    // the time period

    //list of true values
    let trueRangeList = []
    for (let i = 1; i - 1 < marketData.high.length - 1; i++) {
      trueRangeList.push(
        trueRange({
          high: marketData.high[i],
          low: marketData.low[i],
          close: marketData.close[i],
        })
      )
    }
    // calculate ATR
    const ATR = (trueRangeList, timePeriod) => {
      // use the array of True Range Values to get the Simple Moving //Average of the true range, ie., ATR
      if (timePeriod >= trueRangeList.length) {
        // if the timePeriod is //greater then the entire dataset, just return the average of the //whole set
        return (
          trueRangeList.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0
          ) / trueRangeList.length
        )
      } else {
        let nData = trueRangeList.slice(timePeriod * -1)
        return (
          nData.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0
          ) / timePeriod
        )
      }
    }
    return ATR(trueRangeList, timePeriod)
  }
}

exports.calculatingATR = calculatingATR
//run the code
//console.log(ATR(trueRangeList, timePeriod))
