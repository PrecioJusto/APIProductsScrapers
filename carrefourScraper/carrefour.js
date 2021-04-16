const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const carrefourUrls = require('./carrefour_urls.json');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });

    for (let category in carrefourUrls) {
        const page = await browser.newPage();
        for (let subcategory in carrefourUrls[category]) {
            const products = [];
            for (let url of carrefourUrls[category][subcategory]) {
                await page.goto(url);
                products.push(await getProducts(page));
            }
            const dir = `../data/products/carrefour/${category}/`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, {
                    recursive: true
                });
            }
            fs.writeFile(`../data/products/carrefour/${category}/${subcategory}.json`, JSON.stringify(products), err => {
                if (err) throw err;
            });
        }
        await page.close();
    }
})();

async function getProducts(page) {
    // Obtiene productos que se muestran actualmente y total de productos. Ej [1],[24],[1008]
    const vars = await page.$$eval('.pagination__results span', span => {
        const info = span.map(cardElement => {
            return cardElement.innerHTML;
        });
        return info;
    });

    //Ceil para no obtener 27.456 paginas
    const totalPages = Math.ceil(vars[2] / vars[1]);
    let originalUrl = page.url();
    let productsPerPage = vars[1] - (vars[0] - 1);
    let products = [];

    if (totalPages == 1) return await getAllFromPage(page);

    for (let actualPage = 1; actualPage <= totalPages - 1; actualPage++) {
        products.push(await getAllFromPage(page));
        console.log(products);
        if (actualPage < totalPages - 1) {
            const pageUrl = `${originalUrl}?offset=${(actualPage - 1) * productsPerPage + productsPerPage * 2}`;
            await page.goto(pageUrl);
        }
    }
    return products;
}

async function getAllFromPage(page) {
    await autoScroll(page);

    const listContainer = await page.$('.product-card-list__list');
    const product = await listContainer.$$eval('li .product-card', listCard => {
        return listCard.map(cardElement => {
            // Replace de saltos de linea y trim de espacios vacios.
            const trimRepleace = function (string) {
                return string.replace(/(\r\n|\n|\r)/gm, '').trim();
            };
            let offer_price = 0;
            let price = 0;
            let offer_type = cardElement.querySelector('.badge span');

            const img = cardElement.querySelector('img').src;
            const name = trimRepleace(cardElement.querySelector('.product-card__title a').innerHTML);
            const pricesContainer = cardElement.querySelector('.product-card__prices');
            const stock = cardElement.querySelector('.add-to-cart-button').innerText.includes('Añadir');

            if (offer_type != null) offer_type = offer_type.innerHTML;

            if (pricesContainer.childElementCount > 1) {
                offer_price = trimRepleace(pricesContainer.querySelector('.product-card__price--current').innerHTML);
                price = trimRepleace(pricesContainer.querySelector('.product-card__price--strikethrough').innerHTML);
            } else {
                price = trimRepleace(pricesContainer.querySelector('.product-card__price').innerHTML);
            }

            return {
                img: img,
                name: name,
                price: price,
                offer_price: offer_price,
                offer_type: offer_type,
                stock: stock,
                supermarket: 'carrefour'
            };
        });
    });
    return product;
}

// The distance and the interval can be changed for faster data, but less consistency
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            let distance = 100;
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight - 1300) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}
