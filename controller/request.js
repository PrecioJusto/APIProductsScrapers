const axios = require('axios');

const urlProd = 'http://APIProductsJava:5000';
const urlDev = "http://localhost:4000";

console.log('Executing request');
async function sendProductData(data) {
    console.log('Executing send product data');
    axios({
        method: 'POST',
        url: `${urlProd}/api/extractor/product`,
        data: JSON.stringify(data),
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    }).then(
        response => {
            console.log('Completed Successfully');
            console.log(response);
            return response;
        },
        error => {
            console.log('An error has occurred');
            console.log(error);
            return error;
        }
    );
}

function sendRecipeData(data) {
    axios({
        method: 'POST',
        url: `${url}/addDataRecipe`,
        data: data,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(
        response => {
            console.log(response);
        },
        error => {
            console.log(error);
        }
    );
}

module.exports = {
    sendProductData: sendProductData,
    sendRecipeData: sendRecipeData
};
