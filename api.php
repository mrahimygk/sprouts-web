<?php
header('Access-Control-Allow-Origin: *'); 

$servername = "localhost";
$username = "cafesqir_root";
$password = "iHNqXYexdFBg";
$db = "cafesqir_spy";

$conn = new mysqli($servername, $username, $password, $db);
$conn-> set_charset("utf8");

if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

if(isset($_GET['action'])){
    $action =  $_GET['action'];
    if($action!=='new_game') die('invalid action');
    $indicesA = range(50, 150);
    shuffle($indicesA);
    $randomX1 = $indicesA[0];
    $randomY1 = $indicesA[1];
    $indicesB = range(250, 350);
    shuffle($indicesB);
    $randomX2 = $indicesB[0];
    $randomY2 = $indicesB[1];
    $player1Color = "green|||Green";
    $player2Color = "blue|||Blue";
    $gameCode = gen_uid(6, true);
    while(isGameCodeTaken($gameCode, $conn)){
        $gameCode = gen_uid(6, $easyCode);
    }
    $sql = "INSERT INTO sprouts_game (code, initial_data, player_1_color, player_2_color, present_players) VALUES ('$gameCode', '[[$randomX1,$randomY1], [$randomX2,$randomY2]]', '$player1Color', '$player2Color', 1);";
    runQuery($sql, $conn);
    echo $player1Color;
    echo "||| $gameCode";
    echo "||| [[$randomX1,$randomY1], [$randomX2,$randomY2]]";
}

if(isset($_GET['join_game'])){
    $gameCode = $_GET['join_game'];
    $position = getFreePositionOfGame($gameCode, $conn);
    if($position == false) {
        echo "Game not found, or it is full";
        return;
    }
    takeRole($gameCode, $conn);
    showRole($gameCode, $conn);
    echo "||| $gameCode";
    showGameInitData($gameCode, $conn);
    showGameTurn($gameCode, $conn);
    showGameProgress($gameCode, $conn);
}

if(isset($_GET['update_game'])){
    $gameCode = $_GET['update_game'];
    $drawInfo = $_GET['canvas_draw_info'];
    $turn = filter_input(INPUT_GET, 'turn', FILTER_VALIDATE_INT);
    updateGameData($gameCode, $turn, $drawInfo , $conn);
    echo "||| ".($turn+1);
}

if(isset($_GET['check_game_update'])){
    $gameCode = $_GET['check_game_update'];
    $turn = filter_input(INPUT_GET, 'turn', FILTER_VALIDATE_INT);
    checkGameUpdate($gameCode, $turn , $conn);
}

function gen_uid($l, $easyCode){
    $hash = "123456789";
    if($easyCode==false) {
        $hash .="abcdef";
        $l *= 2;
    }
    return substr(str_shuffle($hash), 0, $l);
}

function isGameCodeTaken($code, $conn){
    if($result = $conn->query("SELECT code FROM sprouts_game where code=`$code` LIMIT 1"))
	        return $result->num_rows >0;
}

function getFreePositionOfGame($gameCode, $conn){
    if($result = $conn->query("SELECT present_players FROM sprouts_game WHERE present_players<=2 AND code='$gameCode' LIMIT 1"))
        if($result->num_rows >0){
            $row = $result->fetch_assoc();
            return $row["present_players"];
        } else return false;
        
    return false;
}

function runQuery($sql , $conn){
    if ($conn->query($sql) === TRUE) {
// 		echo "New record created successfully";
	} else {
	   // echo "Error: " . $sql . "<br>" . $conn->error;
    }
}

function showRole($gameCode, $conn){
    if($result = $conn->query("SELECT player_2_color FROM sprouts_game WHERE code='$gameCode' LIMIT 1"))
        if($result->num_rows >0){
            $row = $result->fetch_assoc();
            echo $row["player_2_color"];
        }
}

function takeRole($gameCode, $conn){
    $sql = "UPDATE sprouts_game SET present_players=2 WHERE code='$gameCode'";
    runQuery($sql, $conn);
}

function showGameInitData($gameCode, $conn){
    if($result = $conn->query("SELECT initial_data FROM sprouts_game WHERE code='$gameCode' LIMIT 1"))
        if($result->num_rows >0){
            $row = $result->fetch_assoc();
            echo "||| ".$row['initial_data'];
        }
}

function showGameProgress($gameCode, $conn){
    if($result = $conn->query("SELECT turn_data FROM sprouts_game_data WHERE game='$gameCode' ORDER BY turn"))
        if($result->num_rows >0){
            echo "||| ";
            $j=0;
            while($row = $result->fetch_assoc()){
                if($j!=0) echo "||";
                echo $row['turn_data'];
            }
        }
}

function updateGameData($gameCode, $turn, $drawInfo , $conn){
    checkCurrentTurn($gameCode, $turn, $conn);
    $sql = "INSERT INTO sprouts_game_data (game, turn, turn_data) VALUES ('$gameCode', $turn , '$drawInfo')";
    runQuery($sql, $conn);
}

function checkCurrentTurn($gameCode, $turn, $conn){
    if($result = $conn->query("SELECT turn FROM `sprouts_game_data` WHERE game='$gameCode' AND turn=$turn LIMIT 1"))
        if($result->num_rows >0){
            $row = $result->fetch_assoc();
            if($row['turn']==$turn){
                die("Turn Number $turn which you are playing has passed already!");
            }
        }
}

function showGameTurn($gameCode, $conn){
    if($result = $conn->query("SELECT turn FROM sprouts_game_data WHERE game='$gameCode' ORDER BY turn DESC LIMIT 1"))
        if($result->num_rows >0){
            $row = $result->fetch_assoc();
            echo "||| ". (intval($row['turn'])+1);

        }
}

function checkGameUpdate($gameCode, $turn , $conn){
    if($result = $conn->query("SELECT turn_data FROM `sprouts_game_data` WHERE game='$gameCode' AND turn=$turn LIMIT 1"))
        if($result->num_rows >0){
            $row = $result->fetch_assoc();
            echo $row['turn_data'];
            return;
        }
    die("WAIT_MORE");
}





?>
