const puppeteer = require('puppeteer');
const fs = require('fs');

const urlsCategoriesAlcampo = {
    bebidas: {
        urls: [
            'https://www.alcampo.es/compra-online/bebidas/bebidas-refrescantes/c/W1103',
            'https://www.alcampo.es/compra-online/bebidas/cervezas/c/W1107',
            'https://www.alcampo.es/compra-online/bebidas/zumos-de-frutas/c/W1102'
        ]
    }
};