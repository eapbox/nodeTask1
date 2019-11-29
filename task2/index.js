const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');


const webserver = express(); // создаём веб-сервер

webserver.use(express.urlencoded({extended:true}));

const port = 8181;  //task2
const variantsFN = path.join(__dirname, 'variants.txt');


function getVariantsForm() {


    let variants = '  document.querySelector(\'.workSpace\').innerHTML = \'start\';' +
        'fetch(\'/task2/variants\')' +
        '.then(response => response.json())' +
        '.then(function(data) { ' +
        '  let currentTask = \'<h2 style="color: green;">\'+data.title+\'</h2>\';' +
        '  for (i=0; i<data.variants.length; i++) {' +
        '    currentTask += \'<button style="display: block; margin: 8px auto; width: 120px; height: 40px;">\'+data.variants[i]+\'</button>\';' +
        '  } ' +
        '  document.querySelector(\'.workSpace\').innerHTML = currentTask;' +
        '}).catch(function(error) {' +
        '  document.querySelector(\'.workSpace\').innerHTML = \'<h2 style="color: red;">Ошибка получения задания...</h2>\';' +
        '})();';

        /*'document.write (\'<table width="100%" border="1">\');\n' +
        '    for (i=1; i<6; i++) {\n' +
        '      document.writeln("<tr>");\n' +
        '      for (j=1; j<6; j++) document.write("<td>" + i + j + "<\\/td>");\n' +
        '      document.writeln("<\\/tr>");\n' +
        '    }\n' +
        '    document.write ("<\\/table> ");';*/


    return variants;
}


//Формируем основную страничку---------------------------------------
function getForm() {

    let form = '<!DOCTYPE html>' +
        '<html lang="ru">' +
        '  <head>' +
        '    <meta charset="UTF-8">' +
        '    <title>Ershov Task2</title>' +
        '  </head>' +
        '  <body>' +
        '    <div class="workSpace" style="width: 500px; height: 300px; margin: 0 auto; background-color: skyblue; text-align: center;">' +
        '      <script type="text/javascript" defer>' +
        `        ${getVariantsForm()}` +
        '      </script>' +
        '    </div>' +
        '  </body>' +
        '</html>';

    return form;
}
//-------------------------------------------------------------------

//запрос на получение базовой формочки ------------------------------
webserver.get('/task2', (req, res) => {
    res.writeHead( 200, { 'Content-Type' : 'text/html; charset=UTF-8' } );
    res.end(getForm());
});

//Запрос на получение вариантов ответа-------------------------------
webserver.get('/task2/variants', (req, res) => {
    fs.readFile(variantsFN, "utf8", (error, data) => {
        if (error) {
            res.status(401).send("sorry, file is empty!");
        } else {
            if (
                !("title" in JSON.parse(data)) ||
                !("variants" in JSON.parse(data))
            ) {
                res.status(401).send("sorry, file is not correct!");
            } else
                res.status(200).send(data);
        }
    });
});
//-------------------------------------------------------------------


// просим веб-сервер слушать входящие HTTP-запросы на этом порту
webserver.listen(port,()=>{
    console.log("web server running on port "+port);
});