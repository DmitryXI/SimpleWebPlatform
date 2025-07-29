// Глобальное хранилище переменных на уровне окна/вкладки
window.CPJ = {
        "debugLevel" :7,         // Уровень журналирования в консоль
        "basePath"   :null,      // Базовый URL
        "currentUser":"notUse",  // Информация о текущем пользователе (в том или мном формате)
        "connectors" :{},        // Массив активных XMLHttpRequest-коннекторов
        "usessid"    :-1         // Идентификатор сессии пользователя
}

let tail = document.location.pathname.split("/")
let basePath = document.location.protocol+"//"+document.location.host
for (let i = 1; i < tail.length-1; i++) {
    console.log(tail[i]);
    basePath += "/"+tail[i];
}
basePath += "/"
window.CPJ.basePath = basePath          // Базовый url-путь
window.CPJ.usesid = -1                  // Номер сессии пользователя (меньше нуля - нет активной сессии)

window.onload = function() {
    let head = document.getElementsByTagName('head')[0]     // Получаем head документа
    let body = document.getElementById('body')              // Получаем body документа
    let favicon  = document.createElement("link");          // Создаём элемент link для favicon.ico
    favicon.rel  = "icon"
    favicon.type = "image/x-icon"
    favicon.href = window.CPJ.basePath + "favicon.png"
    head.appendChild(favicon)                               // Добавляем новый link-элемент к head

    // Для тестирования добавляем кнопку запроса регистрации/перерегистрации
    let tmpBtn = document.createElement("input")
    tmpBtn.id = "tmpBtn"
    tmpBtn.type = "button"
    tmpBtn.value = " ReReg "
    tmpBtn.onclick = clientRegister
    body.appendChild(tmpBtn)
}


















// Функции (пока бессистемно здесь...)

// Регистрация клиента на сервере
function clientRegister(){
    // Отправляем синхронный запрос и ждём ответ. Без регистрации клиенту больше делать нечего.
    regAnswer = getFromUrl("GET", window.CPJ.basePath+'{"action":"registration"}', false, null, webRequestError, null, null, {"cache-control":"no-cache, no-store, must-revalidate","pragma":"no-cache","expires":"0"}, null, true)
    if(regAnswer !== false){
        regAnswer = JSON.parse(regAnswer.responseText.replaceAll("\r","").replaceAll("\n","").replaceAll("\t",""))
        if(regAnswer.error !== true){
            window.CPJ.usessid = regAnswer.usessid;
            if(window.CPJ.debugLevel > 2){
                console.log("Присвоен номер сессии: "+window.CPJ.usessid)
                if($("#tmpBtn")){
                    $("#tmpBtn").remove()
                }
                $("#body").innerHTML = ""

                let newGameBtn     = document.createElement("input")
                newGameBtn.id      = "newGameBtn"
                newGameBtn.type    = "button"
                newGameBtn.value   = " Start a new game! "
                newGameBtn.onclick = clientRegister

                let selectGameBtn  = document.createElement("input")
                selectGameBtn.id      = "selectGameBtn"
                selectGameBtn.type    = "button"
                selectGameBtn.value   = " Select exists game! "
                selectGameBtn.onclick = clientRegister

                let testBtn     = document.createElement("input")
                testBtn.id      = "testBtn"
                testBtn.type    = "button"
                testBtn.value   = " Test async request! "
                testBtn.addEventListener('click', () => getFromUrl("GET", window.CPJ.basePath+'{"action":"registration"}', true, null, webRequestError, null, null, {"cache-control":"no-cache, no-store, must-revalidate","pragma":"no-cache","expires":"0"}, null, true));

                body.appendChild(newGameBtn)
                body.appendChild(selectGameBtn)
                body.appendChild(testBtn)
            }
        }else{
            alert("Какая-то ошибка при регистрации пользователя")
        }
    }
}

// Функция обработки стандартных ошибок коммуникации с веб-сервером
// client - XMLHttpRequest-коннектор, isError - есть ли ошибки в процессе, transitStr - объект переданный для транзита при запросе
function webRequestError(client, isError, transitStr){
    if(window.CPJ.debugLevel > 1){
        console.log("Ошибка выполнения запроса к серверу: "+client.status)
    }
}

// Добавление XMLHttpRequest-коннектора
function addConnetor(connector){
        if (connector instanceof XMLHttpRequest) {
                window.CPJ.connectors[Object.keys(window.CPJ.connectors).length] = {"con":connector,"idx":Object.keys(window.CPJ.connectors).length,"expected":0,"received":0}
                return Object.keys(window.CPJ.connectors).length-1
        }
        return false
}

// Получение XMLHttpRequest-коннектора
function getConnetor(idx){
        if (window.CPJ.connectors[idx] !== undefined) {
                if (window.CPJ.connectors[idx].con instanceof XMLHttpRequest) {
                        return window.CPJ.connectors[idx]
                }
        }
        return null
}

// Сброс XMLHttpRequest-коннектора
function abortConnetor(idx){
        if (window.CPJ.connectors[idx] !== undefined) {
                if (window.CPJ.connectors[idx].con instanceof XMLHttpRequest) {
                        return window.CPJ.connectors[idx].con.abort()
                }
        }
        return null
}

// Удаление XMLHttpRequest-коннектора
function delConnetor(idx){
        if (window.CPJ.connectors[idx] !== undefined) {
                if (window.CPJ.connectors[idx].con instanceof XMLHttpRequest) {
                        delete window.CPJ.connectors[idx]
                        return true
                }
        }
        return false
}

// POST/GET Запрос к веб-серверу
// proto - GET|POST, url - URL, nowaite - true|false (синхронный|асинхронный), on-ready -error, -abort - ссылки на функции обратного вызова
// postParams - объект, который будет сериализован в JSONString и отправлен как данные POST-запроса
// requestHeader - объект с заголовками HTTP-запроса
// transitStr - объект, который будет передаваться в callBack-функции
// addTimestamp - true|false - добавлять текущий timestamp для гарантированного избежания кэширования, даже если заголовки не помогают
function getFromUrl(proto, url, nowait, onready, onerror, onabort, postParams, requestHeader, transitStr, addTimestamp){
        proto = proto.toUpperCase()
        if (proto !== "GET") {proto = "POST"}
        if (nowait !== false) {nowait = true}
        let client = new XMLHttpRequest()
        let clientIdx = addConnetor(client)
        let isError = false

        if (addTimestamp) {
                url += '?timestamp=' + new Date().getTime()
        }
        client.onreadystatechange = function() {
                if( this.readyState === 2 ) {
                    if(window.CPJ.debugLevel > 6){
                        console.log(this.status)
                    }
                }
                if( this.readyState === 3 ) {
                    if(window.CPJ.debugLevel > 6){
                        console.log(this.readyState)
                    }
                }
                if( this.readyState === 4 ) {
                        if (this.status !== 200) {
                                isError = true
                        }
                        if (typeof onready === "function"){
                                onready(this, isError, transitStr)
                        }
                        if (nowait === true) {
                                delConnetor(clientIdx)
                        }
                }
        }

        client.onabort = function(){
                if (typeof onabort === "function"){
                        this.onabort = onabort(this, isError, transitStr)
                }
        }

        client.onerror = function(){
                isError = true
                if (typeof onerror === "function"){
                        this.onerror = onerror(this, isError, transitStr)
                }
                delConnetor(clientIdx)
        }

        client.open(proto, url, nowait)

        if ((requestHeader !== undefined) && (requestHeader !== null)){
                for (let headerName of Object.keys(requestHeader)) {
                        client.setRequestHeader(headerName, requestHeader[headerName])
                }
        }

        if (proto === "GET") {
                client.send()
        }else{
                client.send(JSON.stringify(postParams))
        }

        if (nowait === false) {
                delConnetor(clientIdx)
                if (isError) {return false}
                return client
        }
}

function $(str){
    if (str.charAt(0) === "#") {
                return document.getElementById(str.slice(1))
    }
    return false
}

//regClient(window.CPJ.basePath+'{"action":"registration"}')
//
//function regClient(url){
//    console.log("Requested "+url)
//    let client = new XMLHttpRequest();
//    client.open('GET', url, false);
//    client.onreadystatechange = function() {
//        if( this.readyState !== 4 ) {return}
//        let jResp = JSON.parse(client.responseText.replaceAll("\r","").replaceAll("\n","").replaceAll("\t",""))
//        console.log(jResp);
//        if((jResp.error !== true) || (jResp.action !== "registration")){
//            window.CPJ.usesid = jResp.usessid;
//            console.log("Success registered user session as "+window.CPJ.usesid)
//        }else{
//            console.log("Registration error")
//        }
//    }
//    client.onerror = function() {
//      alert("Failure client registration: "+client.responseText);
//    }
//
//    client.setRequestHeader("Cache-Control", "no-cache, no-store, must-revalidate")
//    client.setRequestHeader("Pragma", "no-cache")
//    client.setRequestHeader("Expires", "0")
//    client.send();
//}