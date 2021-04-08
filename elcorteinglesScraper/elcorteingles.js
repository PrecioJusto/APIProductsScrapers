//const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');
const urls = require('./eciProducts.json');

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });

    const categories = Object.keys(urls);
    const page = await browser.newPage();

    for (let category in urls) {
        const page = await browser.newPage();
        for (let subcategory in urls[category]) {
            for (let url of urls[category][subcategory]) {
                await page.goto(url);
                const products = await getProducts(page);
                console.log(products);

                /*
                const dir = ./data/${category}/;
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, {
                        recursive: true
                    });
                }
                fs.writeFile(./data/${category}/${subCategory}.json, JSON.stringify(products), err => {
                    if (err) throw err;
                });
                */
            }
        }
        await page.close();
    }
})();

async function getProducts(page) {
    await autoScroll(page);
    /*
    const listContainer = await page.$('.product-card-list__list');
    const product = await listContainer.$$eval('li .product-card', listCard => {
        return listCard.map(cardElement => {
            // Replace de saltos de linea y trim de espacios vacios.
            const trimRepleace = function (string) {
                return string.replace(/(\r\n|\n|\r)/gm, '').trim();
            };
            let price = null;

            const img = cardElement.querySelector('img').src;
            const name = trimRepleace(cardElement.querySelector('.product-card__title a').innerHTML);
            const pricesContainer = cardElement.querySelector('.product-card__prices');

            if (pricesContainer.childElementCount > 1) {
                price = trimRepleace(pricesContainer.querySelector('.product-card__price--current').innerHTML);
            } else price = trimRepleace(pricesContainer.querySelector('.product-card__price').innerHTML);

            return {
                img: img,
                name: name,
                pack: 2,
                envase: {
                    capacidad: '',
                    type: 'can'
                },
                price: price,
                super: 'carrefour'
            };
        });
    });
    return product;
    */
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            let distance = 50;
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight - 1300) {
                    clearInterval(timer);
                    resolve();
                }
            }, 200);
        });
    });
}
