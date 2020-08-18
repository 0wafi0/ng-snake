import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameOverDialogComponent } from './game-over-dialog/game-over-dialog.component';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    GameOverDialogComponent
  ],
  imports: [
    MatDialogModule,
    BrowserModule,
    BrowserAnimationsModule
  ],
  providers: [{
    provide: MatDialogRef,
    useValue: {},
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
