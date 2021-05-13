const neuralNetwork = require('../training/train.js');
//const genDataset = require('../preprocessLayer/genDataset');
//const genTrainingDS = require('../preprocessLayer/cleanDataset.js');
const dirtyDataset = require('../datasets/dirtydataset-1620590889823.json');
const genDict = require('../preprocessLayer/genDict.js');
const mimir = require('../../../../utils/mimir.js');

(() => {
    const dict = genDict.genDict();

    const tmp = [];
    const reduceddataset = dirtyDataset.filter(prod => {
        if (prod != null || prod != undefined && prod.qs >= 0.55) {
            tmp.push(prod.brand);
            return tmp.filter(elem => elem === prod.brand).length < 3;
        }
    }).map(prod => {
        return {
            input: mimir.bow(prod.name, dict),
            output: {
                [prod.brand]: 1
            }
        }
    });

    neuralNetwork.train(reduceddataset);
})();