import { ISnake, ICoordinates, Direction } from './models';
import { BehaviorSubject, Subject } from 'rxjs';
import { map, tap , takeUntil } from 'rxjs/operators';
import { RENDER_BLOCK } from './constants';
import { GameOverDialogComponent } from './game-over-dialog/game-over-dialog.component';
import * as _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';

export function generateDefaultSnake(ctx: CanvasRenderingContext2D) {
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
    
    snakeDefault.food = {...spawnFood(snakeDefault, ctx)};
    snakeDefault.direction = Direction.RIGHT;
    return new BehaviorSubject(snakeDefault);
  }

  export function snakeLoopInit(snakeSub: BehaviorSubject<ISnake>, ctx: CanvasRenderingContext2D,
    dialog: MatDialog, unsubscribe: Subject<void>, restart: Subject<void>) {
    snakeSub.pipe(
      map(snake => {
        if(JSON.stringify(snake.current) !== JSON.stringify(snake.previous)){
          updateSnake(outOfBounds(snake, ctx), ctx, dialog, unsubscribe, snakeSub, restart);
        }
      return snake;
      }),
      tap(snake => drawSnakeAndFood(snake, ctx)),
      takeUntil(unsubscribe))
    .subscribe();
  }

  export function moveSnake(snake: BehaviorSubject<ISnake>) {
    const snakeValue = snake.getValue();
    switch (snakeValue.direction) {
      case Direction.RIGHT: {
        snakeValue.current[0].x++;
        break;
      }
      case Direction.LEFT: {
        snakeValue.current[0].x--;
        break;
      }
      case Direction.UP: {
        snakeValue.current[0].y--;
        break;
      }
      case Direction.DOWN: {
        snakeValue.current[0].y++;
        break;
      }
    }
    snake.next(snakeValue);
}

  function outOfBounds(snake: ISnake, ctx: CanvasRenderingContext2D) {
    if(snake.current[0].x * RENDER_BLOCK >= ctx.canvas.width && snake.direction === Direction.RIGHT) {
      snake.current[0].x = 0;
    }
    if(snake.current[0].x < 0 && snake.direction === Direction.LEFT) {
      snake.current[0].x = (ctx.canvas.width/RENDER_BLOCK - 1);
    }

    if(snake.current[0].y * RENDER_BLOCK >= ctx.canvas.height && snake.direction === Direction.DOWN) {
      snake.current[0].y = 0;
    }
    if(snake.current[0].y < 0 && snake.direction === Direction.UP) {
      snake.current[0].y = (ctx.canvas.height/RENDER_BLOCK - 1);
    }
    return snake;
  }


  function spawnFood(snake: ISnake, ctx: CanvasRenderingContext2D): ICoordinates {
    const coordinates = {
      x: Math.floor(Math.random() * (ctx.canvas.width/RENDER_BLOCK - 1)),
      y: Math.floor(Math.random() * (ctx.canvas.height/RENDER_BLOCK - 1))
    };
    return isCoordinateCollidingSnake(coordinates, snake) ?
    spawnFood(snake, ctx) : coordinates;
  }


 function updateSnake(snake: ISnake, ctx: CanvasRenderingContext2D, dialog: MatDialog, unsubscribe: Subject<void>, snakeSub: BehaviorSubject<ISnake>, restart: Subject<void>): boolean {
    if(isHeadColliding(snake.current[0], snakeSub)) {
      const dialogRef = dialog.open(GameOverDialogComponent, {
        width: '600px'
      });
      unsubscribe.next();
      dialogRef.afterClosed().subscribe(_result => {
        restart.next();
      });
    }

    if(_.isEqual(snake.current[0], snake.food)) {
      snake.current = _.cloneDeep(snake.previous);
      snake.current.unshift({...snake.food});
      snake.previous.unshift({...snake.food});
      snake.food = spawnFood(snake, ctx);
      return true;
    }
    snake.current.forEach((_snakeBit, index) => {
      if(index === 0) {
        return;
      }
      snake.current[index].x = snake.previous[index-1].x;
      snake.current[index].y = snake.previous[index-1].y;
    });
    snake.previous = _.cloneDeep(snake.current);
  }


function drawSnakeAndFood(snake: ISnake, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    snake.current.forEach((snakeBit) => {
      ctx.fillRect(snakeBit.x, snakeBit.y, 1, 1);
    });
    ctx.fillRect(snake.food.x, snake.food.y, 1, 1);
  }


function isCoordinateCollidingSnake(coordinates: ICoordinates, snake: ISnake): boolean {
    return !!snake.previous.find(item => item.x === coordinates.x &&  item.y === coordinates.y);
  }

function isHeadColliding(headCoordinates: ICoordinates, snakeSub: BehaviorSubject<ISnake>) : boolean {
    const snake = snakeSub.getValue();

    return !!snake.previous.find((item, index) => {
        if(index > 0) {
          return item.x === headCoordinates.x &&  item.y === headCoordinates.y;
        }
        return false;
      });
  }