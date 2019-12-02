const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');


const webserver = express(); // создаём веб-сервер
webserver.use(express.json()); // мидлварь, умеющая обрабатывать тело запроса в формате JSON
webserver.use(express.urlencoded({extended:true}));

const port = 8181;  //task2
const variantsFN = path.join(__dirname, 'variants.txt');

//Формируем основную страничку-----------------------------------------
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
        '    <div class="resultSpace" style="width: 500px; min-height: 80px; margin: 0 auto; background-color: #98c37c; text-align: center;">' +
        '    </div>' +
        '  </body>' +
        '</html>';

    return form;
}
//------------------------------------------------------------------------

//Запрос задания Фронтом--------------------------------------------------
function getVariantsForm() {
    let variants = '  document.querySelector(\'.workSpace\').innerHTML = \'start\';' +
        'fetch(\'/task2/variants\')' +
        '.then(response => response.json())' +
        '.then(function(rez) { ' +
        '  let currentTask = \'<h2 style="color: green;">\'+rez.title+\'</h2>\';' +
        '  for (i=0; i<rez.variants.length; i++) {' +
        '    currentTask += \`<button style="display: block; margin: 8px auto; width: 120px; height: 40px;" onclick="sendVote(this, ${rez.variants[i].id})">\`+rez.variants[i].name+\`</button>\`;' +
        '  } ' +
        '  document.querySelector(\'.workSpace\').innerHTML = currentTask;' +
        '}).catch(function(error) {' +
        '  document.querySelector(\'.workSpace\').innerHTML = \'<h2 style="color: red;">Ошибка получения задания...</h2>\';' +
        '})();';

    return variants;
}
//-------------------------------------------------------------------

//Отправить голос с фронта и если успешно, то запросить статистику---
function funcSendVote() {
    let funcVote = 'function sendVote(content, selected) {' +
        'const data = {id: selected};' +
        'fetch(\'/task2/vote\', {method: \'POST\',  headers: {' +
        '                                \'Content-Type\': \'application/json\',' +
        '                        },body: JSON.stringify(data)})' +
        '.then(response => response.json())' +
        '.then(function(data) { ' +
        '  fetch(\'/task2/stat\', {method: \'POST\'})' +
        '  .then(response => response.json())' +
        '  .then(function(data) {' +
        '    let statistic = \'\';' +
        '    for (i=0; i<data.length; i++) {' +
        '      statistic += \`<div style="margin-bottom: 8px; width: 120px; height: 40px;">${data[i].name}: ${data[i].vote}</div>\`;' +
        '    } ' +
        '    document.querySelector(\'.resultSpace\').innerHTML = statistic;' +
        '  })' +
        '  .catch(function(error) {' +
        '    document.querySelector(\'.resultSpace\').innerHTML = \'<h2 style="color: red; margin-top: 0">Ошибка получения статистики...</h2>\';' +
        '  })' +
        '}).catch(function(error) {' +
        '  document.querySelector(\'.resultSpace\').innerHTML = \'<h2 style="color: red; margin-top: 0">Ошибка голосования...</h2>\';' +
        '})};';

    return funcVote;
}
//------------------------------------------------------------------------

//Сосчитать задание с хранилища-------------------------------------------
//isGetVote - получать ли голоса,
function readTask(isGetVote) {
    return new Promise((resolve, reject) => {
        fs.readFile(variantsFN, "utf8", (error, data) => {
            if (error) {
                reject({status: 404, message: "sorry, file is empty!"});
            } else {
                if (
                    !("title" in JSON.parse(data)) ||
                    !("variants" in JSON.parse(data))
                ) {
                    reject({status: 403, message: "sorry, file is not correct!"});
                } else {
                    let dt = JSON.parse(data);
                    if (!isGetVote) {  //голоса не передаем
                        dt.variants =dt.variants.map(item => {
                            return {
                                id: item.id,
                                name: item.name
                            }
                        });
                    }
                    resolve(JSON.stringify(dt));
                }
            }
        });
    })
}
//-------------------------------------------------------------------

//Сохранить голос в файл---------------------------------------------
function saveVote(id) {
    return new Promise((resolve, reject) => {
        readTask(true).then(  //читаем с полем голосов
            data => {
                let dt = JSON.parse(data);
                if (dt.variants.some(item => {
                    if (item.id == id) {
                        item.vote += 1;
                        return true;   //чтобы дальше не шел перебор
                    }
                })) {
                    data = JSON.stringify(dt);
                    fs.writeFile(variantsFN, data, function(error) {
                        if(error) reject({status: 403, message: "sorry, vote is not exist!"}); // если возникла ошибка
                        resolve({status: "ok"});
                    });
                } else  {  //id не найден
                    reject({status: 403, message: "sorry, vote is not exist!"});
                }
            },
            error => reject(error)
        );
    });
}
//------------------------------------------------------------------------

//Получить статистику по голосам------------------------------------------
function getStat() {
    return new Promise((resolve, reject) => {
        readTask(true).then(  //читаем с полем голосов
            data => {
                resolve(JSON.parse(data).variants.map(item => {
                    return {
                        name: item.name,
                        vote: item.vote
                    }
                }));
            },
            error => reject(error)
        );
    });
}
//------------------------------------------------------------------------

//запрос на получение базовой формочки -----------------------------------
webserver.get('/task2', (req, res) => {
    res.writeHead( 200, { 'Content-Type' : 'text/html; charset=UTF-8' } );
    res.end(getForm());
});

//Запрос на получение вариантов ответа (без кол-ва голосов)---------------
webserver.get('/task2/variants', (req, res) => {
    readTask().then(
        data  => res.status(200).send(data),
        error => res.status(error.status).send(error.message)
    );
});
//------------------------------------------------------------------------

//принять голос-----------------------------------------------------------
webserver.post('/task2/vote', (req, res) => {
    if ( !("id" in req.body) )
        res.status(404).send("sorry, variant is not exist!");

    saveVote(req.body.id).then(  //сохранить новый голос
        data => res.status(200).send({status: "ok"}),
        error => res.status(error.status).send(error.message)
    );
});
//------------------------------------------------------------------------

//Запрос на получение статистики------------------------------------------
webserver.post('/task2/stat', (req, res) => {
    getStat().then(
        data => res.status(200).send(data),
        error => res.status(error.status).send(error.message)
    );
});
//------------------------------------------------------------------------

// просим веб-сервер слушать входящие HTTP-запросы на этом порту
webserver.listen(port,()=>{
    console.log("web server running on port "+port);
});