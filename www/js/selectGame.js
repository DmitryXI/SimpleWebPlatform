// Отображение формы выбора игры
// Если создание формы: client - XMLHttpRequest, isError - флаг наличие ошибки при выполнении запроса, transitStr - строка - id элемента в документе, куда форму вставить
// Если обновление формы: client - строка "refresh", isError - id формы входа
function showSelectGameForm(client, isError, transitStr){

    let formId = "unknown"
    let lastFormId = "unknown"
    let parentFormId = "unknown"
    let answer = null

    if(client !== "refresh"){
        answer = JSON.parse(client.responseText.replaceAll("\r","").replaceAll("\n","").replaceAll("\t",""))
        console.log("Получены данные формы выбора игры: ");
        console.log(answer)
        if(answer.error !== null){
            if(answer.error === true){
                alert("Error "+answer.code+"\n"+answer.text)
                return
            }
        }
        console.log("ID объекта для вставки формы: "+transitStr)
        let tAr = transitStr.split(':')
        formId = answer.formId
        parentFormId = tAr[0]
        if(tAr.length > 1){
            lastFormId = tAr[1]
        }
    }else{
        formId = isError
    }

    console.log("ID формы входа: "+formId)
    console.log("ID формы для удаления: "+lastFormId)
    console.log("ID формы родительской формы: "+parentFormId)

    if(lastFormId !== "unknown"){
        let tFrm = $("#"+lastFormId)
        if(tFrm !== null){
            tFrm.remove()
            if(window.CPJ.activeForms[lastFormId] !== null){
                delete window.CPJ.activeForms[lastFormId]
            }
        }
    }

    // Пытаемся получить ссылку на созданную форму в body (на случай вызова функции на resize окна)
    let form = $("#"+formId)
    let item = null

    // Если готовой формы нет, создаём новую
    if(form === null){
        let srcFormHtml = getFromUrl("GET", window.CPJ.basePath+"forms/selectGameForm.html", false, null, null, null, null, {"cache-control":"no-cache, no-store, must-revalidate","pragma":"no-cache","expires":"0"}, null, true)
        if(srcFormHtml !== false){
//            console.log(srcFormHtml.responseText)
            let formHtml = srcFormHtml.responseText.replaceAll("${id}", formId).replaceAll("${z}", 1)
//            console.log(formHtml)
            form = getElFromHTML(formId, formHtml)
            item = cutElFromElement("#"+formId+"_item_", form)
//            console.log(item)
//            console.log(form)
            let keys = Object.keys(answer.games)
            console.log(keys)

            if(keys.length > 0){
                for(num in keys){
//                    console.log(keys[num])
//                    console.log(answer.games[keys[num]])
                    let cKey = keys[num]
                    let cItem = item.cloneNode(item)
                    cItem.id = item.id+"_"+keys[num]
                    cItem.addEventListener('click', () => {getFromUrl("POST", window.CPJ.basePath, false, showSelectGameSessionForm, null, null, {"action":answer.for,"usessid":window.CPJ.usessid,"gameId":cKey}, {"cache-control":"no-cache, no-store, must-revalidate","pragma":"no-cache","expires":"0"}, "body:"+formId, true)});
                    cItem.innerHTML = answer.games[keys[num]].name
                    form.appendChild(cItem)
                }
            }
        }
    }

    let screen = viewport();
    w = Math.trunc(screen.width/3)
    h = Math.trunc(screen.height/3)
    form.style.left = w+"px"
    form.style.top = h+"px"
    form.style.width = form.style.left
    form.style.height = form.style.top

    if(client !== "refresh"){
        document.body.appendChild(form)
        window.CPJ.activeForms[formId] = {"function":"showSelectGameForm", "params":["refresh"]}
    }
}