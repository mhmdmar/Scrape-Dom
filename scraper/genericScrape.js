const request = require('request-promise');
const cheerio = require('cheerio');
async function Scrape(json) {
    let startTime = Date.now();
    if (!json['scrape']) {
        result = { error: 'no element to scrape is supplied' };
        console.log(result);
        return;
    }

    const options = {
        uri: json.url,
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    return request(options)
        .then(($) => {
            let result = {};
            let scrape = json.scrape;
            for (let item in scrape) {
                if (!scrape[item]['name'] || !scrape[item]['selector']) {
                    if (!scrape[item]['name']) {
                        result[item] = 'Name is not supplied for this element';
                        continue;
                    }
                    if (!scrape[item]['selector']) {
                        result[scrape[item].name] = 'Selector is not supplied for this element';
                        continue;
                    }
                }
                if (!scrape[item].list) {
                    switch (scrape[item].type) {
                        case 'text':
                            result[scrape[item].name] = $(scrape[item].selector).first().text();
                            break;
                        case 'href':
                            result[scrape[item].name] = $(scrape[item].selector).first().attr('href');
                            break;
                        case 'image':
                            result[scrape[item].name] = $(scrape[item].selector).first().attr('src');
                            break;
                        case "style":
                            result[scrape[item].name] = $(scrape[item].selector).first().attr("style");
                            break;
                        default:
                            if (scrape[item].type.includes('attr')) {
                                scrape[item].type = scrape[item].type.split(":")[1];
                                result[scrape[item].name] = $(scrape[item].selector).first().attr(scrape[item].type);
                                if (!result[scrape[item].name])
                                    result[scrape[item].name] = null;
                            }
                            else
                                result[scrape[item].name] = "ERROR! - wrong 'Type' attribute found or couldnt find the";
                            break;
                    }
                }
                else {
                    result[scrape[item].name] = [];
                    $(scrape[item]['selector']).each(function (i, elem) {
                        switch (scrape[item].type) {
                            case 'href':
                                result[scrape[item].name].push($(this).attr('href'));
                                break;
                            case 'text':
                                result[scrape[item].name].push($(this).text());
                                break;
                            case 'image':
                                result[scrape[item].name].push($(this).attr('src'));
                                break;
                            case "style":
                                result[scrape[item].name].push($(this).attr("style"));
                                break;
                            default:
                                if (scrape[item].type.includes('attr')) {
                                    scrape[item].type = scrape[item].type.split(":")[1];
                                    result[scrape[item].name].push($(this).attr(scrape[item].type));
                                    if (!result[scrape[item].name][i])
                                        result[scrape[item].name][i] = null;
                                }
                                else
                                    result[scrape[item].name].push("ERROR! - wrong 'Type' attribute found or couldnt find the");
                                break;
                        }
                    });
                    //        result[scrape[item].name] = element;

                }
            }
            endTime = Date.now();
            phrase = 'seconds';
            duration = (endTime - startTime) / 1000;
            if (duration > 60) {
                duration = Number((duration / 60).toFixed(2));
                phrase = 'minutes';
            }
            result.duration = duration + " " + phrase;
            return result;
            // End 
        })
        .catch((err) => {
        });

}



module.exports = Scrape;