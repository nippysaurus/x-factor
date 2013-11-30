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

  var score = 0;

  var man_col = 1,
      man_row = 1,
      man_row_zero_for = 0,
      man_cannot_jump_for = 0;
      obstacle_row = 1;

  var frame = 1;


  var a = lcd.useChar("runninga");
  var b = lcd.useChar("runningb");

  var obstacle_col = null;

  var collision_check = function() {
    if (man_col != obstacle_col) { return false; }
    if (man_row == 1) { return true; }
    else { score++; return false; }
  };

  var generate_obstacle = function() {
    obstacle_col = lcd.cols;
  };

  generate_obstacle();

  sensor.on("data", function(){
    if ((this.value < 3) && (man_row_zero_for == 0) && (man_cannot_jump_for == 0)) {
      man_row = 0;
      man_row_zero_for = 4;
      man_cannot_jump_for = 1;
    }
  });

  lcd.on("ready", function() {

    board.loop(150, function() {

      if (man_row_zero_for > 0) {
        man_row_zero_for--;
      } else {
        man_row = 1;
      }

      if (obstacle_col == 0) {
        generate_obstacle();
      }

      if ((man_row_zero_for == 0) && (man_row == 1) && (man_cannot_jump_for > 0)) {
        man_cannot_jump_for--;
      }

      lcd.clear();

      lcd.cursor( man_row, man_col ).print(
        ":running" + (++frame % 2 === 0 ? "a" : "b") + ":"
      );

      lcd.cursor( obstacle_row, (obstacle_col-1) ).print('X');
      lcd.cursor( 0, 14 ).print(score);

      if (obstacle_col) {
        obstacle_col -= 1;
        if (collision_check()) {
          // GAME OVER
          lcd.clear().cursor( 0, 0 ).print("GAME OVER");
          //console.log(score);
          process.exit();
        }
      }
    });

  });
});


// @device [16 x 2 LCD White on Blue](http://www.hacktronics.com/LCDs/16-x-2-LCD-White-on-Blue/flypage.tpl.html)
// @device [20 x 4 LCD White on Blue](http://www.hacktronics.com/LCDs/20-x-4-LCD-White-on-Blue/flypage.tpl.html)
