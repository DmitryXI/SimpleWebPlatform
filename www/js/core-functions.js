// Функции (пока бессистемно здесь...)

// Регистрация клиента на сервере
function clientRegister(){
    // Отправляем синхронный запрос и ждём ответ. Без регистрации клиенту больше делать нечего.
    regAnswer = getFromUrl("POST", window.CPJ.basePath, false, null, webRequestError, null, {"action":"registration"}, {"cache-control":"no-cache, no-store, must-revalidate","pragma":"no-cache","expires":"0"}, null, true)
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

                // Динамически подгружаем скрипты
                if(!loadScript("core_entrance", window.CPJ.basePath+"js/entrance.js")){
                    console.log("Error loading script \"core_entrance\"")
                    return
                }
                if(!loadScript("core_selectGame", window.CPJ.basePath+"js/selectGame.js")){
                    console.log("Error loading script \"core_selectGame\"")
                    return
                }
                if(!loadScript("core_selectGameSession", window.CPJ.basePath+"js/selectGameSession.js")){
                    console.log("Error loading script \"core_selectGameSession\"")
                    return
                }

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
                testBtn.addEventListener('click', () => getFromUrl("GET", window.CPJ.basePath+'{"action":"registration"}', true, testAsyncReceive, webRequestError, null, null, {"cache-control":"no-cache, no-store, must-revalidate","pragma":"no-cache","expires":"0"}, "Test async...", true));

                let testBtn2     = document.createElement("input")
                testBtn2.id      = "testBtn2"
                testBtn2.type    = "button"
                testBtn2.value   = " Get login form "
                testBtn2.addEventListener('click', () => getFromUrl("POST", window.CPJ.basePath, false, showEntranceForm, null, null, {"action":"getEntranceForm","usessid":window.CPJ.usessid}, {"cache-control":"no-cache, no-store, must-revalidate","pragma":"no-cache","expires":"0"}, "body", true));

                let testBtn3     = document.createElement("input")
                testBtn3.id      = "testBtn3"
                testBtn3.type    = "button"
                testBtn3.value   = " Show port size "
                testBtn3.addEventListener('click', () => { console.log("Viewport: "+viewport().width+"x"+viewport().height); })

                body.appendChild(newGameBtn)
                body.appendChild(selectGameBtn)
                body.appendChild(testBtn)
                body.appendChild(testBtn2)
                body.appendChild(testBtn3)
            }
        }else{
            alert("Какая-то ошибка при регистрации пользователя")
        }
    }
}

// Функция обработки стандартных ошибок коммуникации с веб-сервером

function testAsyncReceive(client, isError, transitStr){
    if(isError){
        alert("Error receive answer for: "+transitStr+"\n\n"+client.responseText)
    }else{
        alert("Received answer for: "+transitStr+"\n\n"+client.responseText.replaceAll("\r","").replaceAll("\n","").replaceAll("\t",""))
    }
}

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

function getElFromHTML(elId, srcHTML){
    let tDiv = document.createElement("div")
    tDiv.style.visibility = "none"
    document.body.appendChild(tDiv)
    tDiv.innerHTML += srcHTML
    let el = $("#"+elId)
    tDiv.remove()

    return el
}

function cutElFromElement(elId, parentEl){

    let el = parentEl.querySelector(elId)

    if(el !== null){
        let clone = el.cloneNode(true)
        el.remove()

        return clone
    }else{
        return false
    }
}

function $(str){
    if (str.charAt(0) === "#") {
                return document.getElementById(str.slice(1))
    }
    return false
}

function viewport() {
    var e = window, a = 'inner';
    if (!('innerWidth' in window )) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return { width : e[ a+'Width' ] , height : e[ a+'Height' ] };
}

function loadScript(scriptId, fullName){

    let el = $("#"+scriptId)

    if(el === null){
        el     = document.createElement("script");
        el.type    = "text/javascript";
        el.charset = "UTF-8"
        el.id      = scriptId
    }
    //                el.src     = window.CPJ.basePath+"js/entrance.js"
    let connector = (getFromUrl("GET", fullName, false, null, webRequestError, null, null, {"cache-control":"no-cache, no-store, must-revalidate","pragma":"no-cache","expires":"0"}, null, true))
    if (connector instanceof XMLHttpRequest) {
        el.text = connector.responseText
        document.getElementsByTagName('head')[0].appendChild(el);
        return true
    }else{
        return false
    }
}

// Изменение размеров активных форм
function refreshForms(){

    for(let formId in window.CPJ.activeForms){
//        console.log("Call function "+window.CPJ.activeForms[formId].function+" with params "+window.CPJ.activeForms[formId].params+", "+formId)
        window[window.CPJ.activeForms[formId].function](...window.CPJ.activeForms[formId].params, formId)
    }

}