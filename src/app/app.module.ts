import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { ShipComponent } from './ship.component';
import { BoardComponent } from './board.component';
import { BulletComponent } from './bullet.component';
import { EnemyComponent } from './enemy.component';
import { ShieldComponent } from './shield.component';
import { ModelService } from './model.service';
@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    AppComponent,
    ShipComponent,
    BoardComponent,
    BulletComponent,
    EnemyComponent,
    ShieldComponent,
  ],
  bootstrap: [AppComponent],
  providers: [
    ModelService,
  ],
})
export class AppModule { }
