import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { COLS, BLOCK_SIZE, ROWS, RENDER_BLOCK } from './constants';
import { ISnake, Direction, KEY, ICoordinates } from './models';
import { BehaviorSubject, animationFrameScheduler, of, Observable, fromEvent, Subject } from 'rxjs';
import { map, tap, repeat, takeUntil } from 'rxjs/operators';
import  * as _ from "lodash";

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

  private mutex: boolean = true;
  private horizontal: boolean = true;
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
    const defaultFood = this.spawnFood();
    const snake = this.snake.getValue();
    snake.food = {
      x: defaultFood.x,
      y: defaultFood.y
    }

    this.snake.next(snake);  
    this.snake.pipe(
      map(snake => {
      if(_.isEqual(snake.current,snake.previous)) {
        return snake;
      }
      return this.updateSnake(this.outOfBounds(snake));
      }),
      tap(snake => this.drawSnakeAndFood(snake)),
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

  spawnFood(): ICoordinates {
    const x = Math.floor(Math.random() * (this.ctx.canvas.width/RENDER_BLOCK - 1));
    const y = Math.floor(Math.random() * (this.ctx.canvas.height/RENDER_BLOCK - 1));
    return this.isCoordinateCollidingSnake(x, y) ?
    this.spawnFood() : {
      x: x,
      y: y
    };
  }

  isCoordinateCollidingSnake(x: number, y: number): boolean {
    const snake = this.snake.getValue();
    return !!snake.previous.find(item => item.x === x &&  item.y === y);
  }

  keyEvent(event: KeyboardEvent) {
    if (KEY.UP === event.keyCode || KEY.DOWN === event.keyCode ||
        KEY.RIGHT === event.keyCode || KEY.LEFT === event.keyCode) {
      // if the keyCode exists in our moves stop the event from bubbling. 
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
          if(this.tick > 6) {
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
    if(_.isEqual(snake.current[0], snake.food)) {
      this.mutex = true;
      snake.current = _.cloneDeep(snake.previous);
      snake.current.push(snake.food);
      snake.previous.push(snake.food);
      snake.food = this.spawnFood();
      return snake
    }
    snake.current.forEach((_snakeBit, index) => {
      if(index === 0) {
        return;
      }
      snake.current[index].x = snake.previous[index-1].x;
      snake.current[index].y = snake.previous[index-1].y;
    });
    snake.previous = _.cloneDeep(snake.current);
    return snake;
  }

  drawSnakeAndFood(snake: ISnake) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    snake.current.forEach((snakeBit) => {
      this.ctx.fillRect(snakeBit.x, snakeBit.y, 1, 1);
    });
    this.ctx.fillRect(snake.food.x, snake.food.y, 1, 1);
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
      this.snake.next(snake);
  }

  outOfBounds(snake: ISnake) {
    if(snake.current[0].x * RENDER_BLOCK >= this.ctx.canvas.width && this.direction === Direction.RIGHT) {
      snake.current[0].x = 0;
    }
    if(snake.current[0].x < 0 && this.direction === Direction.LEFT) {
      snake.current[0].x = (this.ctx.canvas.width/RENDER_BLOCK - 1);
    }

    if(snake.current[0].y * RENDER_BLOCK >= this.ctx.canvas.height && this.direction === Direction.DOWN) {
      snake.current[0].y = 0;
    }
    if(snake.current[0].y < 0 && this.direction === Direction.UP) {
      snake.current[0].y = (this.ctx.canvas.height/RENDER_BLOCK - 1);
    }
    return snake;
  }

  getEmptyBoard(): number[][] {
    return Array.from({ length: (ROWS*(BLOCK_SIZE/RENDER_BLOCK)) }, () => Array(COLS*(BLOCK_SIZE/RENDER_BLOCK)).fill(0));
  }

}
