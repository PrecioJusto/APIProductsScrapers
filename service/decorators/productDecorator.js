const { Console } = require('console');
const fs = require('fs');
const path = require('path');
const extractor = require('./extractor.js');
const extractorTest = require('./extractorTest.js');

Array.prototype.performanceFilter = function (fn) {
    const f = [];
    for (let i = 0; i < this.length; i++) {
        if (fn(this[i])) {
            f.push(this[i]);
        }
    }
    return f;
};

const fil = (fn, a) => {
    const f = []; //final
    for (let i = 0; i < a.length; i++) {
        if (fn(a[i])) {
            f.push(a[i]);
        }
    }
    return f;
};

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

function readFiles(filePath) {
    return new Promise(resolve => {
        fs.readFile(filePath, (err, data) => resolve(JSON.parse(data.toString())));
    });
}

function generateThreads(prod, fileString) {
    return new Promise(resolve => {
        if (extractor.getCategory(fileString) === 'aceite_y_vinagre') {
            return resolve({
                name: prod.name,
                brand: extractor.getBrand(prod),
                img: cleanImg(prod.img),
                price: extractor.formatPrice(prod.price),
                //offer: extractor.getOffer(),
                //offer_price: extractor.formatPrice(prod.offer_price),
                //offer_type: prod.offer_type,
                stock: prod.stock,
                container: extractor.getContainer(prod),
                supermarketName: prod.supermarket,
                categoryName: extractor.getCategory(fileString),
                pack: extractor.getPack(prod.name),
                product_type: 'foodproduct'
            });
        }
    });
}

async function productDecorator() {
    let productosNull = 0;
    const allFiles = getAllFiles(path.resolve(__dirname + '../../../data/products'));

    /*
    const filesData = await Promise.all(allFiles.map(readFiles))

    const data2 = filesData.map(products => {
        return products.reduce()
    })
    */

    console.time('Productos');

    const data = /*await*/ allFiles
        .map(
            /*async*/ fileString => {
                const file = fs.readFileSync(fileString);
                const products = JSON.parse(file);

                //const threadedWorks = products.map(prod => generateThreads(prod, fileString));
                //return await Promise.all(threadedWorks);

                return products.reduce((res, prod) => {
                    if (
                        prod != null &&
                        prod != undefined &&
                        prod != 'null' /* && extractor.getCategory(fileString) === 'aceite_y_vinagre'*/
                    ) {
                        res.push({
                            name: prod.name,
                            brand: extractor.getBrand(prod),
                            img: cleanImg(prod.img),
                            price: extractor.formatPrice(prod.price),
                            offer: extractor.getOffer(prod),
                            stock: prod.stock,
                            container: extractor.getContainer(prod),
                            supermarketName: prod.supermarket,
                            categoryName: extractor.getCategory(fileString),
                            pack: extractor.getPack(prod.name),
                            product_type: 'foodproduct'
                        });
                    } else {
                        productosNull++;
                    }
                    return res;
                }, []);
            }
        )
        .flat(1);

    //const data = await Promise.all(promises);

    console.timeEnd('Productos');
    console.log('data.length', data.length);
    console.time('Procesado_prods');

    const rv = data.reduce((res, prod) => {
        const heuristicFilter = data.performanceFilter(
            p =>
                prod.categoryName === p.categoryName &&
                prod.brand === p.brand &&
                prod.product_type === p.product_type &&
                prod.pack === p.pack
        );

        const groupedBySupermarket = groupBy(heuristicFilter, 'supermarketName');
        groupedBySupermarket.forEach(supermarket => {
            supermarket.values = supermarket.values.reduce((a, b) =>
                extractor.sorensenDice(prod.name, a.name) > extractor.sorensenDice(prod.name, b.name) ? a : b
            );
            const index = data.indexOf(supermarket.values);
            data.splice(index, 1);
        });

        const coincidences = groupedBySupermarket.map(supermarket => {
            return {
                name: supermarket.values.name,
                img: supermarket.values.img,
                price: supermarket.values.price,
                stock: supermarket.values.stock,
                supermarket: supermarket.key
            };
        });

        let name;
        if (prod.supermarketName === 'elcorteingles') {
            name = prod.name;
        } else if (prod.supermarketName === 'hipercor') {
            name = prod.name;
        } else {
            const tmp = coincidences.find(c => c.supermarket === 'elcorteingles' || c.supermarket === 'hipercor');
            if (tmp != undefined) {
                name = tmp.name;
            } else {
                name = prod.name;
            }
        }

        res.push({
            name: name,
            brand: prod.brand,
            category: prod.categoryName,
            supermarketProducts: coincidences,
            pack: prod.pack,
            product_type: prod.product_type
        });

        console.log('data.length', data.length);

        return res;
    }, []);
    console.timeEnd('Procesado_prods');

    //console.log(rv);
    //console.log('-----')
    console.log('-----');
    console.log(rv.length);
    console.log('-----');
    console.log(rv[0]);
}

function groupBy(xs, key) {
    return xs.reduce((rv, x) => {
        let v = key instanceof Function ? key(x) : x[key];
        let el = rv.find(r => r && r.key === v);
        if (el) {
            el.values.push(x);
        } else {
            rv.push({ key: v, values: [x] });
        }
        return rv;
    }, []);
}

function cleanImg(img) {
    return img.length > 1000 ? null : img;
}

module.exports = {
    decorator: productDecorator
};
