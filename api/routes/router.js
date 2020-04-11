const express = require("express");
const router = express.Router();

const genericScrape = require("../../scraper/genericScrape");
const dynamicScrape = require("../../scraper/dynamicScrape");

const endPoints = {
    genericScrape: "/scrape",
    dynamicScrape: "/dynamic"
};

function validateQuery(req, res) {
    if (!req.body || !req.body.url) {
        res.status(400).json({
            error: "Url to scrape is not supplied"
        });
    }
}

router.get("/", (req, res) => {
    res.status(200).json({
        message: "Provide the scraper's name you want to work with"
    });
});

router.get(endPoints.genericScrape, (req, res) => {
    res.status(200).json({
        message: "Scrape only work with post"
    });
});

router.post(endPoints.genericScrape, async (req, res) => {
    validateQuery(req, res);
    const result = await genericScrape(req.body);
    res.status(200).json(result);
});

router.get(endPoints.dynamicScrape, (req, res, next) => {
    res.status(200).json({
        message: "Scrape only work with post"
    });
});
router.post(endPoints.dynamicScrape, async (req, res, next) => {
    validateQuery(req, res);
    const result = await dynamicScrape(req.body);
    res.status(200).json(result);
});

module.exports = router;
