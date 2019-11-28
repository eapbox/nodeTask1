const express = require('express');

const webserver = express(); // создаём веб-сервер

const port = 8180;

function getForm() {
    let form = '<div style="width: 400px; height: 600px; margin: 0 auto; background-color: skyblue;">' +
        '<h1>Валидация формы</h1>' +
        '</div>';

    return form;
}

webserver.get('/', (req, res) => {


    res.send(getForm());
});

// просим веб-сервер слушать входящие HTTP-запросы на этом порту
webserver.listen(port,()=>{
    console.log("web server running on port "+port);
}); 
