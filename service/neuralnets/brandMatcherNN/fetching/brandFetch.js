const fs = require('fs');
const genDict = require('../preprocessLayer/genDict.js');
const mimir = require('../../../../utils/mimir.js');
const neuralNetwork = require('../training/train.js');

// net = new brain.NeuralNetwork();    // maybe importing net instance from trainig/train.js

let dict;
(() => {
    dict = genDict.genDict();
})();

// Loading pre-trained model...
const model = fs.readFileSync(__dirname + '/../models/model.json');
neuralNetwork.net.fromJSON(JSON.parse(model));

function classify(prod) {
    const output = neuralNetwork.net.run(mimir.bow(prod, dict));
    return Object.keys(output).sort((a, b) => output[b] - output[a]).shift();
}

module.exports = {
    classify: classify
};
