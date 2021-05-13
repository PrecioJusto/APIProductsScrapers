const fs = require('fs');
const path = require('path');
const brain = require('brain.js');
const { stringifyStream } = require('@discoveryjs/json-ext');

//let net = new brain.NeuralNetworkGPU();

function train(dataset) {
    const nn = new brain.NeuralNetworkGPU();
    console.log('Training model...');
    console.log(dataset.length)
    nn.train(dataset, {
        iterations: 1000,
        errorThresh: 0.0005,
        log: true,
        logPeriod: 1,
        learningRate: 0.3,
        momentum: 0.1,
        callback: null,
        callbackPeriod: 10,
        timeout: Infinity
    });
    console.log('Ending training...');
    saveModel(nn.toJSON());
}

function saveModel(model) {
    console.log("Saving model...")

    const date = Date.now();
    const dir = path.resolve(__dirname + `/../models`);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {
            recursive: true
        });
    }

    stringifyStream(model)
        .pipe(fs.createWriteStream(__dirname + `/../models/model-${date}.json`));

    console.log('Model succesfully saved!');
}

// Exporting neural network instance
module.exports = {
    //net: net,
    train: train,
    saveModel: saveModel
};
