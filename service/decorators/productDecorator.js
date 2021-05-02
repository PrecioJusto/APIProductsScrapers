const fs = require('fs');
const path = require('path');
const extractor = require('./extractor.js');

const getAllFiles = (dirPath, arrayOfFiles) => {
    files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach((file) => {
        if (fs.statSync(dirPath + '/' + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, '/', file));
        }
    });

    return arrayOfFiles;
};

productDecorator();

function productDecorator() {
    let productosNull = 0;
    const allFiles = getAllFiles(path.resolve(__dirname + "../../../data/products"));
    const data = allFiles.map(fileString => {
        const file = fs.readFileSync(fileString);
        const products = JSON.parse(file);
        return products.map(prod => {
            if (prod != null && prod != undefined && prod != "null") {
                return {
                    name: prod.name,
                    brand: extractor.getBrand(prod.name),
                    img: cleanImg(prod.img),
                    price: extractor.formatPrice(prod.price),
                    offer_price: extractor.formatPrice(prod.offer_price),
                    offer_type: prod.offer_type,
                    stock: prod.stock,
                    super: prod.super,
                    category: extractor.getCategory(fileString),
                    pack: extractor.getPack(prod.name),
                    product_type: 'foodproduct'
                };
            } else {
                productosNull++;
            }
        });
    }).flat(1);

    console.log(data);
    console.log(data.length)
}

function cleanImg(img) {
    img.length > 1000 ? null : img;
}

module.exports = {
    productDecorator: productDecorator
}