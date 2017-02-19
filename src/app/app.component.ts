import { Component, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';
@Component({
    selector: 'my-app',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
    constructor() {
        // responsive web design (works in browser, see if it works in cordova)
        let CONSTS = process.env.CONSTS;        
        var pageWidth = CONSTS.board.width;
        var pageHeight = CONSTS.board.height;
        var windowWidth = window.innerWidth,
            newScaleWidth = windowWidth / pageWidth;
        var windowHeight = window.innerHeight,
            newScaleHeight = windowHeight / pageHeight;
        var newZoom = Math.min(newScaleWidth, newScaleHeight);
        (<any>document).body.style.zoom = Math.floor(newZoom);
    }
}
