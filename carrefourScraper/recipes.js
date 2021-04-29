const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const recipesUrls = 'https://www.carrefour.es/supermercado/recetas/';

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        headless: true
    });

    const page = await browser.newPage();
    await page.goto(recipesUrls);

    const receipList = await page.$('.plp-items');
})();
