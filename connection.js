function newGame(){
    var mygetrequest=new ajaxRequest()
    mygetrequest.onreadystatechange=function(){
        onNewGameResponse(mygetrequest);
    }
    var url = "http://www.cafe4sq.ir/sprouts/api.php?action=new_game";
    mygetrequest.open("GET", url, true)
    mygetrequest.send(null)
}

function onNewGameResponse(mygetrequest, isEasy){
    if (mygetrequest.readyState!=4) return;
    if (mygetrequest.status!=200 && window.location.href.indexOf("http")!=-1) return;
    var game_code = document.getElementById("game_code");
    var game_color = document.getElementById("game_color");
    var data = mygetrequest.responseText.split("|||");
    var colorCode = data[0];
    var colorName = data[1];
    var gameCode = data[2];
    var points = $.parseJSON(data[3]);
    clearArea();
    turn = 1;
    player_position = 1;
    player_color = colorCode;
    other_color = 'blue';
    drawPoint(points[0][0], points[0][1]);
    drawPoint(points[1][0], points[1][1]);
    game_code.innerHTML = '';
    game_code.appendChild(document.createTextNode('Game code: '+gameCode)); 
    document.getElementById("separator").innerHTML = '&nbsp;';
    game_color.innerHTML = '';
    game_color.appendChild(document.createTextNode('Your Color: ' + colorName));
}

function joinGame(){
    var game_code = document.getElementById('code_input').value;
    var mygetrequest=new ajaxRequest()
    mygetrequest.onreadystatechange=function(){
        onJoinGameResponse(mygetrequest, game_code);
    }
    var game_code_value=encodeURIComponent(game_code)
    mygetrequest.open("GET", "http://www.cafe4sq.ir/sprouts/api.php?join_game="+game_code_value, true)
    mygetrequest.send(null)
}

function onJoinGameResponse(mygetrequest, game_code){
    if (mygetrequest.readyState!=4) return;
    if (mygetrequest.status!=200 && window.location.href.indexOf("http")!=-1) return;
    if (!mygetrequest.responseText.includes("|||")) {
        alert(mygetrequest.responseText);
        return;
    }
    
    var game_code_e = document.getElementById("game_code");
    var game_color = document.getElementById("game_color");
    var data = mygetrequest.responseText.split("|||");
    var colorCode = data[0];
    var colorName = data[1];
    var gameCode = data[2];
    clearArea();
    player_position = 2;
    player_color = colorCode;
    other_color = 'green';
    var points = $.parseJSON(data[3]);
    drawPoint(points[0][0], points[0][1]);
    drawPoint(points[1][0], points[1][1]);
    turn = data[4];
    game_code_e.innerHTML = '';
    game_code_e.appendChild(document.createTextNode('Game Code: '+gameCode)); 
    document.getElementById("separator").innerHTML = '&nbsp;';
    game_color.innerHTML = '';
    game_color.appendChild(document.createTextNode('Your Color: ' + colorName));
    var lines = data[5];
    parseAndDrawLines(lines);
}

function parseAndDrawLines(lines){
    var linesArray = [];
    var i=0;
    lines.split("||").forEach(function(e){
        linesArray[i++] = JSON.parse(e);
    });
    
    drawLines(linesArray);
}

function updateGame(canvasDrawInfo){
    var game_code = document.getElementById("game_code").innerHTML.replace(/\D+/,"");
    var mygetrequest=new ajaxRequest()
    mygetrequest.onreadystatechange=function(){
        onUpdateGameResponse(mygetrequest, game_code);
    }
    var canvas_draw_info = JSON.stringify(canvasDrawInfo);
    var url = `http://www.cafe4sq.ir/sprouts/api.php?update_game=${game_code}&canvas_draw_info=${canvas_draw_info}&turn=${turn}`;
    mygetrequest.open("GET", url, true)
    mygetrequest.send(null)
}

function onUpdateGameResponse(mygetrequest, game_code){
    if (mygetrequest.readyState!=4) return;
    if (mygetrequest.status!=200 && window.location.href.indexOf("http")!=-1) return;
    if (!mygetrequest.responseText.includes("|||")) {
        alert(mygetrequest.responseText);
        return;
    }
    
    var data = mygetrequest.responseText.split("|||");
    turn = data[1];
    checkForGameUpdate(game_code, turn);
}

function checkForGameUpdate(game_code, turn){
    //asking api to get info about turn# for gameCode
    //if no results -> call myself again
    //if results, draw and return;
    var mygetrequest=new ajaxRequest()
    mygetrequest.onreadystatechange=function(){
        onCheckForGameUpdateResponse(mygetrequest, game_code);
    }
    var url = `http://www.cafe4sq.ir/sprouts/api.php?check_game_update=${game_code}&turn=${turn}`;
    mygetrequest.open("GET", url, true)
    mygetrequest.send(null)
}

function onCheckForGameUpdateResponse(mygetrequest, game_code){
    if (mygetrequest.readyState!=4) return;
    if (mygetrequest.status!=200 && window.location.href.indexOf("http")!=-1) return;
    if(mygetrequest.responseText.includes("WAIT_MORE")){
        console.log("wating for 1 more secs");
        setTimeout(function(){ 
            checkForGameUpdate(game_code, turn);    
        }, 1000);
        
        return;
    }
    
    parseAndDrawLines(mygetrequest.responseText);
    turn++;
}

function ajaxRequest(){
 var activexmodes=["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"] //activeX versions to check for in IE
 if (window.ActiveXObject){ //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
  for (var i=0; i<activexmodes.length; i++){
   try{
    return new ActiveXObject(activexmodes[i])
   }
   catch(e){
    //suppress error
   }
  }
 }
 else if (window.XMLHttpRequest) // if Mozilla, Safari etc
  return new XMLHttpRequest()
 else
  return false
}
