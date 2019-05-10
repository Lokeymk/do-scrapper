var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');

/**
 * create folders/files if not exist
 */
if(!(fs.existsSync('./results'))){
    fs.mkdirSync('./results');
}if(!(fs.existsSync('./results/textgrabber'))){
    fs.mkdirSync('./results/textgrabber');
}
if(!(fs.existsSync(`./results/textgrabber/links.txt`))){
    fs.writeFileSync(`./results/textgrabber/links.txt`, '');
}
if((!fs.existsSync(`./results/textgrabber/text.txt`))){
    fs.writeFileSync(`./results/textgrabber/text.txt`, '');
}

/**
 * 
 * @param {String} searched  Searched Word.
 * @param {String} url Searched Site.
 */
function textgrabber(searched, url){

    var links = [];
    var visited = [];
    var text = [];

    (function crawl(searched, urlbase, branch=""){
        if(!searched) return process.exit(0);
        request(urlbase+branch, function(err, res, body){
            /**
             * remove from links visited before.
             */
            links = links.filter(i => i !== branch);            
            /**
             * add to visited branch
             */
            visited.push(branch);
            if(err) return err;
            var $ = cheerio.load(body);    
                /**
                 * Link Grabber
                 */
                $('a').each(function(){
                    var selector = $(this);
                    var link = selector.attr('href');
                    /**
                     * Text Grabber
                     */
                    $('p').each(function(){
                        var selector = $(this);
                        var found = selector.text();
                        if(!(found === null || found === undefined || (/^\/.*$/ig.test(found)))){
                            if(!(text.includes(found))){
                                // console.log(found);
                                var pattern = new RegExp(searched, 'ig');
                                if(pattern.test(found)){
                                    text.push(found);
                                    fs.appendFileSync(`./results/textgrabber/text.txt`, `${found}\n`);
                                }
                            }
                        }
                    });
                    if((/^\/.*$/ig.test(link))){
                      if(!((/^https\:\/\/.*$/ig.test(link)) || (/^http\:\/\/.*$/ig.test(link)))){
                        if(!(links.includes(link))){
                            links.push(link);                    
                            fs.appendFileSync(`./results/textgrabber/links.txt`, `${link}\n`);
                            if(!(visited.includes(link))){
                                console.log(`found results: ${text.length}`);
                                crawl(searched, url, links[(Math.floor(Math.random()*links.length))]);
                            }
                        }
                      }
                    }
                });
        });
    })(searched, url)
}

module.exports = textgrabber;