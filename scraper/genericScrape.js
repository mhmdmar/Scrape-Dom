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
function forEachElement($, selector, callback) {
    $(selector).each((i, element) => {
        callback(i, element);
    });
}
function forEachChild(element, callback) {
    if (!element.children || element.children.length === 0) {
        return;
    }
    for (let i = 0; i < element.children.length; i++) {
        callback(element.children[i]);
    }
}
function scrapePage(scrape, $) {
    const result = {};
    function _scrapePage(tree, element, selector = "") {
        if (!element.name) {
            return;
        }
        selector += " " + element.selector;
        if (element.children) {
            if (element.list) {
                tree[element.name] = [];
                forEachElement($, selector, i => {
                    const item = {};
                    forEachChild(element, child => {
                        _scrapePage(
                            item,
                            child,
                            selector + `:nth-of-type(${i + 1})` /* nth starts from 1*/
                        );
                        tree[element.name].push(item);
                    });
                });
            } else {
                tree[element.name] = {};
                forEachChild(element, child => {
                    _scrapePage(tree[element.name], child, selector);
                });
            }
        } else {
            if (element.list) {
                tree[element.name] = [];
                forEachElement($, selector, (i, el) => {
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
async function dynamicScrape(json) {
    let result = {};
    let startTime = Date.now();
    if (!json["scrape"]) {
        result.error = "no element to scrape is supplied";
        return;
    }

    const options = {
        uri: json.url,
        transform: function(body) {
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

module.exports = dynamicScrape;
