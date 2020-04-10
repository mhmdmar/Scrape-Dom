const request = require("request-promise");
const cheerio = require("cheerio");

function scrapeElement(element, type) {
    let data;
    switch (type) {
        case "text":
            data = element.text();
            break;
        case undefined:
            data = null;
            break;
        default:
            if (type.includes("attr")) {
                type = type.split(":")[1];
                data = element.attr(type);
            } else {
                data = element.attr(type);
            }
            break;
    }
    return data || null;
}
function scrapePage(scrape, $) {
    const result = {};
    function _scrapePage(tree, element, selector = "") {
        selector += " " + element.selector;
        if (!element.name) {
            return;
        }
        if (element.children) {
            if (element.list) {
                tree[element.name] = [];
                $(selector).each(nth => {
                    const item = {};
                    for (let i = 0; i < element.children.length; i++) {
                        _scrapePage(
                            item,
                            element.children[i],
                            selector + `:nth-of-type(${nth + 1})`
                        );
                    }
                    tree[element.name].push(item);
                });
            } else {
                tree[element.name] = {};
                for (let i = 0; i < element.children.length; i++) {
                    _scrapePage(tree[element.name], element.children[i], selector);
                }
            }
        } else {
            if (element.list) {
                tree[element.name] = [];
                $(selector).each((i, el) => {
                    tree[element.name].push(scrapeElement(el, element.type));
                });
            } else {
                tree[element.name] = scrapeElement($(selector).first(), element.type);
            }
            return tree[element.name];
        }
    }
    for (let i = 0; i < scrape.length; i++) {
        _scrapePage(result, scrape[i]);
    }
    return result;
}
async function Scrape(json) {
    let result = {};
    let startTime = Date.now();
    if (!json["scrape"]) {
        result.error = "no element to scrape is supplied";
        return;
    }

    const options = {
        "uri": json.url,
        "transform": function(body) {
            return cheerio.load(body);
        }
    };

    const $ = await request(options);
    result = scrapePage(json["scrape"], $);
    let endTime = Date.now();
    let phrase = "seconds";
    let duration = (endTime - startTime) / 1000;
    if (duration > 60) {
        duration = Number((duration / 60).toFixed(2));
        phrase = "minutes";
    }
    duration = duration + " " + phrase;
    result.duration = duration;
    return result;
}

module.exports = Scrape;
