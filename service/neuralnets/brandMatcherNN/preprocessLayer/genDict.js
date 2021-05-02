const fs = require('fs');
const mimir = require('../../../../utils/mimir.js');
const dataset = require('../datasets/dirtydataset-1619865880876.json');

function genDict() {
    const names = dataset.filter(elem => elem != null && elem != undefined).map(elem => elem.name)
    return mimir.dict(names);
}

module.exports = {
    genDict: genDict
};
