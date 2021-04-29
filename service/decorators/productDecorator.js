const fs = require('fs');
const path = require('path');
const extractor = require('./extractor.js');

const getAllFiles = function (dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + '/' + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(__dirname, dirPath, '/', file));
        }
    });

    return arrayOfFiles;
};

const allFiles = getAllFiles('../../data/products');
const data = allFiles.forEach(fileString => {
    console.log('Reading file ' + fileString);
    const file = fs.readFileSync(fileString);
    const products = JSON.parse(file);
    return products.map(prod => {
        return {
            name: prod.name,
            brand: extractor.getBrand(prod.name),
            img: prod.img,
            price: extractor.formatPrice(prod.price),
            offer_price: extractor.formatPrice(prod.offer_price),
            offer_type: prod.offer_type,
            stock: prod.stock,
            super: prod.super,
            category: fileString, // not working
            pack: extractor.getPack(prod.name)
        };
    });
});

console.log(data);

