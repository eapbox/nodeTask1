'use strict';

document.querySelector('.workSpace').innerHTML = 'Loading task...';

//Запрос на получение задания------------------------------------------------------
function getTask() {
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
        });
};

getTask();
//----------------------------------------------------------------------------------

//Отправить голос-------------------------------------------------------------------
async function sendVote(content, selected) {
    try {
        const response = await fetch('/task3/vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id: selected})
        });
        const result = await response.json();

        try {
            const data = await getStatFormat('application/json');

            let statistic = '';
            for (var i = 0; i < data.length; i++) {
                statistic += `<div class="statistic">${data[i].name}: ${data[i].vote}</div>`;
            }
            document.querySelector('.resultSpace').innerHTML = statistic;

            let showBtn = '';
            showBtn += `<button class="showBtn" onclick="showResult('text/html');">HTML</button>`;
            showBtn += `<button class="showBtn" onclick="showResult('application/json');">JSON</button>`;
            showBtn += `<button class="showBtn" onclick="showResult('application/xml');">XML</button>`;
            document.querySelector('.showSpace').innerHTML = showBtn;
        } catch (error) {
            document.querySelector('.resultSpace').innerHTML = '<h2 class="danger">Ошибка получения статистики...</h2>';
            document.querySelector('.showSpace').innerHTML = '';
        }
    } catch (error) {
        document.querySelector('.resultSpace').innerHTML = '<h2 class="danger">Ошибка голосования...</h2>';
        document.querySelector('.showSpace').innerHTML = '';
    }
}
//----------------------------------------------------------------------------------

//Получить статистику в нужном формате-------------
async function getStatFormat(accept = '') {
    try {
        const response = await fetch('/task3/stat', {
            method: 'GET',
            headers: {
                'Accept': accept,
            }
        });
        if (accept === 'application/json')
            return(await response.json());
        else
            return(await response.text());
    } catch (error) {
        throw new Error(error);
    }
}
//-------------------------------------------------

//Сформировать результат в нужном формате----------
async function showResult(format) {
    try {
        const data = await getStatFormat(format);

        if (format == 'application/json') {
            document.querySelector('.showFormat').innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        } else
        if (format == 'application/xml') {
            document.querySelector('.showFormat').innerHTML = `<plaintext>${data}`;
        } else
        if (format == 'text/html') {
            document.querySelector('.showFormat').innerHTML = `${data}`;
        }


    } catch (error) {
        document.querySelector('.showFormat').innerHTML = '<h2 class="danger">Ошибка отображения выбранного формата...</h2>';
    }
}
//-------------------------------------------------

