'use strict';

document.querySelector('.workSpace').innerHTML = 'Loading task...';

//Запрос на получение задания------------------------------------------------------
fetch('/task3/variants')
    .then(response => response.json())
    .then(function(rez) {
        let currentTask = `<h2 class="title">${rez.title}</h2>`;
        for (var i = 0; i < rez.variants.length; i++) {
            currentTask += `<button class="voteBtn" onclick="sendVote(this, ${rez.variants[i].id})">${rez.variants[i].name}</button>`;
        }
        document.querySelector('.workSpace').innerHTML = currentTask;
    })
    .catch(function(error) {
        document.querySelector('.workSpace').innerHTML = '<h2 class="danger">Ошибка получения задания...</h2>';
    })();
//----------------------------------------------------------------------------------

//Отправить голос-------------------------------------------------------------------
function sendVote(content, selected) {
    fetch('/task3/vote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: selected})
    })
        .then(response => response.json())
        .then(function(data) {
            //Если голос успешно принят, то запрашиваем статистику
            fetch('/task3/stat', {
                method: 'POST'
            })
                .then(response => response.json())
                .then(function(data) {
                    let statistic = '';
                    for (var i = 0; i < data.length; i++) {
                        statistic += `<div class="statistic">${data[i].name}: ${data[i].vote}</div>`;
                    }
                    document.querySelector('.resultSpace').innerHTML = statistic;
                })
                .catch(function(error) {
                    document.querySelector('.resultSpace').innerHTML = '<h2 class="danger">Ошибка получения статистики...</h2>';
                })
        })
        .catch(function(error) {
            document.querySelector('.resultSpace').innerHTML = '<h2 class="danger">Ошибка голосования...</h2>';
        })
}
//----------------------------------------------------------------------------------

