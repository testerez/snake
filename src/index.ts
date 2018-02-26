// compress code with
// https://closure-compiler.appspot.com/home
// http://siorki.github.io/regPack.html

type Point = [number, number];
type Direction = [number, number];
declare const c: CanvasRenderingContext2D;

let
  scale = 15,
  w = 40,
  h = 30, 
  pointEq = ([ax, ay]: Point) => ([bx, by]: Point) => ax == bx && ay == by,
  drawPoint = (ctx: CanvasRenderingContext2D, [x, y]: Point, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  },

  // Game state
  food: Point,
  snakePoints: Point[] = [[w / 2, h / 2 ]],
  eatenCount = 0,
  snakeDirQueue = [] as Direction[], // queue directions
  snakeDir: Direction | undefined,

  createFood = () => {
    food = [w, h].map(size => Math.floor(Math.random() * size)) as Point;
    // if food is under the snake, re-create it
    snakePoints.some(pointEq(food)) && createFood();
  },
  loop = () => {
    snakeDir = snakeDirQueue.shift() || snakeDir;
    if (snakeDir) { // update game state
      const
        headPos = snakePoints[snakePoints.length - 1]
          .map((value, axis) => value + snakeDir![axis]) as Point,
        [x, y] = headPos;

      // check if lost
      if (
        snakePoints.some(pointEq(headPos)) ||
        x < 0 ||
        y < 0 ||
        x >= w ||
        y >= h
      ) {
        c.font = '3px impact';
        c.fillStyle = '#f00';
        c.textAlign = 'center';
        c.fillText('GAME OVER', 20, 15);
        return; // Exit game loop
      }

      snakePoints.push(headPos);

      // food
      if (pointEq(headPos)(food)) {
        createFood();
        eatenCount++;
      }

      snakePoints = snakePoints.slice(-eatenCount * 3 - 9);
    }

    // draw
    c.fillStyle = '#000';
    c.fillRect(0, 0, w, h);
    drawPoint(c, food, '#09f');
    snakePoints.forEach(p => drawPoint(c, p, `#fff`));

    c.font = '1px Verdana';
    c.fillStyle = '#fff';
    c.fillText(eatenCount as any, 1, 1.5);


    setTimeout(loop, 100 * (0.999 ** (eatenCount + 1)));
  };

// run game
c.scale(scale, scale);
c.shadowColor = '#000';
c.shadowBlur = 15;
createFood();
loop();

// user inputs
onkeydown = ({ keyCode: k }) => {
  const
    x = k == 37 ? -1 : k == 39 ? 1 : 0,
    y = k == 38 ? -1 : k == 40 ? 1 : 0,
    [nextX, nextY] = snakeDirQueue[0] || snakeDir || [] as any;
    
  // Can't stop and Can't move on itself
  (x && !x != !nextX || y && !y != !nextY) && snakeDirQueue.push([x, y]);
};
