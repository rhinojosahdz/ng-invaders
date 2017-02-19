import { Component } from '@angular/core';

import { ModelService } from './model.service';
import * as _ from 'lodash';

@Component({
    selector: 'ship',
    templateUrl: 'ship.component.html',
    styleUrls: ['ship.component.scss']
})
export class ShipComponent {
    public CONSTS: any;
    public x: number;
    public y: number = 0;
    public destroyed: boolean = false;
    constructor(
        public modelService: ModelService
    ) {
        this.modelService.ship = this;
        this.x = Math.floor(this.modelService.CONSTS.board.width / 2 - (this.modelService.CONSTS.ship.width / 2)); // make sure we get a integer value, not decimal
    }

    public shoot() {
        if (_.filter(this.modelService.bullets, { fromShip: true }).length < this.modelService.CONSTS.ship.maxNumOfBullets) {
            this.modelService.bullets.push(<any>{ fromShip: true, id: this.modelService.getNextAppId(), x: this.modelService.ship.x });
        }
    }

    public moveLeft() {
        this.x -= 1;
    }

    public moveRight() {
        this.x += 1;
    }

    public gotHit() {
        // TODO shield and lives ?
        this.destroyed = true;
        
        /**
         * we need to do this so that the gif plays again, 
         * otherwise the browser cache's the gif and doesn't 
         * play again which is why using binding doesn't work,
         * this may be bad for a webpage
         */
        document.getElementById("ship").style.backgroundImage = `url('assets/small-explosion-loop-once.gif?${Math.random()}')`;
        this.modelService.board.gameover();
    }
}
