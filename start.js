const alcampo = require('./alcampoScraper/alcampo');
const carrefour = require('./carrefourScraper/carrefour');
const recipesCarrefour = require('./carrefourScraper/recipes');
const elcorteingles = require('./elcorteinglesScraper/elcorteingles');
const hipercor = require('./hipercorScraper/hipercor');
const productDecorator = require('./service/decorators/productDecorator');
const request = require('./controller/request');
//

T//his script can take a total of 10 hours to fully run.
(async () => {
    const al = alcampo.executeAlcampo();
    const el = elcorteingles.executeEci();
    const hi = hipercor.executeHipercor();
    const rc = recipesCarrefour.executeRecipes();
    const promises = await Promise.all([al, el, hi, rc]);
    const ca = await carrefour.executeCarrefour();

    const pd = await productDecorator.decorator();
    
    //Do a request with all products to APIProducts
    const status = await request.sendProductData(pd);
    await console.log(status);
})();