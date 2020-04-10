const express = require("express");
const router = express.Router();

const genericScrape = require("../../scraper/genericScrape");
const dynamicScrape = require("../../scraper/dynamicScrape");

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Provide the scraper's name you want to work with"
  });
});

router.get("/scrape", (req, res) => {
  res.status(200).json({
    message: "Scrape only work with post"
  });
});

router.post("/scrape", (req, res) => {
  let url = req.body.url;
  if (!url) {
    res.status(400).json({
      Result: "Url to scrape is not supplied"
    });
  }
  genericScrape(req.body).then(function(result) {
    res.status(200).json(result);
  });
});

router.get("/dynamic", (req, res, next) => {
  res.status(200).json({
    message: "Scrape only work with post"
  });
});
router.post("/dynamic", (req, res, next) => {
  let url = req.body.url;
  if (!url) {
    res.status(400).json({
      Result: "Url to scrape is not supplied"
    });
  }
  dynamicScrape(req.body).then(function(result) {
    res.status(200).json(result);
  });
});

module.exports = router;
