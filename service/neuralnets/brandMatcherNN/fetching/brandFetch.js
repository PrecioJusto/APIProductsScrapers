const fs = require('fs');
const genDict = require('../preprocessLayer/genDict.js');
const mimir = require('../../../../utils/mimir.js');
const neuralNetwork = require('../training/train.js');
const { parseChunked } = require('@discoveryjs/json-ext');

let dict;
let model;

(async () => {
    dict = genDict.genDict();
})();

async function loadingModel() {
    console.log('Loading model...')
    model = await parseChunked(fs.createReadStream(__dirname + `/../models/model-1620929432793.json`));
    console.log('Model loaded!')
    neuralNetwork.net.fromJSON(model);
}

function classify(prod) {
    const output = neuralNetwork.net.run(mimir.bow(prod, dict));
    console.log(Object.keys(output).sort((a, b) => output[b] - output[a]).slice(0, 10));
    return Object.keys(output).sort((a, b) => output[b] - output[a]).shift();
}

module.exports = {
    classify: classify,
    loadingModel: loadingModel
};
