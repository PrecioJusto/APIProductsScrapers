const fs = require('fs');
const path = require('path');
const extractor = require('./extractor.js');

const getAllFiles = (dirPath, arrayOfFiles) => {
    files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(file => {
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
    const allFiles = getAllFiles(path.resolve(__dirname + '../../../data/products'));

    console.time();

    const data = allFiles
        .map(fileString => {
            const file = fs.readFileSync(fileString);
            const products = JSON.parse(file);
            const allProducts = products.map(prod => {
                if (prod != null && prod != undefined && prod != 'null') {
                    console.log(prod);
                    return {
                        name: prod.name,
                        brand: extractor.getBrand(prod),
                        img: cleanImg(prod.img),
                        price: extractor.formatPrice(prod.price),
                        offer: extractor.getOffer(prod),
                        stock: prod.stock,
                        supermarketName: prod.super,
                        categoryName: extractor.getCategory(fileString),
                        pack: extractor.getPack(prod.name),
                        product_type: 'foodproduct'
                    };
                } else {
                    productosNull++;
                }
            });
        })
        .flat(1);

    console.timeEnd();
}

function cleanImg(img) {
    img.length > 1000 ? null : img;
}

module.exports = {
    decorator: productDecorator
};
