const puppeteer = require("puppeteer");

const bannedChars = ["stylesheet", "font", "image"];

async function DynamicScrape(json) {
    let startTime = Date.now();
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080});
    await page.setRequestInterception(true);
    //Block images and css to speed performance
    await page.on("request", req => {
        if (bannedChars.includes(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }
    });

    await page.goto(json.url, {timeout: 100000});
    await page.waitFor(1000);
    let result = {};
    result = await scraper(page, json["scrape"], result);
    let endTime = Date.now();
    let phrase = "seconds";
    let duration = (endTime - startTime) / 1000;
    if (duration > 60) {
        duration = Number((duration / 60).toFixed(2));
        phrase = "minutes";
    }
    result.duration = duration + " " + phrase;
    return result;
}
async function scraper(page, scrape, result, listChild, index) {
    for (let item in scrape) {
        if (scrape[item]["children"]) {
            if (!scrape[item].list) {
                result[scrape[item].name] = {};
                for (i in scrape[item].children)
                    await scraper(page, scrape[item].children, result[scrape[item].name]);
            } else {
                if (!result[scrape[item].name]) result[scrape[item].name] = [];
                let element = await scrapeElement(
                    page,
                    scrape[item].selector,
                    scrape[item].type,
                    scrape[item].list,
                    false
                );
                console.dir(element.length);
                for (let b in element) {
                    result[scrape[item].name][b] = {};
                    result[scrape[item].name][b] = await scraper(
                        page,
                        scrape[item].children,
                        result[scrape[item].name][b],
                        scrape[item].list,
                        b
                    );
                }
            }
        }
        if (!scrape[item]["name"] || !scrape[item]["selector"]) {
            if (!scrape[item]["name"]) {
                result[item] = "Name is not supplied for this element";
                continue;
            }
            if (!scrape[item]["selector"] && !scrape[item]["children"]) {
                result[scrape[item].name] = "Selector is not supplied for this element";
                continue;
            }
        }
        if (!scrape[item].list && !scrape[item]["children"]) {
            result[scrape[item].name] = await scrapeElement(
                page,
                scrape[item].selector,
                scrape[item].type,
                scrape[item].list,
                index
            );
        } else if (!scrape[item]["children"]) {
            result[scrape[item].name] = await scrapeElement(
                page,
                scrape[item].selector,
                scrape[item].type,
                scrape[item].list
            );
        }
    }
    return result;
}
async function scrapeElement(page, selector, type, list, index) {
    if (list || index) {
        const elements = await page.evaluate(
            (selector, type) => {
                let custom = false;
                const links = Array.from(document.querySelectorAll(selector));
                if (type.includes("attr"))
                    return links.map(link => link.getAttribute(type.split(":")[1]));
                switch (type) {
                    case "href":
                        return links.map(link => link.href);
                    case "image":
                        return links.map(link => link.src);
                    default:
                        return links.map(link => link.textContent);
                }
            },
            selector,
            type
        );
        if (index) return elements[index];
        return elements;
    } else {
        const element = await page.evaluate(
            (selector, type) => {
                let custom = false;

                const link = document.querySelector(selector);
                if (type.includes("attr")) return link.getAttribute(type.split(":")[1]);
                switch (type) {
                    case "href":
                        return link.href;
                    case "image":
                        return link.src;
                    default:
                        return link.textContent;
                }
            },
            selector,
            type
        );
        return element;
    }
}

module.exports = DynamicScrape;
