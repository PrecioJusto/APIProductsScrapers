const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const alcampoUrls = require('./alcampo_urls.json');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());


(async () => {

    const browser = await puppeteer.launch({
        headless: true
    });

    for (let category in alcampoUrls) {
        const page = await browser.newPage();
        for (let subCategory in alcampoUrls[category]) {
            const products = [];
            for (let url of alcampoUrls[category][subCategory]) {
                await page.goto(url);
                products.push(await getEachProductFromPage(page));
            }

            const dir = `./data/products/alcampo/${category}/`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, {
                    recursive: true
                });
            }
            fs.writeFile(`./data/products/alcampo/${category}/${subCategory}.json`, JSON.stringify(products.flat(2)), err => {
                if (err) throw err;
            });
        }
        await page.close();
    }
    await browser.close();
})();

async function getEachProductFromPage(page) {

    const totalProducts = -1;

    let originalUrl = page.url();
    let products = [];
    let currentPage = 1;


    while (totalProducts != 0) {
        products.push(await getAllFromPage(page));
        const pageUrl = `${originalUrl}?page=${currentPage}`;
        await page.goto(pageUrl);
        const actualTotalProducts = await page.$eval('.totalResults', el => el.innerText);

        //Si no hay productos, no seguiremos añadiendo productos
        if (actualTotalProducts.split(" ")[0] == 0) {
            break;
        }
        currentPage++;
    }
    return products;
}

async function getAllFromPage(page) {
    const product = await page.$$eval('.productGridItem', listCard => {
        return listCard.map(cardElement => {
            const siteProduct = cardElement.querySelector("h2 > a").href;
            const nameProduct = cardElement.querySelector(".productName span").innerHTML;
            const imageProduct = cardElement.querySelector("h2 > a > .cut-alt-img > img").src;
            const price = cardElement.querySelector(".price").innerText.split("\n")[0];
            const marca = cardElement.querySelector(".marca span").innerText;
            let offer = null;
            let stock = true;
            const buttonStock = cardElement.querySelector('button[class*="out-of-stock"]');
            const divOffer = cardElement.querySelector("div.secondary_card > div.promo_card");

            if (divOffer) offer = "unknown";
            if (buttonStock) stock = false;

            return {
                img: imageProduct,
                name: nameProduct,
                price: price,
                offer_price: 0,
                offer_type: offer,
                stock: stock,
                super: 'alcampo'
            };
        });
    });
    return product;
}