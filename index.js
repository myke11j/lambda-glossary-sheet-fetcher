const async = require('async');
const SheetFactory = require('./sheet.factory');
const alexaLogger = require('./logger');

exports.handler = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  alexaLogger
    .init()
    .then(() => {
      async.series([
        SheetFactory.setAuth,
        SheetFactory.getInfoAndWorksheets,
        SheetFactory.saveSheetData,
      ], (err) => {
        if (err) {
          alexaLogger.logError(`Error encoured in lambda invocation. Error: ${err}`);
          return callback(err);
        }
        return callback();
      });
    })
    .catch((err) => {
      alexaLogger.logError(`Error in try-catch: ${err}`);
      return callback(err);
    });
}