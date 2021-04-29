const fs = require('fs');
const brain = require('../utils/brain.js');
const dataset = require('../datasets/dataset-XXX.json');

net = new brain.NeuralNetwork();

net.train(dataset, {
    iterations: 1000,
    errorThresh: 0.0005,
    log: true,
    logPeriod: 10,
    learningRate: 0.2,
    momentum: 0.1,
    callback: null,
    callbackPeriod: 10,
    timeout: Infinity
});

saveModel(net.toJSON());

function saveModel(model) {
    // Saving model...
    const date = Date.now();
    const dir = `../models/`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {
            recursive: true
        });
    }
    fs.writeFile(`./models/model-${date}.json`, JSON.stringify(model), err => {
        if (err) throw err;
        console.log('Model succesfully saved!');
    });
}

// Exporting neural network instance
module.exports = {
    net: net
};
