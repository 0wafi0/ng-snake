import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-game-over-dialog',
  templateUrl: './game-over-dialog.component.html',
  styleUrls: ['./game-over-dialog.component.scss']
})
export class GameOverDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<GameOverDialogComponent>
    ) {}
  
  
  onClick(): void {
    this.dialogRef.close();
  }
}




