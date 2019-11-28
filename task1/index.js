const express = require('express');

const webserver = express(); // создаём веб-сервер

const port = 8180;

const username = 'root';
const password = 'admin';

function isValidUsername(login) {
    if (login === username)
        return true;
    else
        return false;
}
function isValidPassword(pswd) {
    if (pswd === password)
        return true;
    else
        return false;
}

function getForm(login, pswd) {
    usernameLabel = 'Имя пользователя';
    passwordLabel = 'Пароль';
    userColor = 'gray';
    pswdColor = 'gray';

    if (!isValidUsername(login) && (login)) {
        usernameLabel = 'Не верное имя...';
        userColor = 'red';
    } else if (isValidUsername(login)) {
        usernameLabel = 'Имя верное!';
        userColor = 'green';
    }
    if (!isValidPassword(pswd) && (pswd)) {
        passwordLabel = 'Не верный пароль...';
        pswdColor = 'red';
    } else if (isValidPassword(pswd)) {
        passwordLabel = 'Пароль верный!';
        pswdColor = 'green';
    }

    let form = '<div style="width: 500px; height: 300px; margin: 0 auto; background-color: skyblue; text-align: center;">' +
        '<h1>Валидация формы</h1>' +
        '<form action="/task1" method="get">' +
        '<p>' +
        `  <label for="usernameLabel" style="display: block; color: ${userColor}">${usernameLabel}</label>` +
        `  <input id="usernameLabel" type="text" placeholder="введите Логин" name="username" value="${login}">` +
        '</p>' +
        '<p>' +
        `  <label for="passwordLabel" style="display: block; color: ${pswdColor}">${passwordLabel}</label>` +
        `  <input id="passwordLabel" type="password" placeholder="введите Пароль" name="password" value="${pswd}">` +
        '</p>' +
        '  <p><input type="submit"></p>\n' +
        ' </form>'+
        '</div>';

    return form;
}

webserver.get('/task1', (req, res) => {
    res.writeHead( 200, { 'Content-Type' : 'text/html; charset=UTF-8' } );
    if (!req.query.username)
        req.query.username = '';
    if (!req.query.password)
        req.query.password = '';

    res.end(getForm(req.query.username, req.query.password));
});

// просим веб-сервер слушать входящие HTTP-запросы на этом порту
webserver.listen(port,()=>{
    console.log("web server running on port "+port);
}); 
