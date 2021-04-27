const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const recipesUrls = 'https://www.carrefour.es/supermercado/recetas/';

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });

    const page = await browser.newPage();
    await page.goto(recipesUrls);

    const urlsImages = await page.evaluate(() => {
        const cardRecipes = document.querySelectorAll('div.receip-item[data-tag*="baja"] > div.receip-item-header > a > img, div.receip-item[data-tag*="media"] > div.receip-item-header > a > img, div.receip-item[data-tag*="alta"] > div.receip-item-header > a > img');
        const links = [];
        for (let link of cardRecipes) {

            //Receta rota
            if (link.src !== "https://static.carrefour.es/supermercado/bcc_static/catalogImages/creatividades/estaticas/recetas/nuevas/empanada.jpg") {
                links.push(link.src);
            }
        }
        return links;
    });

    const allReceips = [];
    for (const urlImage of urlsImages) {
        const pageReceip = await browser.newPage();
        const pageUrl = await page.evaluate((urlImage) => {
           return document.querySelector(`img[src="${urlImage}"]`).parentNode.href;
        }, urlImage);

        const nameRecipe = await page.evaluate((urlImage) => {
            return document.querySelector(`img[src="${urlImage}"]`).parentNode.title;
         }, urlImage);



        await pageReceip.goto(pageUrl);
        const infoReceip = await getAllInfoFromRecipe(pageReceip);
        infoReceip.img = urlImage;
        infoReceip.nameRecipe = nameRecipe;
        allReceips.push(infoReceip);
        await pageReceip.close();
    }

    const dir = `./data/recipes/carrefour/`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {
            recursive: true
        });
    }
    fs.writeFile(`./data/recipes/carrefour/recipes.json`, JSON.stringify(allReceips), err => {
        if (err) throw err;
    });

    await page.close();
    await browser.close();
})();

async function getAllInfoFromRecipe(page) {
    //const image = document.querySelector("")
    const properties = await recogimientoDeInformalizacionRecetil(page);
    const ingredients = await getIngredients(page);
    const preparation = await getPreparation(page);
    const necessaryProducts = await getNecessaryProducts(page);


    const infoRecipe = {
        properties: properties,
        ingredients: ingredients,
        preparation: preparation,
        necessaryProducts: necessaryProducts
    }

    return infoRecipe;


}


async function recogimientoDeInformalizacionRecetil(page) {
    const additionalInfo = await page.$eval('.receta-descripcion', containerInfo => {
        let urlVideo = containerInfo.querySelector('div.video-wrapper > iframe');

        if (urlVideo) urlVideo = urlVideo.src;
        const ellunesempiezo = containerInfo.querySelector("div.product-type > div.format > img.lunes");
        const author = containerInfo.querySelector("div.product-type > div.format > img.fabian");
        const despilfarro = containerInfo.querySelector("div.product-type > div.format > img.despilfarro");
        const gourmet = containerInfo.querySelector("div.product-type > div.format > img.gourmet");
        const bio = containerInfo.querySelector("div.product-type > div.format > span.bio");
        const gluten = containerInfo.querySelector("div.product-type > div.format > span.gluten");
        const lactosa = containerInfo.querySelector("div.product-type > div.format > span.lactosa");
        const vegano = containerInfo.querySelector("div.product-type > div.format > span.vegano");
        const vegetariano = containerInfo.querySelector("div.product-type > div.format > span.vegetariano");
        const difficulty = containerInfo.querySelector("div.product-type > div.format > img.difficulty");
        const recipeCategory = containerInfo.querySelector('div.product-type > div.format > p[itemprop="recipeCategory"]');
        const recipeYield = containerInfo.querySelector('div.product-type > div.format > p[itemprop="recipeYield"]');
        const calories = containerInfo.querySelector('div.product-type > div.format > p[itemprop="calories"]');
        const cookTime = containerInfo.querySelector('div.product-type > div.format > p[itemprop="cookTime"]');


        let description = "";
        let descriptionRecipeType1 = containerInfo.querySelector('p.receip-description');
        if (descriptionRecipeType1) description = descriptionRecipeType1.innerText;

        let descriptionRecipeType2 = containerInfo.querySelector('div.receta-descripcion > p');
        if (descriptionRecipeType1 == null && descriptionRecipeType2) description = descriptionRecipeType2.innerText;


        const properties = {
            urlVideo: urlVideo,
            description: description,
            ellunesempiezo: ellunesempiezo ? true : false,
            author: author ? "Fabian León" : null,
            despilfarro: despilfarro ? true : false,
            gourmet: gourmet ? true : false,
            bio: bio ? true : false,
            gluten: gluten ? true : false,
            lactosa: lactosa ? true : false,
            vegano: vegano ? true : false,
            vegetariano: vegetariano ? true : false,
            difficulty: difficulty ? difficulty.parentElement.querySelector("p").innerText : null,
            recipeCategory: recipeCategory ? recipeCategory.parentElement.querySelector("p").innerText : null,
            recipeYield: recipeYield ? recipeYield.parentElement.querySelector("p").innerText : null,
            calories: calories ? calories.parentElement.querySelector("p").innerText : null,
            cookTime: cookTime ? cookTime.parentElement.querySelector("p").innerText : null,


        }


        return properties;
    });

    return additionalInfo;
}

async function getIngredients(page) {
    const ingredients = await page.$$eval('.ingredients > div > ul > li', ingredients => {
        return ingredients.map(ingredient => {
            const name = ingredient.innerHTML;
            return name;
        });
    });

    return ingredients;
}


async function getPreparation(page) {
    const preparation = await page.$$eval('.receip-steps > div.step', steps => {
        return steps.map(step => {
            const stepText = step.querySelector('p').innerText;
            return stepText;
        });
    });

    return preparation;
}

async function getNecessaryProducts(page) {
    const necessaryProducts = await page.$$eval('article.product-card-item:not(:last-child)', listCard => {
        return listCard.map(cardElement => {
            
            // Replace de saltos de linea y trim de espacios vacios.
            const trimRepleace = function (string) {
                return string.replace(/(\r\n|\n|\r)/gm, '').trim();
            };
            let offer_price = 0;
            let price = 0;
            let offer_type = cardElement.querySelector('.bg-promocion-copy p.promocion-copy');

            const img = cardElement.querySelector("div.right-side > div.photo > a > img").src;
            const name = cardElement.querySelector("div.text > div.brand > a > p.title-product").innerText;
            const pricesContainer = cardElement.querySelector('.price-container');
            let stock = cardElement.querySelector('div.container-anadir > div.container-anadirBTN > button.anadirBTN');


            if (stock != null) {
                stock = true;
            } else {
                stock = false;
            }
            if (offer_type != null) offer_type = offer_type.innerHTML;

            if (pricesContainer.childElementCount > 2) {
                offer_price = trimRepleace(pricesContainer.querySelector('.price-less').innerText);
                price = trimRepleace(pricesContainer.querySelector('span.strike-price > strike').innerText);
            } else {
                price = trimRepleace(pricesContainer.querySelector('.price').innerText);
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

    return necessaryProducts;
}