const alcampo = require('./alcampoScraper/alcampo');
const carrefour = require('./carrefourScraper/carrefour');
const recipesCarrefour = require('./carrefourScraper/recipes');
const elcorteingles = require('./elcorteinglesScraper/elcorteingles');
const hipercor = require('./hipercorScraper/hipercor');
const productDecorator = require('./service/decorators/productDecorator');
const request = require('./controller/request');

//This script can take a total of 10 hours to fully run.
(async () => {
    const al = alcampo.executeAlcampo();
    const el = elcorteingles.executeEci();
    const hi = hipercor.executeHipercor();
    const rc = recipesCarrefour.executeRecipes();
    await Promise.all([al, el, hi, rc]);
    await carrefour.executeCarrefour();

    const data = await productDecorator.decorator();
    
    //Do a request with all products to APIProducts
    const status = await request.sendProductData(data);
    await console.log(status);
})();