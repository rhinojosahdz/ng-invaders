// REMEMBER TO RUN npm start AGAIN AFTER MODIFYING THIS FILE // TODO add watcher so webpack takes care of this
let level = 1;
let m = 1;
let gray = '#F5F5F5';
let obj = {
    game: {
        bulletSpeed: 20,
        level: undefined, // int
        enemiesInLevel: undefined, // int
        extraLevelEnemies: undefined, // int
        level1Enemies: 2,
        timeoutAfterGameover: 2000,
    },
    board: {
        width: 60, // 320,
        height: 80, // 400,
        backgroundColor: 'black',
    },
    ship: {
        width: 11 * m,
        height: 5 * m,
        maxNumOfBullets: 1,
        bulletSpeed: 25,
        minBulletSpeed: 10,
    },
    enemy: {
        width: 10 * m,
        height: 6 * m,
        moveInterval: 100, // gets modified by level
        bulletSpeed: 40,
        minimumMoveInterval: 35, // if level gets too high
        shootInteval: 2000, // gets modifies by level
        minimumShootInteval: 400, // gets modifies by level
        enemiesThatShootEachInterval: 0, // gets modified by level
        maxNumOfEnemiesThatShootEachInterval: 7, // if level gets too high
    },
    bullet: {
        width: 1 * m,
        height: 5 * m,
    },
    shield: {
        width: 7 * m,
        height: 5 * m,
        color: 'red',
        startingY: undefined, // int
    },
    $replace_bodyBackgroundColor: 'black',
};

// calculated values
obj.shield.startingY = Math.floor(obj.ship.height * 1.5);

let allGray = false;
if (allGray) {
    obj.board.width = 60;
    obj.board.height = 80;
    obj.board.backgroundColor = gray;
    obj.shield.color = gray;
}
module.exports = obj;