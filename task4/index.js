const express = require('express');
const exphbs  = require('express-handlebars');
const cookieParser = require('cookie-parser');
const path = require('path');
const helmet = require('helmet');

const webserver = express();   // создаём веб-сервер
webserver.use(express.json()); // мидлварь, умеющая обрабатывать тело запроса в формате JSON
webserver.use(express.urlencoded({extended:true}));
webserver.use(cookieParser());
webserver.use(helmet());       // добавить к ответам сайта заголовки, повышающие безопасность

webserver.engine('handlebars', exphbs());   // регистрируем движок шаблонов handlebars в списке движков шаблонов express
webserver.set('view engine', 'handlebars'); // устанавливаем, что будет использоваться именно движок шаблонов handlebars
webserver.set('views', path.join(__dirname, 'views')); // задаём папку, в которой будут шаблоны

const port = 8181;  //task4
webserver.use('/task4', express.static(__dirname + '/static'));  //раздача статики
//======================================================================================================================

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

//Запрос на получение формочки--------------------------------
webserver.get('/task4', function (req, res) {
    login = '';
    pswd = '';
    usernameLabel = ``;
    passwordLabel = ``;
    userColor = 'gray';
    pswdColor = 'gray';

    if (req.cookies.login && !isValidUsername(req.cookies.login)) {
        login = req.cookies.login;
        usernameLabel = 'Не верное имя...';
        userColor = 'red';
    } else if (req.cookies.login && isValidUsername(req.cookies.login)) {
        login = req.cookies.login;
        usernameLabel = 'Имя верное!';
        userColor = 'green';
    }

    if (req.cookies.pswd && !isValidPassword(req.cookies.pswd)) {
        pswd = req.cookies.pswd;
        passwordLabel = 'Не верный пароль...';
        pswdColor = 'red';
    } else if (req.cookies.pswd && isValidPassword(req.cookies.pswd)) {
        pswd = req.cookies.pswd;
        passwordLabel = 'Пароль верный!';
        pswdColor = 'green';
    }

    res.render('main_page',{   // отрендерить view/main_page
        layout: null,
        titleForm: 'Введите логин и пароль',
        usernameLabel: usernameLabel,
        userColor: userColor,
        login: login,
        pswdColor: pswdColor,
        passwordLabel: passwordLabel,
        pswd: pswd,
    });
});

//Запрос с данными: логин/пароль----------------
webserver.post('/task4', function (req, res) {
    res.cookie('login', req.body.username);
    res.cookie('pswd', req.body.password);

    res.redirect(302,'/task4');
});

//просим веб-сервер слушать входящие HTTP-запросы на этом порту--
webserver.listen(port, () => {
    console.log("Task4 running on port: " + port);
});
//---------------------------------------------------------------