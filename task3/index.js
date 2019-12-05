const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');

const webserver = express();   // создаём веб-сервер
webserver.use(express.json()); // мидлварь, умеющая обрабатывать тело запроса в формате JSON
webserver.use(express.urlencoded({extended:true}));

const port = 8181;  //task3
const variantsFN = path.join(__dirname, '../task2/variants.txt');
webserver.use('/task3', express.static(__dirname + '/www'));  //раздача статики

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
//------------------------------------------------------------------------

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


//Запрос на получение вариантов ответа (без кол-ва голосов)---------------
webserver.get('/task3/variants', (req, res) => {
    readTask().then(
        data  => res.status(200).send(data),
        error => res.status(error.status).send(error.message)
    );
});
//------------------------------------------------------------------------

//принять голос-----------------------------------------------------------
webserver.post('/task3/vote', (req, res) => {
    if ( !("id" in req.body) )
        res.status(404).send("sorry, variant is not exist!");

    saveVote(req.body.id).then(  //сохранить новый голос
        data => res.status(200).send({status: "ok"}),
        error => res.status(error.status).send(error.message)
    );
});
//------------------------------------------------------------------------

//Запрос на получение статистики------------------------------------------
webserver.post('/task3/stat', (req, res) => {
    getStat().then(
        data => res.status(200).send(data),
        error => res.status(error.status).send(error.message)
    );
});
//------------------------------------------------------------------------

//просим веб-сервер слушать входящие HTTP-запросы на этом порту--
webserver.listen(port,()=>{
    console.log("web server running on port: " + port);
});
//---------------------------------------------------------------