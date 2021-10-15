
/*
 * 定数
 */
 // FPS管理に使用するパラメータを定義
 var xFPS = 30;
 var xMSPF = 1000 / xFPS;
//ステージ
let BLOCK_SIZE = 24;    // 1ブロックのサイズ
let BLOCK_RAWS = 22;    // ステージの高さ（20ライン分をステージとして使用し、上下1ラインはあたり判定とブロックコピー用に使用）
let BLOCK_COLS = 12;    // ステージの幅
let SCREEN_WIDTH = BLOCK_SIZE * BLOCK_COLS;    // キャンバスの幅
let SCREEN_HEIGHT = BLOCK_SIZE * BLOCK_RAWS;   // キャンバスの高さ
// ゲームの状態
let GAME = 1;   // ゲーム中
let GAMEOVER = 0;   // ゲームオーバー時
let EFFECT = 2;   // ブロックを消すときのエフェクトモード
// ブロックの状態
let NON_BLOCK = 0;    // ブロックが存在しない
let NORMAL_BLOCK = 1;   // 通常のブロック（動かせる）
let LOCK_BLOCK = 2;   // ロックした（動かせない）ブロック
let CLEAR_BLOCK = 3;    // 消去するブロック（1ライン揃ったとき）
let WALL = 9;   // 壁
// エフェクト
let EFFECT_ANIMATION = 2;   // エフェクト時のちかちかする回数
// 色
let BACK_COLOR = "#ddd";    // 背景色
let GAMEOVER_COLOR = "#fff";  // ゲームオーバー時のブロックの色
let BLOCK_COLOR = "#000";   	// 操作ブロックの色
let LOCK_COLOR = "#333";    // ロックしたブロックの色
let WALL_COLOR = "#666";    // 壁の色
let ERROR_COLOR = "#f00";   // エラーブロックの色
let EFFECT_COLOR1 = "#fff";   // エフェクト時の色1
let EFFECT_COLOR2 = "#000";   // エフェクト時の色2
//ゲーム要素
let NEXTLEVEL = 10;   // 次のレベルまでの消去ライン数

/*
 * グローバル変数
 */
let canvas = null;    // キャンバス取得
let g = null;   // コンテキスト取得
let stage = new Array(BLOCK_COLS);    // ゲームのステージ枠（壁の情報のみ、変化しない）
let field = new Array(BLOCK_COLS);    // ゲーム中のステージ枠とブロック表示用（変化する）
let bs;   // ブロックサイズ
let speed;    // 落下速度
let frame;    // ゲームフレーム番号
let block = new Array();    // 落ちてくるブロックの種類（７種類）
let oBlock = new Array();   // 操作中のブロック
let blockType;    // ブロックの種類番号
let x, y;   // ブロックの現在位置
let sx, sy;   // ブロックの元位置
let mode;   // ゲームの状態  GAME/GAMEOVER/EFFECT
let timer1;   // ゲームループ用のタイマー
let FPS;    // 描画書き換え速度
let clearLine;    // 消去したライン数
// エフェクト時（色の反転/エフェクトスピード/エフェクト回数）
let effectState = {flipFlop: 0, speed: 0, count: 0};

let nowPlaying = false;
/*
 * 初期化
 */
function init(){
  clearTimeout(timer1);
  FPS = 30;
  clearLine = 0;
  //キャンバスの設定
  canvas = document.getElementById("canvas");
  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;
  g = canvas.getContext("2d");
  //エフェクトの設定
  effectState.flipFlop = 0;
  effectState.speed = 4;
  effectState.count = 0;
  // ブロックの設定
  bs = BLOCK_SIZE;
  // ブロックを設定
  block =  [[ [0, 0, 0, 0],
  [0, 1, 1, 0],
  [0, 1, 1, 0],
  [0, 0, 0, 0]],

  [   [0, 1, 0, 0],
  [0, 1, 0, 0],
  [0, 1, 0, 0],
  [0, 1, 0, 0]],

  [   [0, 0, 1, 0],
  [0, 1, 1, 0],
  [0, 1, 0, 0],
  [0, 0, 0, 0]],

  [   [0, 1, 0, 0],
  [0, 1, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 0]],

  [   [0, 0, 0, 0],
  [0, 1, 1, 0],
  [0, 1, 0, 0],
  [0, 1, 0, 0]],

  [   [0, 0, 0, 0],
  [0, 1, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 1, 0]],

  [   [0, 0, 0, 0],
  [0, 1, 0, 0],
  [1, 1, 1, 0],
  [0, 0, 0, 0]],
];
  // ステージを設定
stage = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], //表示しない
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]; //表示しない
}

/*
 * ステージ設定
 */
  function setStage(){
    // 表示するための配列
    for(let i=0; i<BLOCK_RAWS; i++){
      field[i] =  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    // 操作ブロックのための配列
    oBlock = [[0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0]
  ];
  // ステージデータをコピーする
  for(i=0; i<BLOCK_RAWS; i++){
    for(j=0; j<BLOCK_COLS; j++){
      field[i][j] = stage[i][j];
    }
  }
}

/*
 * ゲーム開始処理
 */
function newGame(){
  setStage();
  mode = GAME;
  nowPlaying = true;
  frame = 1;
  speed = 30;
  clearTimeout(timer1);
  createBlock();
  mainLoop();
}

/*
 * 新しいブロックを作成
 */
function createBlock(){
  if(mode == EFFECT) return;
  x = sx = Math.floor(BLOCK_COLS / 3);
  y = sy = 0;
  blockType = Math.floor(Math.random()*7);
  // ブロックをコピー
  for(i=0; i<4; i++){
    for(j=0; j<4; j++){
      oBlock[i][j] = block[blockType][i][j];
    }
  }

  if(hitCheck()){
    mode = GAMEOVER;
    console.log("GAMEOVER!");
  }
  putBlock();
}

/*
 * ブロックをロック（動かせないように）する
 */
function lockBlock(){
  if(mode == EFFECT) return;
  for(let i=0; i<4; i++){
    for(let j=0; j<4; j++){
      if(oBlock[i][j]) field[i+y][j+x] = LOCK_BLOCK;
    }
  }
}

/*
 * ブロックをステージにセットする
 */
function putBlock(){
  if(mode == EFFECT) return;
  for(let i=0; i<4; i++){
    for(let j=0; j<4; j++){
      if(oBlock[i][j]) field[i+y][j+x] = oBlock[i][j];
    }
  }
}

/*
 * ブロックを消去する
 */
function clearBlock(){
  if(mode == EFFECT) return;
  for(let i=0; i<4; i++){
    for(let j=0; j<4; j++){
      if(oBlock[i][j]) field[i+y][j+x] = NON_BLOCK;
    }
  }
}

/*
 * ブロックの回転処理
 */
function rotateBlock(){
  if(mode == EFFECT) return;
  clearBlock();
  // 回転ブロック退避の配列
  let tBlock = [  [0,0,0,0],
  [0,0,0,0],
  [0,0,0,0],
  [0,0,0,0]
  ];
  // ブロックを退避
  for(let i=0; i<4; i++){
    for(let j=0; j<4; j++){
     tBlock[i][j] = oBlock[i][j];
   }
 }
// ブロックを回転
for(let i=0; i<4; i++){
  for(let j=0; j<4; j++){
    oBlock[i][j] = tBlock[3-j][i];
  }
 }
 if(hitCheck()){
	// 元に戻す
  for(let i=0; i<4; i++){
   for(let j=0; j<4; j++){
    oBlock[i][j] = tBlock[i][j];
   }
  }
 }
putBlock();
return 0;
}

/*
 * ブロックの当たり判定処理（移動できるか？落下できるか？）
 */
function hitCheck(){
  if(mode == EFFECT) return;
  for(let i=0; i<4; i++){
    for(let j=0; j<4; j++){
      if(field[i+y][j+x] && oBlock[i][j])  return 1;
      }
    }
    return 0;
}

/*
 * ラインが揃ったかチェックする
 */
function lineCheck(){
  if(mode == EFFECT) return;
  let count;
  let lineCount = 0;        // 何ライン揃ったか？
  for (i=1; i<BLOCK_RAWS-2; i++){
    count = 0;  // 1ライン上に揃ったブロックの数
    for(j=0; j<BLOCK_COLS; j++){  // 右端からチェック
      if (field[i][j]) count++;
      else break;
    }
    if(count >= BLOCK_COLS){   // 1ライン揃った！
      lineCount++;
      clearLine++;
      for(j=1; j<BLOCK_COLS-1; j++) field[i][j] = CLEAR_BLOCK;    // 消去ブロックにする
      console.log("lineCount = " + lineCount);
      console.log("clearLine = " + clearLine);
    }
  }
  return lineCount;   // 消去ライン数を返す（現在、この戻り値は未使用）
}

/*
 * そろったラインを消去する
 */
function deleteLine() {
  if(mode == EFFECT) return;
  for(let i=BLOCK_RAWS-1; i>=1; i--){ // 下のラインから消去する
    for(let j=1; j<BLOCK_COLS-1; j++){ // 右端からチェック
      if(field[i][j] == CLEAR_BLOCK){
        field[i][j] = field[i-1][j];    // 一段落とす
        for(let above=i-1; above>=1; above--){  // 	そこからまた上を一段ずつおとしていく
          field[above][j] = field[above-1][j];
       }
       i++; // 落としたラインもまた、消去ラインだったときの対処
      }
    }
  }
}

/*
 * ゲーム画面クリア
 */
function clearWindow(){
  g.fillStyle = BACK_COLOR;
  g.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
};

/*
 * 描画処理
 */
function draw(){
  clearWindow();

  for(let i=0; i<BLOCK_RAWS; i++){
    for(let j=0; j<BLOCK_COLS; j++){
      switch(field[i][j]){
        case NON_BLOCK:   // なにもない
          g.fillStyle = BACK_COLOR;
          break;
        case NORMAL_BLOCK:    // ブロック
          g.fillStyle = BLOCK_COLOR;
          break;
        case LOCK_BLOCK:    // ブロック（ロック）
          g.fillStyle = LOCK_COLOR;
          break;
        case CLEAR_BLOCK:   // 消去ブロック
          g.fillStyle = BLOCK_COLOR;
          break;
        case WALL:    // 壁
          g.fillStyle = WALL_COLOR;
          break;
        default:   // 重なったときの色
          g.fillStyle = ERROR_COLOR;
      }
      g.fillRect(j*bs, i*bs, bs-1, bs-1);  // 1引いているのはブロック同士の隙間を入れるため
    }
  }
}

/*
 * ラインを消去するときのエフェクト
 */
 function effect(){
   let colors = [ EFFECT_COLOR1, EFFECT_COLOR2 ];

  g.fillStyle = colors[effectState.flipFlop];
  for(let i=0; i<BLOCK_RAWS; i++){
    for(let j=0; j<BLOCK_COLS; j++){
      if(field[i][j] == CLEAR_BLOCK){
        g.fillRect(j*bs, i*bs, bs-1, bs-1);
      }
    }
  }
  effectState.flipFlop = 1 - effectState.flipFlop;

  if(effectState.count > EFFECT_ANIMATION){
    mode = GAME;
    effectState.count = 0;
    effectState.flipFlop = 0;
    deleteLine();
    createBlock();
  }
  effectState.count++;
 }

 /*
  * ゲームオーバー処理
  */
function gameOver() {
  for(let i=0; i<BLOCK_RAWS; i++){
    for(let j=0; j<BLOCK_COLS; j++){
      if(field[i][j] && field[i][j] != WALL){ 	// ブロックのみ色を変える
      g.fillStyle = GAMEOVER_COLOR;
      g.fillRect(j*bs, i*bs, bs-1, bs-1);
      }
    }
  }
}
/*
 * ゲームメイン
 */
 function mainLoop() {
   if(mode == GAME){
     sx = x; sy = y;
     if(frame % speed == 0){
       clearBlock();
       y++;
       if(hitCheck()){
         y = sy;
         lockBlock();
         if(lineCheck() > 0){
           mode = EFFECT;
         }
         createBlock();
       }
       putBlock();
     }
     draw();
   }
   else if (mode == GAMEOVER) {
     gameOver();
   }
   else if (mode == EFFECT) {
     if (frame % effectState.speed == 0) {
       effect();
     }
   }
   frame++;
  	// 落下スピードアップ
   if (clearLine >=NEXTLEVEL){
     clearLine = 0;
     speed--;
     console.log("speedUP! :" + speed);
   }
   if (speed < 1) speed = 1;
   timer1 = setTimeout(mainLoop, 1000/FPS);
 }

 console.log(console.count(deleteLine));



 /*
  * キーボードイベント
  */
window.onkeydown = keyDownFunc;

  /*
   * 操作
   */
function keyDownFunc(e) {
  if(mode == EFFECT) return;
  if(mode == GAME){
    clearBlock();
    sx = x; sy = y;
       if(e.keyCode == 32) {
          rotateBlock();
       }
       else if(e.keyCode == 65) {
          x--;
       }
       else if (e.keyCode == 68) {
          x++;
       }
       else if (e.keyCode == 83) {
         y++;
       }
       if (hitCheck()) {
         x = sx; y = sy;
       }
       putBlock();
     }
     else if (mode == GAMEOVER) {
       if(e.keyCode == 13){
         newGame();
         }
       }
     }

     // タイトル画面
     var titleloop = function(ctx) {
         var startTime = new Date();
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         ctx.save();
         ctx.strokeStyle = '#000';
         ctx.moveTo(20, 100);
         ctx.lineTo(canvas.width-20, 100);
         ctx.stroke();
         ctx.moveTo(20, 145);
         ctx.lineTo(canvas.width-20, 145);
         ctx.stroke();
         ctx.strokeStyle = '#000';
         ctx.moveTo(30, 90);
         ctx.lineTo(canvas.width-30, 90);
         ctx.stroke();
         ctx.moveTo(30, 155);
         ctx.lineTo(canvas.width-30, 155);
         ctx.stroke();
         var text, width;

         // JavaScript Tetrisと表示
         ctx.font = '20px serif';
         ctx.textBaseline = 'middle';    // 上下位置のベースラインを中心に
         ctx.fillStyle = '#000';
         text = "JavaScript Tetris";
         width = ctx.measureText(text).width;
         ctx.fillText(text, (canvas.width - width) / 2, 120);

         // SPACE to Start と表示
         ctx.font = '12px serif';
         ctx.textBaseline = 'middle';    // 上下位置のベースラインを中心に
         ctx.fillStyle = '#000';
         text = "SPACE to START";
         width = ctx.measureText(text).width;
         ctx.fillText(text, (canvas.width - width) / 2, 240);
     }


/*
 * 起動処理
 */
window.onload = function(){
  init();
  titleloop(g);
}

window.addEventListener('keyup',function(e){
  if(e.key != ' ') return;
  if (nowPlaying) {
  return;
}
  newGame();
})
