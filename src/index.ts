// compress code with
// https://closure-compiler.appspot.com/home
// http://siorki.github.io/regPack.html

interface Point {
  x: number;
  y: number;
}

interface Direction {
  x: number,
  y: number,
}

let pointsEq = (a: Point) => (b: Point) => a.x == b.x && a.y == b.y; 

let drawPoint = (ctx: CanvasRenderingContext2D, p: Point, color: string) => {
  ctx.fillStyle = color;
  ctx.fillRect(p.x, p.y, 1, 1);
}

// Game size
const scale = 15;
const w = 40;
const h = 30;

// Canvas
declare const c: CanvasRenderingContext2D;
c.scale(scale, scale);

// Game state
let food: Point;
let snakePoints = [{ x: w / 2, y: h / 2 }];
let eatenCount = 0;
let step = 100;
let running = true;
let snakeDir: Direction | null;
let snakeNextDir: Direction | null;

function createFood(){
  // TODO: optimize
  let f: Point;
  do {
    f = {
      x: Math.floor(Math.random() * w),
      y: Math.floor(Math.random() * h),
    };
    food = f;
  } while(snakePoints.some(pointsEq(f)))
}
createFood();

let accumulator = 0;
function loop(time: number) {
  accumulator = accumulator || time;
  while(accumulator <= time){
    // update game state
    if (running) {
      const headPos = snakePoints[0];

      // food
      if (pointsEq(headPos)(food)) {
        createFood();
        eatenCount++;
        step = step * 0.999; // Speed-up game
      }

      // move snake
      const dir = snakeNextDir || snakeDir;
      if (dir) {
        snakeNextDir = null;

        const newHeadPos = {
          x: headPos.x + dir.x,
          y: headPos.y + dir.y,
        }

        // check if lost
        if(
          snakePoints.some(pointsEq(newHeadPos)) ||
          newHeadPos.x < 0 ||
          newHeadPos.x >= w ||
          newHeadPos.y < 0 ||
          newHeadPos.y >= h
        ) {
          c.font = "5px Impact";
          c.fillStyle = "#f00";
          c.textAlign= "center"; 
          c.fillText(`Your score: ${eatenCount}`, w / 2, h / 2);
          return; // Exit game loop
        }
        snakePoints.unshift(newHeadPos);
        snakePoints = snakePoints.slice(0, (eatenCount * 3) + 10);
      }
    }

    accumulator += step;
  }

  // draw
  c.fillStyle = "#000";
  c.fillRect(0, 0, w, h);
  let color = 255;
  snakePoints.forEach(p => {
    const c2 = Math.round(color);
    drawPoint(c, p, `rgb(${c2},${c2},${c2})`);
    color *= 0.997;
  })
  drawPoint(c, food, '#09f');


  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

document.addEventListener('keydown', e => {
  const k = e.keyCode;
  const x =
    k == 37 ? -1 :
    k == 39 ? 1 :
    0;
  const y =
    k == 38 ? -1 :
    k == 40 ? 1 :
    0;
    
  // Can't strop and Can't move on itself
  if ((x || y) && !(snakeDir && (snakeDir.x && x || snakeDir.y && y))) {
    snakeDir = { x, y };
    snakeNextDir = snakeNextDir || snakeDir;
  }
});
