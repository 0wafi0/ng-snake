import { Component, ViewChild, ElementRef, OnInit, HostListener } from '@angular/core';
import { COLS, BLOCK_SIZE, ROWS, RENDER_BLOCK } from './constants';
import { ITime, ISnake, Direction, KEY } from './models';
import { Observable } from 'rxjs'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
 
  // Get reference to the canvas.
  @ViewChild('board', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;

  title = 'Snake';
  points = 0;
  lines = 0;
  score = 0;
  level = 0;

  mutex: boolean = false;

  horizontal: boolean = true;
  direction: Direction = Direction.RIGHT;


  
  board: number[][];
  ctx: CanvasRenderingContext2D;

  time: ITime = {
    start: 0,
    elapsed: 0
  };
  snake: ISnake[] = [];

  ngOnInit() {
    this.snake.push({
      x: 5,
      y: 5
    })
    this.snake.push({
      x: 4,
      y: 5
    })
    this.snake.push({
      x: 3,
      y: 5
    })
    this.snake.push({
      x: 2,
      y: 5
    })
    this.initBoard();
  }

  initBoard() {
    // Get the 2D context that we draw on.
    this.ctx = this.canvas.nativeElement.getContext('2d');

    // Calculate size of canvas from constants.
    this.ctx.canvas.width = COLS * BLOCK_SIZE;
    this.ctx.canvas.height = ROWS * BLOCK_SIZE;
    this.ctx.scale(RENDER_BLOCK, RENDER_BLOCK);
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (KEY.UP === event.keyCode || KEY.DOWN === event.keyCode ||
        KEY.RIGHT === event.keyCode || KEY.LEFT === event.keyCode) {
      // If the keyCode exists in our moves stop the event from bubbling.
      if(this.mutex === false) {
        this.mutex = true;
        event.preventDefault();
        switch (event.keyCode) {
          case KEY.UP: {
            if(this.horizontal) {
              this.direction = Direction.UP
              this.horizontal = !this.horizontal;
            }
            break;
          }
          case KEY.DOWN: {
            if(this.horizontal) {
              this.direction = Direction.DOWN
              this.horizontal = !this.horizontal;
            }
            break;
          }
          case KEY.RIGHT: {
            if(!this.horizontal) {
              this.direction = Direction.RIGHT
              this.horizontal = !this.horizontal;
            }
            break;
          }
          case KEY.LEFT: {
            if(!this.horizontal) {
              this.direction = Direction.LEFT
              this.horizontal = !this.horizontal;
            }
            break;
          }
        }
      }
      
    }
  }

  play(){
    //this.board = this.getEmptyBoard();
    this.animate();
    console.log(this.board);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.drawSnake();
  }

  drawSnake() {
    this.snake.forEach((snakeBit) => {
      this.ctx.fillRect(snakeBit.x, snakeBit.y, 1, 1);
    })
  }

  moveSnake() {
      this.snake.forEach((snakebit, index) => {
        if(index > 0) {
          this.snake[index-1].x = snakebit.x;
          this.snake[index-1].y = snakebit.y;
        }
        switch (this.direction) {
          case Direction.RIGHT: {
            snakebit.x++;
            this.mutex = false;
            break;
          }
          case Direction.LEFT: {
            snakebit.x--;
            this.mutex = false;
            break;
          }
          case Direction.UP: {
            snakebit.y--;
            this.mutex = false;
            break;
          }
          case Direction.DOWN: {
            snakebit.y++;
            this.mutex = false;
            break;
          }
        }
      });
  }

  elongate() {
    this.snake.push({
      x: this.snake[0].x,
      y: this.snake[0].y
    });
    switch (this.direction) {
      case Direction.RIGHT: {
        this.snake[0].x++;
        break;
      }
      case Direction.LEFT: {
        this.snake[0].x--;
        break;
      }
      case Direction.UP: {
        this.snake[0].y--;
        break;
      }
      case Direction.DOWN: {
        this.snake[0].y++;
        break;
      }
    }
  }

  animate(now = 0) {
    // Update elapsed time.
    this.time.elapsed = now - this.time.start;
    // If elapsed time has passed time for current level
    if(this.time.elapsed > 100) {
      this.time.start = now;
      this.moveSnake();
      
    }
    this.draw();
    
    requestAnimationFrame(this.animate.bind(this));
  }

  collisionHandler() {
    if(this.snake[0].x > this.ctx.canvas.width) {
      
    }
  }

  getEmptyBoard(): number[][] {
    return Array.from({ length: (ROWS*(BLOCK_SIZE/RENDER_BLOCK)) }, () => Array(COLS*(BLOCK_SIZE/RENDER_BLOCK)).fill(0));
  }

}
