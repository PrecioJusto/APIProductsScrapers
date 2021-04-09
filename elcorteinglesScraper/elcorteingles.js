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

    let isFirstTime = true;
    for (let category in urls) {
        const page = await browser.newPage();
        for (let subcategory in urls[category]) {
            for (let url of urls[category][subcategory]) {
                await page.goto(url);
                const products = await getProducts(page, isFirstTime);
                isFirstTime = false;
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

async function getProducts(page, isFirstTime) {
    await page.waitForTimeout(3000);
    if (isFirstTime) {
        await page.click('._pagination');
    }
    await autoScroll(page);

    const elements = await page.evaluate(() =>
        [...document.querySelectorAll('.js-product')].map(elem => {
            const name = JSON.parse(elem.dataset.json).name;
            const brand = JSON.parse(elem.dataset.json).brand;
            const price = JSON.parse(elem.dataset.json).price.final;
            const img = elem.querySelector('.product_tile-left_container > .product_tile-image > a > img').src;
            const pack = extractPack(name);
            const container = extractContainer(name);

            return {
                name: name,
                brand: brand,
                price: price,
                pack: pack,
                container: container,
                img: img
            };
        })
    );
    return elements;
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
            }, 5);
        });
    });
}

function extractPack(name) {}

function extractContainer(name) {}
