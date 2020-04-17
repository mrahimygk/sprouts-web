var mousePressed = false;
var lineDrawn = false;
var lastX, lastY;
var ctx;
var turn = 0;
var player_position = 0;
var player_color= 'red';
var other_color = 'red';
var points = [];

//TODO: get color on join game

function initCanvas() {
    ctx = document.getElementById('sprouts_canvas').getContext("2d");

    $('#sprouts_canvas').mousedown(function (e) {
        if(turn===0 || player_position===0) {
            alert ('Join a game first, Or start a new one.');
            return;
        }
        if(Math.abs((turn - player_position)) % 2 !==0 ){
            alert ('This is not your turn to draw');
            return;
        }
        mousePressed = true;
        var x = e.pageX - $(this).offset().left;
        var y =  e.pageY - $(this).offset().top;
        if(lineDrawn){
            points[i++] = [x, y];
            drawPoint(x, y);
        }else{
            i=0;
            points[i++] = [x, y];
            Draw(x, y, false, player_color);
        }
    });

    $('#sprouts_canvas').mousemove(function (e) {
        if (mousePressed) {
            if(lineDrawn){
                //TODO: move the point?
            }else{
                var x = e.pageX - $(this).offset().left;
                var y =  e.pageY - $(this).offset().top;
                points[i++] = [x,y];
                Draw(x, y, true, player_color);
            }
        }
    });

    $('#sprouts_canvas').mouseup(function (e) {
        mousePressed = false;
        if(lineDrawn){
            updateGame(points);
            points = [];
            lineDrawn = false;
        }else{
            lineDrawn=true;
        }
    });
	   
	$('#sprouts_canvas').mouseleave(function (e) {
        // mousePressed = false;
    });
}
 
var i=0;

function Draw(x, y, isDown, player_color) {
    if (isDown) {
        ctx.beginPath();
        ctx.strokeStyle = player_color; //TODO: get color on join game
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.stroke();
    }
    lastX = x; lastY = y;
}

function drawLines(linesArray){
    var me=false;
    for (var l = 0; l < linesArray.length; ++l) {
        var startPoint = linesArray[l][0];
        var x = startPoint[0]; 
        var y = startPoint[1];
        var color = 'red';
        if(me) color = player_color;
        else color = other_color;
        Draw(x,y, false, color);
        for(var i=1; i< linesArray[l].length-1; i++){
            var point = linesArray[l][i];
            Draw(point[0], point[1], true, color);
        }
        var midPoint = linesArray[l].last();
        drawPoint(midPoint[0], midPoint[1]);
        me = !me;
    }
}

function drawPoint(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI, true);
    ctx.closePath();
    ctx.fill();
}
	
function clearArea() {
    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
}
