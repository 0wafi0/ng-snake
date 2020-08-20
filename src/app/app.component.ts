import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { COLS, BLOCK_SIZE, ROWS, RENDER_BLOCK } from './constants';
import { ISnake, Direction, KEY } from './models';
import { generateDefaultSnake, snakeLoopInit, moveSnake } from './snake';
import { BehaviorSubject, animationFrameScheduler, of, Observable, fromEvent, Subject } from 'rxjs';
import { map, tap, repeat, takeUntil } from 'rxjs/operators';
import  * as _ from "lodash";
import { MatDialog } from '@angular/material/dialog';

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
  private isPlaying: boolean = false;
  private horizontal: boolean = true;
  private tick: number;

  private unsubscribe: Subject<void> =  new Subject();
  private restart: Subject<void> =  new Subject();
  private keyPress: Observable<Event> = fromEvent(document, 'keydown');
  private ctx: CanvasRenderingContext2D;
  private snake: BehaviorSubject<ISnake>;

  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    this.initBoard();
    this.snake = generateDefaultSnake(this.ctx);
    
    snakeLoopInit(this.snake, this.ctx, this.dialog, this.unsubscribe, this.restart);
    this.keyPressLoopInit(this.keyPress);

    this.restart.pipe(tap(_value => {
      this.initBoard();
      this.snake = generateDefaultSnake(this.ctx);
      this.isPlaying = false;
      snakeLoopInit(this.snake, this.ctx, this.dialog, this.unsubscribe, this.restart);
      this.keyPressLoopInit(this.keyPress);
    }),
    ).subscribe();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    this.restart.unsubscribe();
    this.restart.complete();
    this.snake.complete();
  }

  keyPressLoopInit(keyPress: Observable<Event>) {
    keyPress.pipe(
      tap((event: KeyboardEvent) => {
        this.keyEvent(event)
      }),
      takeUntil(this.unsubscribe)
    ).subscribe();
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
      // if the keyCode exists in our moves stop the event from bubbling. 
      if(this.mutex === false) {
        this.mutex = true;
        event.preventDefault();
        switch (event.keyCode) {
          case KEY.UP: {
            if(this.horizontal) {
              this.snake.getValue().direction = Direction.UP
              this.horizontal = !this.horizontal;
            }
            break;
          }
          case KEY.DOWN: {
            if(this.horizontal) {
              this.snake.getValue().direction = Direction.DOWN
              this.horizontal = !this.horizontal;
            }
            break;
          }
          case KEY.RIGHT: {
            if(!this.horizontal) {
              this.snake.getValue().direction = Direction.RIGHT
              this.horizontal = !this.horizontal;
            }
            break;
          }
          case KEY.LEFT: {
            if(!this.horizontal) {
              this.snake.getValue().direction = Direction.LEFT
              this.horizontal = !this.horizontal;
            }
            break;
          }
        }
      }      
    }
  }

  play(){
    if(!this.isPlaying) {
      this.isPlaying = true;
      of(null, animationFrameScheduler)
      .pipe(
        tap(() => {
          if(!this.tick) {
            this.tick = 0;
          }
          if(this.tick > 6) {
            moveSnake(this.snake);
            this.mutex = false;
            this.tick = 0;
          }
          this.tick++;
        }),
        repeat(),
        takeUntil(this.unsubscribe),
      ).subscribe();
    }
  }
}