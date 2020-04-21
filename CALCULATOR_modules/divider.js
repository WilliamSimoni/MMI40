const {aggregation} = require('./aggregation');
//database
const { Database } = require('../../STUB/database/db');
const database = new Database();

async function divider(aggrFun, projectName, tags, fleets, values, startPeriods, periods, timePeriodKey, TimePeriodNumber, granularityKey, granularityNumber){
    try{
      let promises = [];
      const end = periods[periods.length-1];
      for (let tag of tags){
        promises.push(aggregation(aggrFun, projectName, tag, fleets, values, startPeriods, end, periods));
      }
      const result = await Promise.all(promises)
        .then(res => {
          let result = [];
          for (let item of res){
            result = [...result, ...item];
          }
          return result;
        })
      return result;
    }catch(err){
      console.error(err);
      return {status: 400, msg: 'something went wrong'};
    }
  }

  exports.divider = divider;