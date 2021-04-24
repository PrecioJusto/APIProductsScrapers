const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');
const urls = require('./eciBrands.json');

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    const categoryUrls = Object.values(urls);

    const brands = [];
    for (url of categoryUrls) {
        console.log(url);

        await page.goto(url);
        await page.waitForTimeout(1000);
        await page.waitForSelector('.js-show-dimension-modal');
        await page.click('.js-show-dimension-modal');
        await page.waitForSelector('.lookup-list_item > .lookup-list_item-text');

        const brandsFromPage = await page.evaluate(() => {
            const tmp = [];
            document.querySelectorAll('.lookup-list_item > .lookup-list_item-text').forEach(elem => {
                tmp.push(elem.innerHTML.split('<span>')[0]);
            });

            return tmp;
        });

        brandsFromPage.forEach(b => brands.push(b));
    }

    await page.close();
    await browser.close();

    const filteredBrands = brands
        .sort((a, b) => a.localeCompare(b))
        .filter((x, idx, arr) => {
            if (x !== arr[idx - 1]) {
                return x;
            }
        });

    const dir = `./data/brands/eci/`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {
            recursive: true
        });
    }
    fs.writeFile(`./data/brands/eci/eciBrands.json`, JSON.stringify(filteredBrands), err => {
        if (err) throw err;
    });
})();
