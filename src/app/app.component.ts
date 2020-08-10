import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { COLS, BLOCK_SIZE, ROWS, RENDER_BLOCK } from './constants';
import { ISnake, Direction, KEY } from './models';
import { BehaviorSubject, animationFrameScheduler, of, Observable, fromEvent, Subject } from 'rxjs';
import { map, tap, repeat, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {

  private unsubscribe: Subject<void>;
 
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

  keyPress: Observable<Event>;
  
  board: number[][];
  ctx: CanvasRenderingContext2D;

  tick: number

  snake: BehaviorSubject<ISnake[]>;

  ngOnInit() {
      this.unsubscribe = new Subject();
      const snake: ISnake[] = [];

      snake.push({
        x: 5,
        y: 5
      });
      snake.push({
        x: 4,
        y: 5
      });
      snake.push({
        x: 3,
        y: 5
      });
      snake.push({
        x: 2,
        y: 5
      });
      this.initBoard();
      this.snake = new BehaviorSubject(snake);
      
      this.snake.pipe(takeUntil(this.unsubscribe)).subscribe();

      this.keyPress = fromEvent(document, 'keydown')
      this.keyPress.pipe(
        tap((event: KeyboardEvent) => {
          this.keyEvent(event)
        }),
        takeUntil(this.unsubscribe)
      ).subscribe();
    
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  initBoard() {
    // Get the 2D context that we draw on.
    this.ctx = this.canvas.nativeElement.getContext('2d');

    // Calculate size of canvas from constants.
    this.ctx.canvas.width = COLS * BLOCK_SIZE;
    this.ctx.canvas.height = ROWS * BLOCK_SIZE;
    this.ctx.scale(RENDER_BLOCK, RENDER_BLOCK);
  }

  keyEvent(event: KeyboardEvent) {
    console.log('press');
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
    of(null, animationFrameScheduler)
      .pipe(
        tap(() => {
          if(!this.tick) {
            this.tick = 0;
          }
          if(this.tick > 13) {
            this.moveSnake();
            this.tick = 0;
            this.draw();
          }
          this.tick++;
        }),
        repeat(),
        takeUntil(this.unsubscribe),
    ).subscribe();
  }

  draw() {
    this.drawSnake();
  }

  drawSnake() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.snake.getValue().forEach((snakeBit) => {
      this.ctx.fillRect(snakeBit.x, snakeBit.y, 1, 1);
    });
  }

  moveSnake() {
      const snake = this.snake.getValue();
      snake.forEach((snakebit, index) => {
        if(index > 0) {
          snake[index-1].x = snakebit.x;
          snake[index-1].y = snakebit.y;
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
      this.snake.next(snake);
  }

  collisionHandler() {
    if(this.snake[0].x > this.ctx.canvas.width) {
      
    }
  }

  getEmptyBoard(): number[][] {
    return Array.from({ length: (ROWS*(BLOCK_SIZE/RENDER_BLOCK)) }, () => Array(COLS*(BLOCK_SIZE/RENDER_BLOCK)).fill(0));
  }

}
