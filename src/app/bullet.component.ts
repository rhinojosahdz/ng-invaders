import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';

import { ModelService } from './model.service';
import { EnemyComponent } from './enemy.component';

@Component({
    selector: 'bullet',
    templateUrl: 'bullet.component.html',
    styleUrls: ['bullet.component.scss']
})
export class BulletComponent {
    @Input()
    public model: BulletComponent;
    public CONSTS: any;
    public id: number;
    public x: number;
    public y: number;
    public component: BulletComponent;
    public fromShip: boolean;
    public enemyThatShoot: EnemyComponent;
    public shootInterval: any;
    constructor(
        public modelService: ModelService
    ) {
    }

    public ngOnInit() {
        this.model.component = this;
        this.id = this.model.id;
        this.enemyThatShoot = this.model.enemyThatShoot;
        this.fromShip = this.model.fromShip;
        this.y = this.model.fromShip ? (0 + this.modelService.CONSTS.ship.height) : (this.model.y - this.modelService.CONSTS.ship.height);
        this.x = Math.floor(this.model.fromShip ? (this.model.x + (this.modelService.CONSTS.ship.width / 2)) : (this.model.x + (this.modelService.CONSTS.enemy.width / 2)));
        this.modelService.allIntervals.push(this.shootInterval = setInterval(() => {
            this.move();
            this.checkForCollision();
        }, this.fromShip ? this.modelService.CONSTS.ship.bulletSpeed : (this.modelService.CONSTS.enemy.bulletSpeed * this.enemyThatShoot.type)));
        // console.log('shoot:', this.enemyThatShoot && this.enemyThatShoot.type);
    }

    public move() {
        if (this.fromShip) {
            if (this.y < this.modelService.CONSTS.board.height) {
                this.moveUp();
            } else {
                this.destroy();
            }
        } else {
            if (this.y > 0) {
                this.moveDown();
            } else {
                this.destroy();
            }
        }
    }

    public moveUp() {
        this.y++;
    }

    public moveDown() {
        this.y--;
    }

    public checkForCollision() {
        let ship = this.modelService.ship;
        let b = this;
        let shieldGotHit = false;
        if (b.y < this.modelService.CONSTS.shield.startingY + this.modelService.CONSTS.bullet.height) { // FOR PERFORMANCE: only run the loop if bullet.y is inside shield.y area
            // console.log('running each');
            _.each(this.modelService.shields, s => {
                // we check if shield area got hit (x,y point may be destroyed tho)
                if (Math.abs(b.x - (s.component.x + (this.modelService.CONSTS.shield.width / 2))) <= this.modelService.CONSTS.shield.width / 2 && Math.abs(s.component.y - b.y) < this.modelService.CONSTS.bullet.height) {
                    let col = Math.abs(b.x - s.component.x);
                    shieldGotHit = s.component.removePixel(col, b.fromShip);
                    return !shieldGotHit;
                }
            });
            if (shieldGotHit) {
                b.destroy();
                return false;
            }
        }
        // TODO improve y axis collision detection (just like with did with axis x)
        if (b.fromShip) {
            _.each(this.modelService.enemies, e => {
                if (Math.abs(b.x - (e.component.x + (this.modelService.CONSTS.enemy.width / 2))) <= this.modelService.CONSTS.enemy.width / 2 && Math.abs(e.component.y - b.y) < this.modelService.CONSTS.bullet.height) {
                    b.destroy();
                    e.component.destroy();
                }
            });
        } else {
            if (Math.abs(b.x - (ship.x + (this.modelService.CONSTS.ship.width / 2))) <= this.modelService.CONSTS.ship.width / 2 && Math.abs(b.y - ship.y) < this.modelService.CONSTS.bullet.height) {
                this.modelService.ship.gotHit();
                b.destroy();
                return false;
            }
        }
    }

    public destroy() {
        let bullets = this.modelService.bullets;
        _.pull(bullets, _.find(bullets, { id: this.id }));
    }

    public ngOnDestroy() {
        clearInterval(this.shootInterval);
        // console.log('bullet gone');
    }
}
