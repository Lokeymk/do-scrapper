var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');

/**
 * create folders/files if not exist
 */
if(!(fs.existsSync('./results'))){
    fs.mkdirSync('./results');
}if(!(fs.existsSync('./results/imgrabber'))){
    fs.mkdirSync('./results/imgrabber');
}
if(!(fs.existsSync('./results/imgrabber/downloaded'))){
    fs.mkdirSync('./results/imgrabber/downloaded');
}
if(!(fs.existsSync(`./results/imgrabber/links.txt`))){
    fs.writeFileSync(`./results/imgrabber/links.txt`, '');
}
if(!(fs.existsSync(`./results/imgrabber/image.txt`))){
    fs.writeFileSync(`./results/imgrabber/image.txt`, '');
}

/**
 * 
 * @param {String} url Searched Site.
 * @param {Boolean} downloadImg Downloads Image.
 * @param {Boolean} writeHTML Exports Images into HTML file.
 */
function imgrabber(url, downloadImg=false, writeHTML=false){

    var links = [];
    var visited = [];
    var image = [];

    function download(url, cb){
        var random = Math.floor(Math.random()*1000);
        var name = `${(random)}${(random + 20)}${(random + 5)}${(random + 15)}${(random + 66)}${(random + 1)}${(random + 33)}`
        request.head(url, (err, res, body) => {
            if(/png/ig.test(url)){
                request(url).pipe(fs.createWriteStream(`./results/imgrabber/downloaded/${name}.png`)).on('close', cb);
            }else if(/jpeg/ig.test(url)){
                request(url).pipe(fs.createWriteStream(`./results/imgrabber/downloaded/${name}.jpeg`)).on('close', cb);
            }else if(/jpg/ig.test(url)){
                request(url).pipe(fs.createWriteStream(`./results/imgrabber/downloaded/${name}.jpg`)).on('close', cb);
            }else if(/gif/ig.test(url)){
                request(url).pipe(fs.createWriteStream(`./results/imgrabber/downloaded/${name}.gif`)).on('close', cb);
            }
        });
        console.log(`${url} downloaded...`);
    }

    (function crawl(urlbase, branch=""){
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
                    $('img').each(function(){
                        var selector = $(this);
                        var found = selector.attr('src');
                        if(!(found === null || found === undefined || (/^\/.*$/ig.test(found)))){
                            if(!(image.includes(found))){
                                image.push(found);
                                if(downloadImg){
                                    if(/^(https|http):\/\/.*(jpeg|jpg|gif|png).*$/ig.test(found)){
                                        download(found, () => console.log('\n'));
                                    }
                                }
                                if(writeHTML){
                                    fs.appendFileSync(`./results/imgrabber/image.html`, `<img src="${found}"/>\n`);
                                }
                                fs.appendFileSync(`./results/imgrabber/image.txt`, `${found}\n`);
                            }
                        }
                    });
                    if((/^\/.*$/ig.test(link))){
                      if(!((/^https\:\/\/.*$/ig.test(link)) || (/^http\:\/\/.*$/ig.test(link)))){
                        if(!(links.includes(link))){
                            links.push(link);                    
                            fs.appendFileSync(`./results/imgrabber/links.txt`, `${link}\n`);
                            if(!(visited.includes(link))){
                                console.log(`found results: ${image.length}`);
                                crawl(url, links[(Math.floor(Math.random()*links.length))]);
                            }
                        }
                      }
                    }
                });
        });
    })(url)
}

module.exports = imgrabber;