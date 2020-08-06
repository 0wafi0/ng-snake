export interface ITime{
    start: number;
    elapsed: number;
}

export interface ISnake {
        x: number;
        y: number;
}

export enum Direction {
    LEFT,
    RIGHT,
    UP,
    DOWN
}

export class KEY {
    static readonly LEFT = 37;
    static readonly RIGHT = 39;
    static readonly DOWN = 40;
    static readonly UP = 38;
  }