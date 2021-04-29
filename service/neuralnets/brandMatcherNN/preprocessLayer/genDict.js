const fs = require('fs');
const mimir = require('../../../../utils/mimir.js');
const dataset = require('../datasets/dirtydataset-XXX.json');

const names = dataset.map(elem => elem.name);
const corpus = mimir.dict(names);

module.exports = {
    dict: corpus
};
