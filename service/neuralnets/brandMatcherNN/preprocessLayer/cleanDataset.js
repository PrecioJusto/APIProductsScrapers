'use strict';

const fs = require('fs');
const path = require('path');
const mimir = require('../../../../utils/mimir.js');
const genDict = require('./genDict.js');
const dirtyDataset = require('../datasets/dirtydataset-1619865880876.json');
const { dir } = require('console');

// Cleaning dataset for neural network training
function cleanDataset() {
    const dict = genDict.genDict();
    const logStream = fs.createWriteStream(path.resolve(__dirname + `/../datasets/dataset-${Date.now()}.json`), { flags: 'a' });
    logStream.write('[');

    let arr = [];
    for (let i = 0; i < dirtyDataset.length; i++) {
        if (dirtyDataset[i] !== null && dirtyDataset[i] !== undefined) {
            arr.push({
                name: mimir.bow(dirtyDataset[i].name, dict),
                brand: dirtyDataset[i].brand,
                qs: dirtyDataset[i].qs
            });
        }

        if (i % 1000 === 0) {
            console.log(i);
            logStream.write(JSON.stringify(arr));
            arr = [];
        }
    }

    logStream.write(']');
    logStream.end();
}

module.exports = {
    cleanDataset: cleanDataset
}