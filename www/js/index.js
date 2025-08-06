function drawLine( ctx, x1, y1, x2, y2) { // Функция непосредственной отрисовки (в каком контексте, иначе говоря где), координаты начала и конца
    ctx.beginPath();

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    ctx.stroke();
    ctx.closePath();
};

function drawGrid(canvas, ctx, cells = 3, cellsY = cells ) { // Отрисовка поля X*Y, по умолчанию квадратная, если не сказано иное
    const step = canvas.width / cells;
    const stepY = canvas.height / cellsY;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;

    // Горизонтальные линии
    for (let i = 1; i < cells; i++) {
        drawLine(ctx, 0, i * step, canvas.width, i * step);
    }

    // Вертикальные линии
    for (let i = 1; i < cellsY; i++) {
        drawLine(ctx, i * stepY, 0, i * stepY, canvas.height);
    }
} // Пост скриптум, мне пофиг на квадратность ячеек :D

$(document).ready(function(){
    const canvas = $("#myCanvas")[0];
    const ctx = canvas.getContext("2d");
    
    $("#myCanvas").after("<button id='clearCanvas'>Очистить холст</button>"); // Добавил кнопку тут... Потому что лень было идти в html
    $("#main").after(`
        <input id='cellInputX' type='number' min='1' max='10' value='3'></input>
        <input id='cellInputY' type='number' min='1' max='10' value='3'></input>
    `);
    let cellsX = parseInt($("#cellInputX").val());
    let cellsY = parseInt($("#cellInputY").val());
    $("#cellInputX, #cellInputY").change(function(){ // Функция динамической отрисовки поля с отчисткой перед этим
        const newCellsX = parseInt($("#cellInputX").val());
        const newCellsY = parseInt($("#cellInputY").val());
        cellsX = newCellsX;
        cellsY = newCellsY;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(canvas, ctx, newCellsX, newCellsY);
    });
    $("#clearCanvas").click(function(){ // Отчистка поля, т.к. тут единое поле для всего, каждый раз мы перерисовываем сетку
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        drawGrid(canvas, ctx, cellsX, cellsY);
    });
    drawGrid(canvas, ctx, 3, 3); // Рисуем сетку по умолчанию
    
    $("#myCanvas").on("mousedown",function(event){ // Обработка кликов
        const x = event.offsetX;    // Коорды мыши, куда мы тыкнули
        const y = event.offsetY;

        const zoneSizeX = canvas.width / cellsX; // Зонирование
        const zoneSizeY = canvas.height / cellsY;

        const col = Math.floor(x / zoneSizeY);   // Определение в какую координату я тыкнул
        const row = Math.floor(y / zoneSizeX);   

        //console.log(`Нажата ячейка: row=${row}, col=${col}`); // Проверочка была в сосноль

        const cx = col * zoneSizeY + zoneSizeY / 2; // Определение где будем рисовать (col/row) по факту являются шагами, поэтому их можно использовать как множитель перед zoneSize, потом мы находим центр зоны и там рисуем
        const cy = row * zoneSizeX + zoneSizeX / 2;

        if(event.button === 2){ // Если нажата правая кнопка мыши - синий. 
            ctx.beginPath();
            ctx.arc(cx, cy, 20, 0, Math.PI * 2);
            ctx.fillStyle = "blue";
            ctx.fill();
            ctx.closePath();
        }
        if(event.button === 0){
            ctx.beginPath();
            ctx.arc(cx, cy, 20, 0, Math.PI * 2);
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.closePath();
        }
        //У event нажатия кнопки есть параметр button, что принимает в себя от 0 до 4 (ЛКМ, СКМ, ПКМ, КМ4, КМ5) соответственно, надо хэндлеры прописывать для всех функций кнопок
    });

    $("#myCanvas").on("contextmenu", function(event) { // Обработка-перехват вызова контекстного меню через ПКМ
        event.preventDefault();
    });

})

