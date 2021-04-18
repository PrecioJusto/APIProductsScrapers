const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');
const urls = require('./eciProducts.json');

(async () => {
    for (let category in urls) {
        const browser = await puppeteer.launch({
            headless: false
        });

        const page = await browser.newPage();
        for (let subcategory in urls[category]) {
            const products = [];
            let actualPage;
            let lastPage;
            let isFirstTime;
            for (let url of urls[category][subcategory]) {
                actualPage = 1;
                lastPage = 99;
                isFirstTime = true;

                while (actualPage <= lastPage) {
                    await page.goto(`${url}${actualPage}/`);
                    await page.waitForSelector('.grid-coincidences');

                    if (isFirstTime) {
                        lastPage = await page.evaluate(() => {
                            const tmp = document.querySelector('.grid-coincidences').innerText;
                            const tmpArray = tmp.split(' ');
                            lastPage = parseInt(Math.ceil(tmpArray[0] / 24));
                            return lastPage;
                        });
                        isFirstTime = false;
                    }

                    products.push(await getProducts(page));
                    actualPage++;
                }
            }

            const dir = `./data/products/eci/${category}/`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, {
                    recursive: true
                });
            }
            fs.writeFile(`./data/products/eci/${category}/${subcategory}.json`, JSON.stringify(products), err => {
                if (err) throw err;
            });
        }
        await page.close();
        await browser.close();
    }
})();

async function getProducts(page) {
    //await autoScroll(page);

    const elements = await page.evaluate(() =>
        [...document.querySelectorAll('.js-product')].map(elem => {
            if (elem.dataset.json.length > 1) {
                const name = JSON.parse(elem.dataset.json).name;
                const brand = JSON.parse(elem.dataset.json).brand;
                const price = JSON.parse(elem.dataset.json).price.final;
                const img = changeImgSrc(
                    elem.querySelector('.product_tile-left_container > .product_tile-image > a > img').src
                );
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
            }

            function extractPack(name) {}

            function extractContainer(name) {
                const containers = ['botella', 'brik', 'garrafa', 'lata', 'bolsa', 'envase'];
                const productContainer = containers.find(container => name.includes(container));
                if (productContainer == undefined || 1 > productContainer.length) {
                    return 'unknown';
                }
                return productContainer;
            }

            function changeImgSrc(img) {
                return img.replace('40x40', '325x325');
            }
        })
    );
    return elements;
}
