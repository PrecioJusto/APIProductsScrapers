const fs = require('fs');
const mimir = require('../utils/mimir.js'),
    dict = mimir.dict;
const dataset = require('../datasets/dataset.json');

const names = dataset.map(elem => elem.name);
const corpus = dict(names);
console.log(corpus);

const dir = `../utils`;
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
        recursive: true
    });
}
fs.writeFile(`../utils/dict.txt`, corpus, err => {  // save as txt or json
    if (err) throw err;
});
