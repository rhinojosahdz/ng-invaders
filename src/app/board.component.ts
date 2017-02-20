import { Component, HostListener } from '@angular/core';

import { ModelService } from './model.service';
import * as _ from 'lodash';

@Component({
    selector: 'board',
    templateUrl: 'board.component.html',
    styleUrls: ['board.component.scss'],
})
export class BoardComponent {
    public CONSTS: any;
    private nextLevelAlreadyCleared: boolean = false;
    private canInteractAfterGameover: boolean = false;

    constructor(
        public modelService: ModelService,
    ) {
        this.modelService.board = this;

        this.enemiesStartShooting();

        this.addShields();

        // this.setEnemiesStartingPosition();
        this.modelService.showCenterLabel = true;
        this.modelService.centerLabelText = `LEVEL ${this.modelService.CONSTS.game.level}`;
        setTimeout(() => {
            this.modelService.showCenterLabel = false;
            this.startAddEnemiesInterval();
        }, 2000);
    }

    private startAddEnemiesInterval() {
        const addShipInterval = this.modelService.CONSTS.enemy.moveInterval * this.modelService.CONSTS.enemy.width * 2;
        let addEnemiesInterval = setInterval(() => {
            setTimeout(() => {
                if (this.modelService.gameover) {
                    return;
                }
                if (this.modelService.CONSTS.board.maxNumberOfEnemies !== -1 && this.modelService.CONSTS.board.maxNumberOfEnemies <= this.modelService.enemies.length) {
                    return;
                }
                this.modelService.enemies.push(<any>{ id: this.modelService.getNextAppId() });
                this.modelService.enemiesAdded++;
                if (this.modelService.enemiesAdded >= this.modelService.CONSTS.game.enemiesInLevel) {
                    clearInterval(addEnemiesInterval);
                }
            }, _.random(addShipInterval * .5 * (_.random(1, 15) / 10))); // some random timeout to make the gap between enemies slightly different
        }, addShipInterval)
        this.modelService.allIntervals.push(addEnemiesInterval);
    }

    /**
     *  this function makes it a little more like the real Space Invaders
     */
    private setEnemiesStartingPosition() {
        this.addEnemies();
        // numOfTimesThisShipWillMove needs adjustments
        setTimeout(() => {
            _.each(this.modelService.enemies, (e, idx) => {
                let numOfTimesThisShipWillMove = (idx * this.modelService.CONSTS.enemy.width);
                for (let i = 0; i < numOfTimesThisShipWillMove; i++) {
                    e.component.move();
                    // console.log('MOVED');
                }
                for (let i = 0; i < 100; i++) {
                    e.component.move();
                }
            });
        }, 100); // we wait a little for the enemy ngOnInit to run
    }

    public retry() {
        location.reload();
    }

    private addEnemies() {
        const numberOfEnemies = 3;
        for (let i = 0; i < numberOfEnemies; i++) {
            this.modelService.enemies.push(<any>{ id: this.modelService.getNextAppId() });
        }
    }

    private enemiesStartShooting() {
        this.modelService.allIntervals.push(setInterval(() => {
            if (this.modelService.CONSTS.bullet.maxNumOfEnemyBulletsInBoard != -1 && this.modelService.CONSTS.bullet.maxNumOfEnemyBulletsInBoard <= this.modelService.bullets.length) {
                return;
            }
            let numberOfEnemiesThatWillShoot = this.modelService.CONSTS.enemy.enemiesThatShootEachInterval;
            if (this.modelService.enemies.length <= this.modelService.CONSTS.enemy.enemiesThatShootEachInterval) {
                numberOfEnemiesThatWillShoot = this.modelService.enemies.length;
            }
            let enemiesThatShoot: number[] = [];
            while (true) {
                if (enemiesThatShoot.length >= numberOfEnemiesThatWillShoot) {
                    break;
                }
                let randomEnemy = _.sample(this.modelService.enemies);
                if (!_.includes(enemiesThatShoot, randomEnemy.id)) {
                    randomEnemy.component.shoot();
                    enemiesThatShoot.push(randomEnemy.id);
                }
            }
        }, this.modelService.CONSTS.enemy.shootInteval));
    }

    private addShields() {
        for (let i = 0; i < 3; i++) {
            let startX = this.modelService.shields.length * (this.modelService.CONSTS.board.width / 3);
            let shieldPadding = Math.floor(((this.modelService.CONSTS.board.width / 3) - this.modelService.CONSTS.shield.width) / 2);
            let x = startX + shieldPadding;
            this.modelService.shields.push(<any>{ id: this.modelService.getNextAppId(), x: x });
        }
    }

    public removeShields() {
        this.modelService.shields = [];
    }

    private pressingDownInterval = {
        left: { running: false, interval: <any>undefined },
        right: { running: false, interval: <any>undefined },
    }

    @HostListener('document:touchstart', ['$event'])
    touchstart(event: TouchEvent) {
        let x = event.touches[0].clientX; // / (<any>document).body.style.zoom;
        let section = screen.width / 3; //this.modelService.CONSTS.board.width / 3;
        if (x < section) {
            this.onKeyDown('ArrowLeft');
        }
        if (x > section * 2) {
            this.onKeyDown('ArrowRight');
        }
        if (x > section && x < (section * 2)) {
            this.onKeyDown('Space');
        }
    }

    @HostListener('document:touchend', ['$event'])
    touchend(event: TouchEvent) {
        let x = event.changedTouches[0].clientX; // / (<any>document).body.style.zoom;
        let section = screen.width / 3; //this.modelService.CONSTS.board.width / 3;
        if (x < section) {
            this.onKeyUp('ArrowLeft');
        }
        if (x > section * 2) {
            this.onKeyUp('ArrowRight');
        }
        if (x > section && x < (section * 2)) {
            this.onKeyUp(' ');
        }
    }


    @HostListener('document:keyup', ['$event'])
    keyup(event: KeyboardEvent) {
        let key = event.key;
        this.onKeyUp(key);
    }

    public onKeyUp(key: string) {
        switch (key) {
            case 'ArrowLeft':
                clearInterval(this.pressingDownInterval.left.interval);
                if (this.pressingDownInterval.left.running) {
                    this.pressingDownInterval.left.running = false;
                    return;
                }
                if (this.modelService.gameover && this.canInteractAfterGameover && this.modelService.CONSTS.game.level > 1) {
                    let nextLevel = --this.modelService.CONSTS.game.level;
                    localStorage.setItem('level', nextLevel + '');
                    this.retry();
                }
                break;
            case 'ArrowRight':
                clearInterval(this.pressingDownInterval.right.interval);
                if (this.pressingDownInterval.right.running) {
                    this.pressingDownInterval.right.running = false;
                    return;
                }
                if (this.modelService.gameover && this.canInteractAfterGameover && this.nextLevelAlreadyCleared) {
                    localStorage.setItem('level', ++this.modelService.CONSTS.game.level + '');
                    this.retry();
                }
                break;
            case ' ':
                if (this.modelService.gameover && this.canInteractAfterGameover) {
                    this.retry();
                }
                break;
        }
    }

    @HostListener('document:keypress', ['$event'])
    keypress(event: KeyboardEvent) {
        let key = event.code;
    }

    @HostListener('document:keydown', ['$event'])
    keydown(event: KeyboardEvent) {
        let key = event.code;
        this.onKeyDown(key);
    }

    public onKeyDown(key: string) {
        if (this.modelService.gameover) {
            return;
        }
        let ship = this.modelService.ship;
        switch (key) {
            case 'ArrowLeft':
                if (this.pressingDownInterval.left.running) {
                    return;
                } else {
                    this.pressingDownInterval.left.running = true;
                    let interval = setInterval(() => {
                        if (ship.x > 0) {
                            this.modelService.ship.moveLeft();
                        }
                    }, 30);
                    this.pressingDownInterval.left.interval = interval;
                    this.modelService.allIntervals.push(interval);
                }
                break;
            case 'ArrowRight':
                if (this.pressingDownInterval.right.running) {
                    return;
                } else {
                    this.pressingDownInterval.right.running = true;
                    let interval = setInterval(() => {
                        if ((ship.x + this.modelService.CONSTS.ship.width) < this.modelService.CONSTS.board.width) {
                            this.modelService.ship.moveRight();
                        }
                    }, 30);
                    this.pressingDownInterval.right.interval = interval;
                    this.modelService.allIntervals.push(interval);
                }
                break;
            case 'Space':
                this.modelService.ship.shoot();
                break;
        }
    }

    public gameover() {
        // for some reason I get an exception when tring to clear some intervals
        _.each(this.modelService.allIntervals, i => { try { clearInterval(i); } catch (e) { } });
        this.modelService.gameover = true;
        this.modelService.showCenterLabel = true;
        this.modelService.centerLabelText = '<b>GAMEOVER</b><br>';
        setTimeout(() => {
            let maxLevel = +localStorage.getItem('maxLevel') || 1;
            this.nextLevelAlreadyCleared = maxLevel > this.modelService.CONSTS.game.level;
            setTimeout(() => {
                this.modelService.centerLabelText += `<b>
                 Shoot: retry<br><b/>`;
                if (this.modelService.CONSTS.game.level > 1) {
                    this.modelService.centerLabelText += '<b>Left: prev level<br></b>';
                }
                if (this.nextLevelAlreadyCleared) {
                    this.modelService.centerLabelText += `<b>
                    Right: next level<br></b>`;
                }
                this.canInteractAfterGameover = true;
            }, this.modelService.CONSTS.game.timeoutAfterGameover)
        }, this.modelService.CONSTS.game.timeoutAfterGameover);
    }

}
