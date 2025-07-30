function showEntranceForm(client, isError, transitStr){
    console.log("Получены данные формы входа: ");
    console.log(JSON.parse(client.responseText.replaceAll("\r","").replaceAll("\n","").replaceAll("\t","")))
}