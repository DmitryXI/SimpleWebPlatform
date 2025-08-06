function drawLine( ctx, x1, y1, x2, y2) {
    ctx.beginPath();

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    ctx.stroke();
    ctx.closePath();
};

function drawGrid(canvas, ctx, cells = 3) {
    const step = canvas.width / cells;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;

    // Горизонтальные линии
    for (let i = 1; i < cells; i++) {
        drawLine(ctx, 0, i * step, canvas.width, i * step);
    }

    // Вертикальные линии
    for (let i = 1; i < cells; i++) {
        drawLine(ctx, i * step, 0, i * step, canvas.height);
    }
}

$(document).ready(function(){
    const canvas = $("#myCanvas")[0];
    const ctx = canvas.getContext("2d");
    $("#myCanvas").after("<button id='clearCanvas'>Очистить холст</button>");
    
    $("#clearCanvas").click(function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(canvas, ctx, 3);
    });
    drawGrid(canvas, ctx, 3);
    
    $("#myCanvas").on("mousedown",function(event){
        const x = event.offsetX;
        const y = event.offsetY;

        const zoneSize = canvas.width / 3;

        const col = Math.floor(x / zoneSize);
        const row = Math.floor(y / zoneSize);

        console.log(`Нажата ячейка: row=${row}, col=${col}`);

        const cx = col * zoneSize + zoneSize / 2;
        const cy = row * zoneSize + zoneSize / 2;

        if(event.button === 2){
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
    });

    $("#myCanvas").on("contextmenu", function(event) {
        event.preventDefault();
    });

})

