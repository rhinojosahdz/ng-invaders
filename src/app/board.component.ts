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

    constructor(
        public modelService: ModelService,
    ) {
        this.modelService.board = this;
    }

    public startGame() {
        // in case it's a retry we need to set the image of the ship again (it may be a explosion)
        document.getElementById("ship").style.backgroundImage = `url('assets/ship.png')`;
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
                let numOfTimesThisShipWillMove: number = idx * this.modelService.CONSTS.enemy.width;
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

    public restart() {
        if (!this.modelService.gameover) { // if it's gameover I already cleared the intervals
            this.clearAllIntervals();
        }
        this.modelService.startGame();
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
                clearInterval(this.modelService.pressingDownInterval.left.interval);
                if (this.modelService.pressingDownInterval.left.running) {
                    this.modelService.pressingDownInterval.left.running = false;
                    return;
                }
                if (this.modelService.gameover && this.modelService.canInteractAfterGameover && this.modelService.CONSTS.game.level > 1) {
                    let nextLevel = --this.modelService.CONSTS.game.level;
                    localStorage.setItem('level', nextLevel + '');
                    this.restart();
                }
                break;
            case 'ArrowRight':
                clearInterval(this.modelService.pressingDownInterval.right.interval);
                if (this.modelService.pressingDownInterval.right.running) {
                    this.modelService.pressingDownInterval.right.running = false;
                    return;
                }
                if (this.modelService.gameover && this.modelService.canInteractAfterGameover && this.modelService.nextLevelAlreadyCleared) {
                    localStorage.setItem('level', ++this.modelService.CONSTS.game.level + '');
                    this.restart();
                }
                break;
            case ' ':
                if (this.modelService.gameover && this.modelService.canInteractAfterGameover) {
                    this.restart();
                } else {
                    if (this.modelService.gameover || !this.modelService.shipStartedChargingSuperBullet) { // this.modelService.shipStartedChargingSuperBullet could be null/undefined if it's a retry
                        return;
                    }
                    let timeChargingSuperBullet = new Date().getTime() - this.modelService.shipStartedChargingSuperBullet.getTime();
                    // console.log(timeChargingSuperBullet);
                    const superBullet = timeChargingSuperBullet > this.modelService.CONSTS.ship.timeItTakesToShootSuperBullet;
                    this.modelService.shipChargingSuperBullet = false;
                    this.modelService.ship.shoot(superBullet);
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
                if (this.modelService.pressingDownInterval.left.running) {
                    return;
                } else {
                    this.modelService.pressingDownInterval.left.running = true;
                    let interval = setInterval(() => {
                        if (ship.x > 0) {
                            this.modelService.ship.moveLeft();
                        }
                    }, 30);
                    this.modelService.pressingDownInterval.left.interval = interval;
                    this.modelService.allIntervals.push(interval);
                }
                break;
            case 'ArrowRight':
                if (this.modelService.pressingDownInterval.right.running) {
                    return;
                } else {
                    this.modelService.pressingDownInterval.right.running = true;
                    let interval = setInterval(() => {
                        if ((ship.x + this.modelService.CONSTS.ship.width) < this.modelService.CONSTS.board.width) {
                            this.modelService.ship.moveRight();
                        }
                    }, 30);
                    this.modelService.pressingDownInterval.right.interval = interval;
                    this.modelService.allIntervals.push(interval);
                }
                break;
            case 'Space':
                if (this.modelService.gameover) {
                    return;
                }
                if (this.modelService.shipChargingSuperBullet) {
                    return;
                }
                this.modelService.shipChargingSuperBullet = true;
                this.modelService.shipStartedChargingSuperBullet = new Date();
                break;
        }
    }

    public gameover() {
        this.modelService.gameover = true;
        this.clearAllIntervals();
        this.modelService.showCenterLabel = true;
        this.modelService.centerLabelText = '<b>GAMEOVER</b><br>';
        setTimeout(() => {
            let maxLevel = +localStorage.getItem('maxLevel') || 1;
            this.modelService.nextLevelAlreadyCleared = maxLevel > this.modelService.CONSTS.game.level;
            setTimeout(() => {
                this.modelService.centerLabelText += `<b>
                 Shoot: retry<br><b/>`;
                if (this.modelService.CONSTS.game.level > 1) {
                    this.modelService.centerLabelText += '<b>Left: prev level<br></b>';
                }
                if (this.modelService.nextLevelAlreadyCleared) {
                    this.modelService.centerLabelText += `<b>
                    Right: next level<br></b>`;
                }
                this.modelService.canInteractAfterGameover = true;
            }, this.modelService.CONSTS.game.timeoutAfterGameover)
        }, this.modelService.CONSTS.game.timeoutAfterGameover);
    }

    public clearAllIntervals() {
        _.each(this.modelService.allIntervals, i => {
            try {
                // if (i._state !== 'scheduled' && i.runCount !== 0) { // if the interval has this values then I get an exception (length of undefined)
                // for some reason I get an exception when tring to clear some intervals                    
                clearInterval(i);
                // }
            } catch (e) {
                // debugger;
            }
        });
    }

}
