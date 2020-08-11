import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { COLS, BLOCK_SIZE, ROWS, RENDER_BLOCK } from './constants';
import { ISnake, Direction, KEY } from './models';
import { BehaviorSubject, animationFrameScheduler, of, Observable, fromEvent, Subject } from 'rxjs';
import { map, tap, repeat, takeUntil } from 'rxjs/operators';
import { stringify } from '@angular/compiler/src/util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {

  // Get reference to the canvas.
  @ViewChild('board', { static: true })
  private canvas: ElementRef<HTMLCanvasElement>;

  title = 'Snake';
  points = 0;
  lines = 0;
  score = 0;
  level = 0;

  private mutex: boolean;
  private horizontal: boolean;
  private tick: number;
  
  private direction = Direction.RIGHT;

  private unsubscribe: Subject<void> =  new Subject();
  private keyPress: Observable<Event> = fromEvent(document, 'keydown');
  private ctx: CanvasRenderingContext2D;
  private snake: BehaviorSubject<ISnake>;
  constructor() {
    const snakeDefault: ISnake = new ISnake();
    snakeDefault.current.push({
      x: 5,
      y: 5
    });
    snakeDefault.previous.push({
      x: 5,
      y: 5
    });
    snakeDefault.current.push({
      x: 4,
      y: 5
    });
    snakeDefault.previous.push({
      x: 4,
      y: 5
    });
    snakeDefault.current.push({
      x: 3,
      y: 5
    });
    snakeDefault.previous.push({
      x: 3,
      y: 5
    });
    snakeDefault.current.push({
      x: 2,
      y: 5
    });
    snakeDefault.previous.push({
      x: 2,
      y: 5
    });
    this.snake = new BehaviorSubject(snakeDefault);
  }

  ngOnInit() {
    this.initBoard();
    this.snake.pipe(
      map(snake => {
      if(JSON.stringify(snake.current) ===  JSON.stringify(snake.previous)) {
        return snake;
      }
      return this.updateSnake(snake);
      }),
      tap(snake => this.drawSnake(snake)),
      takeUntil(this.unsubscribe))
    .subscribe();
    
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
          }
          this.tick++;
        }),
        repeat(),
        takeUntil(this.unsubscribe),
    ).subscribe();
  }

  updateSnake(snake: ISnake) {
    snake.current.forEach((_snakeBit, index) => {
      if(index === 0) {
        return;
      }
      snake.current[index].x = snake.previous[index-1].x;
      snake.current[index].y = snake.previous[index-1].y;
    });
    
    snake.previous = snake.current;
    return snake;
  }



  drawSnake(snake: ISnake) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    console.log(snake);
    snake.current.forEach((snakeBit) => {
      this.ctx.fillRect(snakeBit.x, snakeBit.y, 1, 1);
    });
  }



  moveSnake() {
      const snake = this.snake.getValue();
      switch (this.direction) {
        case Direction.RIGHT: {
          snake.current[0].x++;
          this.mutex = false;
          break;
        }
        case Direction.LEFT: {
          snake.current[0].x--;
          this.mutex = false;
          break;
        }
        case Direction.UP: {
          snake.current[0].y--;
          this.mutex = false;
          break;
        }
        case Direction.DOWN: {
          snake.current[0].y++;
          this.mutex = false;
          break;
        }
      }

      // snake.forEach((snakebit, index) => {
      //   if(index > 0) {
      //     snake[index-1].x = snakebit.x;
      //     snake[index-1].y = snakebit.y;
      //   }
      //   switch (this.direction) {
      //     case Direction.RIGHT: {
      //       snakebit.x++;
      //       this.mutex = false;
      //       break;
      //     }
      //     case Direction.LEFT: {
      //       snakebit.x--;
      //       this.mutex = false;
      //       break;
      //     }
      //     case Direction.UP: {
      //       snakebit.y--;
      //       this.mutex = false;
      //       break;
      //     }
      //     case Direction.DOWN: {
      //       snakebit.y++;
      //       this.mutex = false;
      //       break;
      //     }
      //   }
      // });
      this.snake.next(snake);
  }

  collisionHandler() {
    const snake = this.snake.getValue()
    if(snake[0].x > this.ctx.canvas.width) {
      snake[0].x = 0;
    }
    if(snake[0].x < 0) {
      snake[0].x = this.ctx.canvas.width;
    }

    this.snake.next
  }

  getEmptyBoard(): number[][] {
    return Array.from({ length: (ROWS*(BLOCK_SIZE/RENDER_BLOCK)) }, () => Array(COLS*(BLOCK_SIZE/RENDER_BLOCK)).fill(0));
  }

}
