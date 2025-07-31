function showEntranceForm(client, isError, transitStr){
    let answer = JSON.parse(client.responseText.replaceAll("\r","").replaceAll("\n","").replaceAll("\t",""))
    console.log("Получены данные формы входа: ");
    console.log(answer)
    console.log("ID объекта для вставки формы: "+transitStr)

    let srcFormHtml = getFromUrl("GET", window.CPJ.basePath+"forms/entranceForm.html", false, null, null, null, null, {"cache-control":"no-cache, no-store, must-revalidate","pragma":"no-cache","expires":"0"}, null, true)
    if(srcFormHtml !== false){
//        console.log(srcFormHtml.responseText)
        let formHtml = srcFormHtml.responseText.replaceAll("${id}", "etrFrm").replaceAll("${z}", 1)
//        console.log(formHtml)

        let form = getElFromHTML("etrFrm", formHtml)
        let screen = viewport();
        w = Math.trunc(screen.width/3)
        h = Math.trunc(screen.height/3)
        form.style.left = w+"px"
        form.style.top = h+"px"
        form.style.width = form.style.left
        form.style.height = form.style.top

        let loginInp = form.querySelector("#etrFrm_login")
        loginInp.style.left = Math.trunc(w/4)+"px"
        loginInp.style.width = Math.trunc(w/2)+"px"
        loginInp.style.top = Math.trunc(h/4)+"px"
        loginInp.style.height = Math.trunc(h/2)+"px"
        loginInp.style.fontSize = Math.trunc(h/5)+"px"

        let loginBtn = form.querySelector("#etrFrm_entrance")
        loginBtn.style.left = Math.trunc(w/4)+"px"
        loginBtn.style.width = Math.trunc(w/2)+"px"
        loginBtn.style.top = Math.trunc(h/4)*3+"px"
        loginBtn.style.height = Math.trunc(h/4)+"px"
        loginBtn.style.fontSize = Math.trunc(h/6)+"px"
        loginBtn.addEventListener('click', () => {getFromUrl("POST", window.CPJ.basePath, false, null, null, null, {"action":answer.for,"usessid":window.CPJ.usessid,"login":$("#etrFrm_login").value}, {"cache-control":"no-cache, no-store, must-revalidate","pragma":"no-cache","expires":"0"}, "body", true)});

//        console.log(loginInp)
//        console.log(loginBtn)
//        console.log(form)
        document.body.appendChild(form)
    }
}




