// 
// X-FACTOR
//
// version: 1.0
// authors: @ssanj & @nippysaurus
//

var five = require("johnny-five"),
    board, lcd;

board = new five.Board();

board.on("ready", function() {

  lcd = new five.LCD({
    // LCD pin name  RS  EN  DB4 DB5 DB6 DB7
    // Arduino pin # 7    8   9   10  11  12
    pins: [ 6, 8, 2, 3, 4, 5 ],
    rows: 2,
    cols: 16
  });

  var sensor = new five.Sensor({
    pin: "A7",
    freq: 50  
  });

  var running = true;
  var print_game_over = true;
  var score = 0;

  var man_col = 2,
      man_row = 1,
      man_row_zero_for = 0,
      man_cannot_jump_for = 0;
      obstacle_row = 1;

  var frame = 1;

  var a = lcd.useChar("runninga");
  var b = lcd.useChar("runningb");

  var obstacle_cols = [];

  var collision_check = function() {
    for(var i=0;i<obstacle_cols.length;i++) {
      var obstacle_col = obstacle_cols[i];
      if (man_col != obstacle_col) { continue; }
      if (man_row == 1) {
        return true;
      } else {
        score++;
        return false;
      }
    }
  };

  var generate_obstacle = function() {
    obstacle_cols.push(lcd.cols);
  };

  generate_obstacle();

  sensor.on("data", function(){
    if ((this.value < 3) && (man_row_zero_for == 0) && (man_cannot_jump_for == 0)) {
      man_row = 0;
      man_row_zero_for = 4;
      man_cannot_jump_for = 2;
    }
  });

  lcd.on("ready", function() {

    board.loop(150, function() {

      if (!running) {
        if (print_game_over) {
          // GAME OVER
          lcd.clear();
          lcd.cursor( 0, 3 ).print('GAME  OVER');
          lcd.cursor( 1, 7 ).print(score);
          print_game_over = false;
        }

        setTimeout((function() {
          process.exit();
        }), 200);

        return;
      }

      if (man_row_zero_for > 0) {
        man_row_zero_for--;
      } else {
        man_row = 1;
      }

      for(var i=0;i<obstacle_cols.length;i++) {
        if (obstacle_cols[i] != 0) {
          obstacle_cols[i]--;
        }
      }

      var random = Math.floor((Math.random()*10)+1);
      if (random == 5) {
        generate_obstacle();
      }

      if ((man_row_zero_for == 0) && (man_row == 1) && (man_cannot_jump_for > 0)) {
        man_cannot_jump_for--;
      }

      lcd.clear();

      lcd.cursor( man_row, man_col ).print(
        ":running" + (++frame % 2 === 0 ? "a" : "b") + ":"
      );

      for(var i=0;i<obstacle_cols.length;i++) {
        if (obstacle_cols[i] != 0) {
          lcd.cursor( obstacle_row, obstacle_cols[i] ).print('X');
        }
      }

      lcd.cursor( 0, 14 ).print(score);

      if (collision_check()) {
        running = false;
      }
    });

  });
});
