const request = require('request');
const cheerio = require('cheerio')
const scrape = require('website-scraper');
const prompts = require('prompts');
const chalk = require('chalk');
//TODO
// 1. Add image processing of some description. 
// 2. Add more options, such as filtering images by size, or type, or recursive depth
// 3. Make the UI an actual UI
// 4. 

async function f() {


    const URL_REGEX = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
    let questions = [
        {
            type: 'text',
            name: 'URL',
            message: 'Enter a URL For Scrappin',
              validate: URL => URL_REGEX.test(URL) === false ? 'please enter valid url' : true
        },
        // {
        // //     type: 'text',
        // //     name: 'directory',
        // //     message: 'Enter a destination For the scrap'
        // // },
    ];

    class Monitor {
        apply(registerAction) {
            registerAction('onResourceSaved', ({resource}) => {console.log((chalk.green('Saved ')+ chalk.cyan(`${resource.filename}`)))});
        }
    }

    // Need to use regex to find file name, then iterate
    var j = 1;
    class Sorter {
    	apply(registerAction){
    		registerAction('generateFilename', ({resource}) => {
    			j++;
				return {filename: `${j}`};
			});
    	}
    }

    // class GreatFilter {
    //     apply(registerAction) {
    //         registerAction('afterResponse', ({resource}) => {
    //             if (resource.endsWith('.html')) {
    //                 return null;
    //             }
    //         });
    //     }
    // }
    
    let response = await prompts(questions);
    let directory = response.URL.replace(/[^\w\s]/gi, '');
    directory = directory.replace(/(httpswww)/g,'')
    directory = directory.replace(/(com)/g,'')


    console.log(response.URL);
    const options = {
      plugins: [ new Monitor(), new Sorter()],
      urls: [`${response.URL}`],
      urlFilter: (url) => url.startsWith(`${response.URL}`), // Filter links to other websites
      recursive: true,
      maxRecursiveDepth: 1,
      directory: `results/${directory}`,

      sources: [
        {selector: 'img', attr: 'src'}
       ],
    
      subdirectories: [
          {directory: 'jpegs', extensions: ['.jpg', '.jpeg']},
          {directory: 'svg', extensions: ['.svg']},
          {directory: 'png', extensions: ['.png']},
        {directory: 'html', extensions: ['.html']},
        {directory: 'js', extensions: ['.js']},
        {directory: 'css', extensions: ['.css']}
      ],

        
    };

    console.log(`beginning scrape of ${options.urls}`);

    scrape(options).then((result) => {console.log(chalk.green('Done!'));});

    
}

f()