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
                    prodname: prod.name,
                    branname: extractor.getBrand(prod.name),
                    prodimg: cleanImg(prod.img),
                    suprprice: extractor.formatPrice(prod.price),
                    offer_price: extractor.formatPrice(prod.offer_price),
                    offer_type: prod.offer_type,
                    suprstock: prod.stock,
                    supename: prod.super,
                    catename: extractor.getCategory(fileString),
                    packquantity: extractor.getPack(prod.name),
                    product_type: 'foodproduct'
                };
            } else {
                productosNull++;
            }
        });
    }).flat(1);


    const testdata = [
        {
            name: 'Tronquitos de Alaska FRUDESA 450 gr',
            brand: 'FRUDESA',
            img: 'https://www.alcampo.es/media/h96/hb8/8878513913886.jpg',
            price: 123,
            offer_price: 0,
            offer_type: null,
            stock: true,
            super: 'alcampo',
            category: 'aceite_y_vinagre',
            pack: '_unknown',
            product_type: 'foodproduct'
        },
        {
            name: 'Crema de vinagre a la manzana SIBARI 225 g.',
            brand: 'SIBARI',
            img: 'https://www.alcampo.es/media/h36/h9a/9510413795358.jpg',
            price: 124,
            offer_price: 0,
            offer_type: null,
            stock: true,
            super: 'alcampo',
            category: 'aceite_y_vinagre',
            pack: '_unknown',
            product_type: 'foodproduct'
        }, {
            name: 'Crema de vinagre balsámico de vino blanco SIBARI 225 g.',
            brand: 'SIBARI',
            img: 'https://www.alcampo.es/media/h96/hb8/8878513913886.jpg',
            price: 325,
            offer_price: 0,
            offer_type: null,
            stock: true,
            super: 'alcampo',
            category: 'aceite_y_vinagre',
            pack: '_unknown',
            product_type: 'foodproduct'
        }, {
            name: 'Batido de fresa PRODUCTO ALCAMPO pack 6 uds. x 20 ml.',
            brand: 'PRODUCTO ALCAMPO',
            img: 'https://www.alcampo.es/media/h96/hb8/8878513913886.jpg',
            price: 623,
            offer_price: 0,
            offer_type: null,
            stock: true,
            super: 'alcampo',
            category: 'batidos_y_horchatas',
            pack: '_unknown',
            product_type: 'foodproduct'
        }, {
            name: 'Batido de chocolate 100% natural CENTRAL LECHERA ASTURIANA 6 x 200 ml.',
            brand: 'CENTRAL LECHERA ASTURIANA',
            img: 'https://www.alcampo.es/media/h96/hb8/8878513913886.jpg',
            price: 125,
            offer_price: 0,
            offer_type: "3x2",
            stock: true,
            super: 'carrefour',
            category: 'cacao',
            pack: '_unknown',
            product_type: 'foodproduct'
        },
    ];

    return testdata;
}

function cleanImg(img) {
    img.length > 1000 ? null : img;
}

module.exports = {
    decorator: productDecorator
}