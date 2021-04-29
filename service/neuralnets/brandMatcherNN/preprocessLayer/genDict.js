const fs = require('fs');
const mimir = require('../utils/mimir.js'),
    dict = mimir.dict;
const dataset = require('../datasets/dirtydataset-XXX.json');

const names = dataset.map(elem => elem.name);
const corpus = dict(names);

module.exports = {
    dict: corpus
};
