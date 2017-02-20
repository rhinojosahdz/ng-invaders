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
        this.y = this.model.fromShip ? 0 : (this.model.y - this.modelService.CONSTS.ship.height);
        this.x = Math.floor(this.model.fromShip ? (this.model.x + (this.modelService.CONSTS.ship.width / 2)) : (this.model.x + (this.modelService.CONSTS.enemy.width / 2)));
        this.shootInterval = setInterval(() => {
            this.move();
            this.checkForCollision();
        }, this.fromShip ? this.modelService.CONSTS.ship.bulletSpeed : (this.modelService.CONSTS.enemy.bulletSpeed * this.enemyThatShoot.type))
        this.modelService.allIntervals.push(this.shootInterval);
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

    public c = this.modelService.CONSTS;
    public shieldsStartY = this.modelService.shields[0].component.y + this.c.shield.height - 1; // -1 to avoid using <=
    public shieldsEndY = this.modelService.shields[0].component.y - 2; // -2 to avoid using >=
    public checkForCollision() {
        let ship = this.modelService.ship;
        let b = this;
        const y = b.y + this.c.bullet.height - 1; // -1 to avoid using >=
        if (this.fromShip) {
            if (!this.checkIfShieldGotHit(b, b.y + this.c.bullet.height)) {
                const fe = this.modelService.enemies[0]; // first enemy, it will always be the/or-one of the closest to the ship
                if (fe) { // if there's at least an enemy
                    const enemiesStartY = fe.component.y; // - this.c.enemy.height;
                    if (y > enemiesStartY) {
                        const le = _.last(this.modelService.enemies); // last enemy
                        const enemiesEndY = le.component.y + this.c.enemy.height;
                        if (y < enemiesEndY) {
                            _.each(this.modelService.enemies, e => {
                                const enemyStartsX = e.component.x;
                                const enemyEndsX = enemyStartsX + this.c.enemy.width;
                                const enemyStartsY = e.component.y;
                                const enemyEndsY = enemyStartsY + this.c.enemy.height;
                                if (_.inRange(b.x, enemyStartsX, enemyEndsX) && _.inRange(y, enemyStartsY, enemyEndsY)) {
                                    b.destroy();
                                    e.component.destroy();
                                }
                            });
                        }
                    }
                }
            }
        } else {
            if (!this.checkIfShieldGotHit(b, b.y)) {
                if (y < this.shieldsStartY) {
                    const shipStartsX = this.modelService.ship.x;
                    const shipEndsX = shipStartsX + this.c.ship.width;
                    if (_.inRange(b.x, shipStartsX, shipEndsX)) {
                        this.modelService.ship.gotHit();
                        b.destroy();
                        return true;
                    }
                }
            }
        }
    }

    public checkIfShieldGotHit(b: BulletComponent, y: number): boolean {
        let shieldGotHit = false;
        if (y < this.shieldsStartY) { // _.inRange(y, shieldStarts, shipEnds) no need to use this because after `shipEnds` the board ends
            if (y > this.shieldsEndY) { // _.inRange(y, shieldStarts, shieldEnds)
                _.each(this.modelService.shields, s => {
                    const shieldStartsX = s.x;
                    const shieldEndsX = s.x + this.c.shield.width;
                    if (_.inRange(b.x, shieldStartsX, shieldEndsX)) {
                        shieldGotHit = s.component.removePixel(Math.abs(b.x - s.component.x), b.fromShip);
                        return !shieldGotHit;
                    }
                });
                if (shieldGotHit) {
                    b.destroy();
                    return true;
                }
            }
        }
        return shieldGotHit;
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
