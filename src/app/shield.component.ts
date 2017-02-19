import { Component, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { ModelService } from './model.service';

@Component({
    selector: 'shield',
    templateUrl: 'shield.component.html',
    styleUrls: ['shield.component.scss']
})
export class ShieldComponent implements OnInit {
    @Input()
    public model: ShieldComponent;
    public CONSTS: any;
    public x: number;
    public y: number;
    public id: number;
    public component: ShieldComponent;
    public rows: { cols: { destroyed: boolean }[] }[] = [];
    constructor(
        public modelService: ModelService
    ) {
        this.y = this.modelService.CONSTS.shield.startingY;
        // starts from the top
        let center = Math.floor(this.modelService.CONSTS.shield.width / 2);
        let gapBothSidesPivotingFromCenter = Math.floor(this.modelService.CONSTS.shield.width / 4);
        for (let i = 0; i < this.modelService.CONSTS.shield.height; i++) {
            this.rows.push({ cols: [] });
            let newRow = this.rows[i];
            for (let j = 0; j < this.modelService.CONSTS.shield.width; j++) {
                // not sure why the _.inRange needs a + 1 + but it works, this makes the gap in the center of the shield no matter the width of the shield
                let destroyed = i > ((this.modelService.CONSTS.shield.height / 2)) && _.inRange(j, center - gapBothSidesPivotingFromCenter, center + 1 + gapBothSidesPivotingFromCenter);
                newRow.cols.push({ destroyed: destroyed });
            }
        }
    }

    /**
     * @returns true if a pixel got removed (if shield actually got hit)
     */
    public removePixel(colIdx: number, fromShip: boolean): boolean {
        let tmp = (rowIdx: number, fromTop: boolean) => {
            let col = this.rows[rowIdx].cols[colIdx];
            if (!col.destroyed) {
                col.destroyed = true;

                let createTriangle = () => {
                    if (fromTop) {
                        this.rows[rowIdx + 1].cols[colIdx].destroyed = true;
                    } else {
                        this.rows[rowIdx - 1].cols[colIdx].destroyed = true;
                    }
                    this.rows[rowIdx].cols[colIdx + 1].destroyed = true;
                    this.rows[rowIdx].cols[colIdx - 1].destroyed = true;
                }
                // createTriangle(); // TODO needs work

                return true;
            }
            return false;
        };
        if (!fromShip) {
            for (let i = 0; i < this.modelService.CONSTS.shield.height; i++) {
                if (tmp(i, true)) {
                    return true;
                }
            }
        } else {
            for (let i = this.modelService.CONSTS.shield.height - 1; i > -1; i--) {
                if (tmp(i, false)) {
                    return true;
                }
            }
        }
        return false;
    }

    public ngOnInit() {
        this.model.component = this;
        this.id = this.model.id;
        this.x = this.model.x;
    }
}
