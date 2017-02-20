import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';

import { ModelService } from './model.service';

@Component({
    selector: 'enemy',
    templateUrl: 'enemy.component.html',
    styleUrls: ['enemy.component.scss']
})
export class EnemyComponent implements OnInit {
    @Input()
    public model: EnemyComponent;
    public CONSTS: any;
    public x: number;
    public y: number;
    public id: number;
    public component: EnemyComponent;
    public movingLeft: boolean = true;
    public movingDown: boolean = false;
    public movingDownCounter: number = 0;
    private moveDownSteps: number = 10;
    public shootInterval: any;
    public moveInterval: any;
    public type = _.random(1, 4); // there can be 4 types, depending the type dependes how fast it's bullet goes
    constructor(
        public modelService: ModelService
    ) {
    }

    public ngOnInit() {
        this.model.component = this;
        this.id = this.model.id;
        this.y = this.modelService.CONSTS.board.height - this.modelService.CONSTS.enemy.height;
        this.x = this.modelService.CONSTS.board.width - this.modelService.CONSTS.enemy.width;
        this.modelService.allIntervals.push(this.moveInterval = setInterval(() => {
            this.move();
        }, this.modelService.CONSTS.enemy.moveInterval));
    }

    public move() {
        if (this.y < this.modelService.CONSTS.ship.width) {
            this.modelService.board.removeShields();
            this.modelService.board.gameover();
            return;
        } else {
            if (!this.movingDown) {
                if (this.movingLeft) {
                    this.x--;
                } else {
                    this.x++;
                }
            }
            if ((this.x + this.modelService.CONSTS.enemy.width) >= this.modelService.CONSTS.board.width) {
                this.moveDown();
                if (this.movingDown) {
                    this.movingLeft = true;
                }
                return;
            }
            if (this.x <= 0) {
                this.moveDown();
                if (this.movingDown) {
                    this.movingLeft = false;
                }
                return;
            }
        }
    }

    public moveDown() {
        this.movingDown = true;
        if (this.movingDownCounter >= this.moveDownSteps) {
            this.movingDown = false;
            this.movingDownCounter = 0;
        } else {
            this.y -= 1;
            this.movingDownCounter++;
        }
    }

    public destroy() {
        let enemies = this.modelService.enemies;
        _.pull(enemies, _.find(enemies, { id: this.id }));
    }

    public shoot() {
        // @here enemy.css bottom doesn't work? | clearIntervals on destroy!
        let x = this.x, y = this.y;
        this.modelService.bullets.push(<any>{ fromShip: false, id: this.modelService.getNextAppId(), x: this.x, y: this.y, enemyThatShoot: this, super: this.type === 4 });
    }

    public ngOnDestroy() {
        clearInterval(this.shootInterval);
        clearInterval(this.moveInterval);
        // console.log('enemy gone');
        if (this.modelService.enemies.length === 0 && this.modelService.CONSTS.game.enemiesInLevel <= this.modelService.enemiesAdded) {
            localStorage.setItem('level', ++this.modelService.CONSTS.game.level + '');
            location.reload();
        }
    }
}
