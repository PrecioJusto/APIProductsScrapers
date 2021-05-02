const train = require('../training/train.js');
const genDataset = require('../preprocessLayer/genDataset');
const genTrainingDS = require('../preprocessLayer/cleanDataset.js');

(() => {
    genTrainingDS.cleanDataset();
})();