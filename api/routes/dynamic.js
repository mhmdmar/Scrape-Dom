const express = require('express');
const scrape = require('/Rest/scraper/dynamicScrape');
const router = express.Router();
router.get('/', (req, res, next) => {
    res.status(200).json({
        message: "Scrape only work with post"
    });
});
router.post('/', (req, res, next) => {
    let url = req.body.url;
    if (!url) {
        res.status(400).json({
            Result: 'Url to scrape is not supplied'
        });
    }
    scrape(req.body).then(function (result) {
        res.status(200).json(result);
    });
});


module.exports = router;