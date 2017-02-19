import { Injectable } from '@angular/core';
import { ShipComponent } from './ship.component';
import { BoardComponent } from './board.component';
import { BulletComponent } from './bullet.component';
import { EnemyComponent } from './enemy.component';
import { ShieldComponent } from './shield.component';

@Injectable()
export class ModelService {
    public ship: ShipComponent;
    public board: BoardComponent;
    public bullets: BulletComponent[] = [];
    public enemies: EnemyComponent[] = [];
    public shields: ShieldComponent[] = [];
    private nextAppId: number = 1;
    public gameover: boolean = false;
    public pause: boolean = false;
    public allIntervals: any[] = [];
    public CONSTS: any;
    public enemiesAdded: number = 0;
    public showCenterLabel: boolean = false;
    public centerLabelText: string;

    constructor() {
        this.CONSTS = process.env.CONSTS;
        (<any>window).t = this;
        let level = this.CONSTS.game.level = +localStorage.getItem('level') || 1;
        let maxLevel = +localStorage.getItem('maxLevel') || 1;
        if (level > maxLevel) {
            localStorage.setItem('maxLevel', level + '');
        }
        this.CONSTS.enemy.moveInterval -= level * 15; // every level they are faster
        this.CONSTS.game.extraLevelEnemies = level; // every level we add more enemies
        this.CONSTS.ship.bulletSpeed -= Math.floor(level * 2); // every level you can shot slightly faster
        this.CONSTS.enemy.shootInteval -= level * 100; // every level the enemy shoots more often 
        this.CONSTS.game.enemiesInLevel = this.CONSTS.game.level1Enemies + this.CONSTS.game.extraLevelEnemies;
        // if (level % 2) {
        //     this.CONSTS.enemy.enemiesThatShootEachInterval += Math.ceil(level / 2);
        // } else {
        //     this.CONSTS.enemy.enemiesThatShootEachInterval += Math.floor(level / 2);
        // }
        // console.log('bef:', this.CONSTS.enemy.enemiesThatShootEachInterval);
        this.CONSTS.enemy.enemiesThatShootEachInterval = level;
        // console.log('aft:', this.CONSTS.enemy.enemiesThatShootEachInterval);

        // so the game doesn't become unplayable because the level
        if (this.CONSTS.enemy.moveInterval < this.CONSTS.enemy.minimumMoveInterval) {
            this.CONSTS.enemy.moveInterval = this.CONSTS.enemy.minimumMoveInterval;
        }

        if (this.CONSTS.enemy.shootInteval < this.CONSTS.enemy.minimumShootInteval) {
            this.CONSTS.enemy.shootInteval = this.CONSTS.enemy.minimumShootInteval;
        }

        if (this.CONSTS.enemy.enemiesThatShootEachInterval > this.CONSTS.enemy.maxNumOfEnemiesThatShootEachInterval) {
            this.CONSTS.enemy.enemiesThatShootEachInterval = this.CONSTS.enemy.maxNumOfEnemiesThatShootEachInterval;
        }

        if (this.CONSTS.ship.bulletSpeed < this.CONSTS.ship.minBulletSpeed) {
            this.CONSTS.ship.bulletSpeed = this.CONSTS.ship.minBulletSpeed;
        }
    }

    public getNextAppId() {
        return this.nextAppId++;
    }
}