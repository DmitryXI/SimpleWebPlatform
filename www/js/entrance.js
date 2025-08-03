// Отображение формы входа
// Если создание формы: client - XMLHttpRequest, isError - флаг наличие ошибки при выполнении запроса, transitStr - строка - id элемента в документе, куда форму вставить
// Если обновление формы: client - строка "refresh", isError - строка - id существующего объекта в документе
function showEntranceForm(client, isError, transitStr){

    let formId = "unknown"
    let answer = null

    if(client !== "refresh"){
    console.log(client.responseText)
        answer = JSON.parse(client.responseText.replaceAll("\r","").replaceAll("\n","").replaceAll("\t",""))
        console.log("Получены данные формы входа: ");
        console.log(answer)
        console.log("ID объекта для вставки формы: "+transitStr)
        formId = answer.formId
    }else{
        formId = isError
    }

    console.log("ID формы входа: "+formId)

    // Пытаемся получить ссылку на созданную форму в body (на случай вызова функции на resize окна)
    let form = $("#"+formId)

    // Если готовой формы нет, создаём новую
    if(form === null){
        let srcFormHtml = getFromUrl("GET", window.CPJ.basePath+"forms/entranceForm.html", false, null, null, null, null, {"cache-control":"no-cache, no-store, must-revalidate","pragma":"no-cache","expires":"0"}, null, true)
        if(srcFormHtml !== false){
//            console.log(srcFormHtml.responseText)
        let formHtml = srcFormHtml.responseText.replaceAll("${id}", formId).replaceAll("${z}", 1)
        form = getElFromHTML(formId, formHtml)
//            console.log(formHtml)
        }

        let screen = viewport();
        w = Math.trunc(screen.width/3)
        h = Math.trunc(screen.height/3)
        form.style.left = w+"px"
        form.style.top = h+"px"
        form.style.width = form.style.left
        form.style.height = form.style.top

        let loginInp = form.querySelector("#"+formId+"_login")
        loginInp.style.left = Math.trunc(w/4)+"px"
        loginInp.style.width = Math.trunc(w/2)+"px"
        loginInp.style.top = Math.trunc(h/4)+"px"
        loginInp.style.height = Math.trunc(h/2)+"px"
        loginInp.style.fontSize = Math.trunc(h/5)+"px"

        let loginBtn = form.querySelector("#"+formId+"_entrance")
        loginBtn.style.left = Math.trunc(w/4)+"px"
        loginBtn.style.width = Math.trunc(w/2)+"px"
        loginBtn.style.top = Math.trunc(h/4)*3+"px"
        loginBtn.style.height = Math.trunc(h/4)+"px"
        loginBtn.style.fontSize = Math.trunc(h/6)+"px"

        if(client !== "refresh"){
            loginBtn.addEventListener('click', () => {getFromUrl("POST", window.CPJ.basePath, false, showSelectGameForm, null, null, {"action":answer.for,"usessid":window.CPJ.usessid,"login":$("#etrFrm_login").value}, {"cache-control":"no-cache, no-store, must-revalidate","pragma":"no-cache","expires":"0"}, "body:"+formId, true)});
            document.body.appendChild(form)
        }

//        console.log(loginInp)
//        console.log(loginBtn)
//        console.log(form)
    }
}




