const fs = require("fs");
const brain = require("../utils/brain.js");
const mimir = require("../utils/bow.js"),
  bow = mimir.bow,
  dict = mimir.dict,
  tfidf = mimir.tfidf,
  tokenize = mimir.tokenize;

net = new brain.NeuralNetwork();

console.log('Loading pre-trained model...');
const file = fs.readFileSync('../models/model.json');
const model = JSON.parse(file);

net.fromJSON(model);
classify();

export function classify(prod) {
    const output = net.run(bow(prod, dict));
    console.log(output);

    const tmp = Object.keys(output).sort((a, b) => output[b] - output[a]).slice(0, 5);
    const cleanedRes = tmp.map(elem => {
        return {
            brand: elem,
            conf: output[elem]
        }
    })
    console.log(cleanedRes);
}