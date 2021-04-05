const puppeteer = require('puppeteer');
const fs = require('fs');

const urlsCategoriesCarrefour = {
    bebidas: {
        urls: [
            'https://www.carrefour.es/supermercado/bebidas/cerveza/cat20023/c',
            'https://www.carrefour.es/supermercado/bebidas/aguas-y-zumos/cat650002/c',
            'https://www.carrefour.es/supermercado/bebidas/alcoholes/cat20022/c'
        ]
    }
};

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });

    for (let category in urlsCategoriesCarrefour) {
        const page = await browser.newPage();
        for (let url of urlsCategoriesCarrefour[category].urls) {
            await page.goto(url);
            let subCategory = url.split('/')[5];
            const products = await getEachProductFromPage(page);
            fs.writeFile(`./data/${category}/${subCategory}.json`, JSON.stringify(products), err => {
                if (err) throw err;
            });
        }
        await page.close();
    }
})();

async function getEachProductFromPage(page) {
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

    for (let actualPage = 1; actualPage <= totalPages - 1; actualPage++) {
        products.push(await getAllFromPage(page));
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
