const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');


const webserver = express(); // создаём веб-сервер
webserver.use(express.json()); // мидлварь, умеющая обрабатывать тело запроса в формате JSON
webserver.use(express.urlencoded({extended:true}));

const port = 8181;  //task2
const variantsFN = path.join(__dirname, 'variants.txt');

//Формируем блок с заданием-------------------------------------
function getVariantsForm() {
    let variants = '  document.querySelector(\'.workSpace\').innerHTML = \'start\';' +
        'fetch(\'/task2/variants\')' +
        '.then(response => response.json())' +
        '.then(function(rez) { ' +
        '  let currentTask = \'<h2 style="color: green;">\'+rez.title+\'</h2>\';' +
        '  for (i=0; i<rez.variants.length; i++) {' +
        '    currentTask += \`<button style="display: block; margin: 8px auto; width: 120px; height: 40px;" onclick="sendVote(this, \'${rez.variants[i].name}\')">\`+rez.variants[i].name+\`</button>\`;' +
        '  } ' +
        '  document.querySelector(\'.workSpace\').innerHTML = currentTask;' +
        '}).catch(function(error) {' +
        '  document.querySelector(\'.workSpace\').innerHTML = \'<h2 style="color: red;">Ошибка получения задания...</h2>\';' +
        '})();';

    return variants;
}
//-------------------------------------------------------------------

function funcSendVote() {
    let funcVote = 'function sendVote(content, selected) {' +
        'const data = {variant: selected};' +
        'fetch(\'/task2/vote\', {method: \'POST\',  headers: {' +
        '                                \'Content-Type\': \'application/json\',' +
        '                        },body: JSON.stringify(data)})' +
        '.then(response => response.json())' +
        '.then(function(data) { ' +
        '  document.querySelector(\'.resultSpace\').innerHTML = data;' +
        '}).catch(function(error) {' +
        '  document.querySelector(\'.resultSpace\').innerHTML = \'<h2 style="color: red; margin-top: 0">Ошибка голосования...</h2>\';' +
        '})};';

    return funcVote;
}

//Формируем основную страничку---------------------------------------
function getForm() {

    let form = '<!DOCTYPE html>' +
        '<html lang="ru">' +
        '  <head>' +
        '    <meta charset="UTF-8">' +
        '    <title>Ershov Task2</title>' +
        '      <script type="text/javascript" defer>' +
        `       ${funcSendVote()}` +
        '      </script>' +
        '  </head>' +
        '  <body>' +
        '    <div class="workSpace" style="width: 500px; height: 300px; margin: 0 auto; background-color: skyblue; text-align: center;">' +
        '      <script type="text/javascript" defer>' +
        `        ${getVariantsForm()}` +
        '      </script>' +
        '    </div>' +
        '    <div class="resultSpace" style="width: 500px; height: 80px; margin: 0 auto; background-color: #98c37c; text-align: center;">' +
        '    </div>' +
        '  </body>' +
        '</html>';

    return form;
}
//-------------------------------------------------------------------

//Читаем файл--------------------------------------------------------


//-------------------------------------------------------------------

//Сохранить в файл голос---------------------------------------------
function saveVote() {

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
            } else {
                res.status(200).send(data);
            }
        }
    });
});
//-------------------------------------------------------------------

//принять голос------------------------------------------------------
webserver.post('/task2/vote', (req, res) => {
    console.log('выбран: ' + JSON.stringify(req.body));
    if (
        !("variant" in req.body)
    ) {
        res.status(401).send("sorry, variant is not correct!");
    } else {
        saveVote(req.body.variant);

        res.status(200).send({status: "ok"});
    }
});


// просим веб-сервер слушать входящие HTTP-запросы на этом порту
webserver.listen(port,()=>{
    console.log("web server running on port "+port);
});