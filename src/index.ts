interface Point {
  x: number;
  y: number;
}

function pointsEq(a: Point, b: Point){
  return a.x == b.x && a.y == b.y; 
}

function drawPoint(ctx: CanvasRenderingContext2D, p: Point, color= '#fff') {
  ctx.fillStyle = color;
  ctx.fillRect(p.x, p.y, 1, 1);
}

class Snake {
  dir: {x:number, y:number} | null;
  // Cache the next direction so if dirrection is
  // changed before the next move, we still move in
  // the firs requested direction
  nextDir: {x:number, y:number} | null;
  tail: Point[] = [];
  get points(){
    return [this.pos, ...this.tail];
  }
  size = 10;

  constructor(
    public pos: Point
  ) {
    // TODO: fix leak
    document.addEventListener('keydown', e => {
      const k = e.keyCode;
      let x = 0, y = 0;
      if (k === 37) {
        x = -1;
      } else if (k == 38) {
        y = -1;
      } else if (k === 39) {
        x = 1
      } else if (k === 40) {
        y = 1
      }else if(k === 32){
        this.dir = null;
        return;
      }else{
        return;
      }

      // Can't move on itself
      if(this.dir != null && (this.dir.x && x || this.dir.y && y)){
        return;
      }
      this.dir = {x, y};
      this.nextDir = this.nextDir || this.dir;
    })
  }

  move(){
    if(!this.dir){
      return;
    }

    const dir = this.nextDir || this.dir;
    this.nextDir = null;

    // tail
    this.tail.unshift(this.pos);
    this.tail = this.tail.slice(0, this.size);

    this.pos = {
      x: this.pos.x + dir.x,
      y: this.pos.y + dir.y,
    };
  }

  draw(ctx: CanvasRenderingContext2D) {
    let color = 255;
    this.points.forEach(p => {
      const c = Math.round(color);
      drawPoint(ctx, p, `rgb(${c},${c},${c})`);
      color *= 0.999;
    })
  }
}


function SnakeGame() {
  const scale = 15;
  const w = 40;
  const h = 30;
  let snake: Snake;
  let food: Point[] = [];
  let running = false;
  let step: number; //ms
  let enablePortal = true;

  function createFood(){
    // TODO: optimize
    for(;;){
      const f = {
        x: Math.floor(Math.random() * w),
        y: Math.floor(Math.random() * h),
      };
      if(!snake.points.some(p => pointsEq(p, f))) {
        return f;
      }
    }
  }

  // Create the canvas
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d') !;
  ctx.scale(scale, scale);

  newGame();

  let accumulator = 0;
  function loop(time: number) {
    accumulator = accumulator || time;
    while(accumulator <= time){
      update();
      accumulator += step;
    }
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  function update() {
    if(!running){
      return;
    }

    snake.move();

    // portal
    if(enablePortal){
      snake.pos.x = (snake.pos.x + w) % w;
      snake.pos.y = (snake.pos.y + h) % h;
    }

    // check if lost
    if(
      snake.tail.some(p => pointsEq(p, snake.pos)) ||
      snake.pos.x !== (snake.pos.x + w) % w ||
      snake.pos.y !== (snake.pos.y + h) % h
    ){
      gameOver();
    }

    // food
    const eaten = food.filter(f => pointsEq(snake.pos, f));
    eaten.forEach(f => {
      delete food[food.indexOf(f)];
      food.push(createFood());
      snake.size += 3;
      step = step * 0.999; // Speed-up game
    });
  }

  function gameOver(){
    newGame();
  }

  function newGame(){
    snake = new Snake({ x: w / 2, y: h / 2 });
    food = [createFood(), createFood()];
    step = 100;
    running = true;
  }

  function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    snake.draw(ctx);
    food.forEach(f => drawPoint(ctx, f, '#09f'));
  }
}

SnakeGame();
