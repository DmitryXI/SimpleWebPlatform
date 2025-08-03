// Глобальное хранилище переменных на уровне окна/вкладки
window.CPJ = {
        "debugLevel" :7,         // Уровень журналирования в консоль
        "basePath"   :null,      // Базовый URL
        "currentUser":"notUse",  // Информация о текущем пользователе (в том или мном формате)
        "connectors" :{},        // Массив активных XMLHttpRequest-коннекторов
        "usessid"    :-1,        // Идентификатор сессии пользователя
        "activeForms": {}        // Список активных форм на случай изменения размеров окна
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

    clientRegister()                                        // Выполняем регистрацию клиента
}

window.onresize = function(){
    refreshForms()
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