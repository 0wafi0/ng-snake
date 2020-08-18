

export class ISnake {
    previous: ICoordinates[] = [];
    current: ICoordinates[] = [];
    food: ICoordinates;
    direction: Direction
}

export interface ICoordinates {
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