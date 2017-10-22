'use strict';

const AWS = require('aws-sdk');
const async = require('async');
const GoogleSpreadsheet = require('google-spreadsheet');
const alexaLogger = require('./logger');

const dynamodb = new AWS.DynamoDB();

const SheetFactory = {};
const doc = new GoogleSpreadsheet(process.env.SHEET_URL);
const param = {
    ReturnConsumedCapacity: "TOTAL",
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Item: {}
}
let sheets;

const getItem = (data) => {
    const res = {};
    if (data.title) {
        res['glossary_id'] = {
            S: data.title.toLocaleLowerCase()
        }
    }
    if (data.description) {
        res['answer'] = {
            S: data.description
        }
    }
    if (data.usecaseoptional) {
        res['usecaseoptional'] = {
            S: data.usecaseoptional
        }
    }
    if (data.snippetoptional) {
        res['snippetoptional'] = {
            S: data.snippetoptional
        }
    }
    if (data.addedby) {
        res['author'] = {
            S: data.addedby
        }
    }
    return res;
};

SheetFactory.setAuth = (step) => {
    const token = JSON.parse(process.env.GOOGLE_ACCESS_TOKEN);
    const creds = {
        "type": token.type,
        "project_id": token.project_id,
        "private_key_id": token.private_key_id,
        "private_key": token.private_key,
        "client_email": token.client_email,
        "client_id": token.client_id,
        "auth_uri": token.auth_uri,
        "token_uri": token.token_uri,
        "auth_provider_x509_cert_url": token.auth_provider_x509_cert_url,
        "client_x509_cert_url": token.client_x509_cert_url
    }
    doc.useServiceAccountAuth(creds, step);
};

SheetFactory.getInfoAndWorksheets = (step) => {
    doc.getInfo(function (err, info) {
        alexaLogger.logInfo('Loaded doc: ' + info.title + ' by ' + info.author.email);
        sheets = info.worksheets;
        alexaLogger.logInfo(`Number of sheets: ${sheets.length}`);
        step();
    });
};

SheetFactory.saveSheetData = (step) => {
    async.each(sheets, (sheet, callback) => {
        alexaLogger.logInfo(`Fetching data from sheet: ${sheet.title}`);
        sheet.getRows({
            offset: 1
        }, function (err, rows) {
            async.eachSeries(rows, (row, callback2) => {
                param.Item = getItem(row);
                dynamodb.putItem(param, (err, data) => {
                    if (err) {
                        alexaLogger.logError(`Error in putting data into dynamodb: ${err}`);
                        return callback2();
                    }
                    alexaLogger.logInfo(`Inserted data with id ${row.title}`);
                    param.Item = {};
                    return callback2();
                });
            }, (asyncSeriesErr) => {
                if (asyncSeriesErr) {
                    alexaLogger.logError(`Error in putting data id ${row.title} into dynamodb: ${asyncSeriesErr}`);
                    return callback(asyncSeriesErr);
                }
                return callback();
            });
        });
    }, (asyncEachErr) => {
        if (asyncEachErr) {
            alexaLogger.logError(`Error in putting data into dynamodb: ${asyncEachErr}`);
            return step();
        }
        return step();
    });
};

module.exports = SheetFactory;