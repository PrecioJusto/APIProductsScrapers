const fetch = require('../fetching/brandFetch');

(async () => {
    await fetch.loadingModel();
    const res = await fetch.classify('Coca cola zero');
    console.log(res);
})();