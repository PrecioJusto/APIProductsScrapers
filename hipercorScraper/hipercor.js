const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');
const urls = require('./hipercorProducts.json');

(async () => {
    for (let category in urls) {
        const browser = await puppeteer.launch({
            headless: true
        });

        const page = await browser.newPage();
        for (let subcategory in urls[category]) {
            const dirtyProducts = [];
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

                    dirtyProducts.push(await getProducts(page));
                    await getProducts(page);
                    actualPage++;
                }
            }

            const cleanProducts = dirtyProducts.flat(1);

            const dir = `./data/products/hipercor/${category}/`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, {
                    recursive: true
                });
            }
            fs.writeFile(`./data/products/hipercor/${category}/${subcategory}.json`, JSON.stringify(cleanProducts), err => {
                if (err) throw err;
            });
        }
        await page.close();
        await browser.close();
    }
})();

async function getProducts(page) {
    const elements = await page.evaluate(() =>
        [...document.querySelectorAll('.js-product')].map(elem => {
            if (elem.dataset.json.length > 1) {
                const name = JSON.parse(elem.dataset.json).name;
                const brand = JSON.parse(elem.dataset.json).brand;
                const price =
                    JSON.parse(elem.dataset.json).discount == true
                        ? JSON.parse(elem.dataset.json).price.original
                        : JSON.parse(elem.dataset.json).price.final;
                const offer_price = JSON.parse(elem.dataset.json).discount == true ? JSON.parse(elem.dataset.json).price.final : 0;
                const offer_type =
                    elem.querySelector('.product_tile-description_holder .product_tile-offers_desktop_holder .offer-description') != null
                        ? elem.querySelector('.product_tile-description_holder .product_tile-offers_desktop_holder .offer-description')
                              .innerText
                        : false;
                const stock = JSON.parse(elem.dataset.json).status == 'AVAILABLE' ? true : false;
                const img = changeImgSrc(elem.querySelector('.product_tile-left_container > .product_tile-image > a > img').src);

                return {
                    name: name,
                    brand: brand,
                    price: price,
                    img: img,
                    offer_price: offer_price,
                    offer_type: offer_type,
                    stock: stock, // pending change on fix.
                    supermarket: 'elcorteingles'
                };
            }

            function changeImgSrc(img) {
                return img.replace('40x40', '325x325');
            }
        })
    );
    return elements;
}
