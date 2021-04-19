const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const alcampoUrls = require('./alcampo_urls.json');

(async () => {

    const browser = await puppeteer.launch({
        headless: false
    });

    for (let category in alcampoUrls) {
        const page = await browser.newPage();
        for (let subCategory in alcampoUrls[category]) {
            const products = [];
            for(let url of alcampoUrls[category][subCategory]) {
                await page.goto(url);
                products.push(await getEachProductFromPage(page));
            }
            
            const dir = `./data/${category}/`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, {
                    recursive: true
                });
            }
            fs.writeFile(`./data/${category}/${subCategory}.json`, JSON.stringify(products.flat(2)), err => {
                if (err) throw err;
            });
        }
        await page.close();
    }
})();

async function getEachProductFromPage(page) {

    const totalProducts = -1;

    let originalUrl = page.url();
    let products = [];
    let currentPage = 1;


    while(totalProducts != 0) {
        products.push(await getAllFromPage(page));
        const pageUrl = `${originalUrl}?page=${currentPage}`;
        console.log(pageUrl);
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
            return {
                img: imageProduct,
                name: nameProduct,
                price: price,
                offer_price: 0,
                offer_type: null,
                stock: false,
                super: 'alcampo'
            };
        });
    });
    return product;
}