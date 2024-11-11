import * as PIXI from 'pixi.js'
import { Assets } from '@pixi/assets';

(async () => {

    const app = new PIXI.Application({
        backgroundColor: 0x1099bb,
        width: 800, 
        height: 600 
    });

    const container = new PIXI.Container();
    
    document.getElementById('wrapper').appendChild(app.view);
    const totalEl = document.querySelector('.total-val'); 
    const freeSpinList = document.querySelector('.free-spin-list');

    const btnImage = await Assets.load('https://i.postimg.cc/tCGbSCGG/btnStart.png');
    const arrowImage = await Assets.load('https://i.postimg.cc/tCdjLQ9Z/arrow.png');

    const arrow = new PIXI.Sprite(arrowImage);
    const startBtn = new PIXI.Sprite(btnImage);

    const components = [arrow, startBtn];

    components.forEach(item => {
        item.anchor.set(0.5);
        item.x = app.screen.width / 2;
        item.y = app.screen.height / 2;
    });

    arrow.y = -5;

    startBtn.interactive = true;
    startBtn.buttonMode = true;

    let sectors = new PIXI.Graphics();
     
    const sectorsData = [
        {stopedOn: 14, value: '500', deg: 0, min: 246, max: 265},
        {stopedOn: 13, value: '1000', deg: 20, min: 226, max: 245},
        {stopedOn: 12, value: '200', deg: 40, min: 206, max: 225},
        {stopedOn: 11, value: '500', deg: 60, min: 186, max: 205},
        {stopedOn: 10, value: 'Free Spin', deg: 80, min: 166, max: 185},
        {stopedOn: 9, value: '100', deg: 100, min: 146, max: 165},
        {stopedOn: 8, value: '20', deg: 120, min: 126, max: 145},
        {stopedOn: 7, value: '500', deg: 140, min: 106, max: 125},
        {stopedOn: 6, value: '1000', deg: 160, min: 86, max: 105},
        {stopedOn: 5, value: '600', deg: 180, min: 66, max: 85},
        {stopedOn: 4, value: '800', deg: 200, min: 46, max: 65},
        {stopedOn: 3, value: '50', deg: 220, min: 25, max: 45},
        {stopedOn: 2, value: '250', deg: 240, min: 6, max: 25},
        {stopedOn: 1, value: '20', deg: 260, min: 356, max: 5},
        {stopedOn: 18, value: '100', deg: 280, min: 326, max: 345},
        {stopedOn: 17, value: '700', deg: 300, min: 306, max: 325},
        {stopedOn: 16, value: '400', deg: 320, min: 286, max: 305},
        {stopedOn: 15, value: '100', deg: 340, min: 266, max: 285},
    ];

    const sectorSize = 360 / 18;
    let threeSpinCounter = 0;

    for(let i = 0; i < 18; i++) {
        const deg_to_rag = PIXI.DEG_TO_RAD;
        sectors.beginFill((i & 1) ? 0x4287f5 : 0xdeac21);
        sectors.moveTo(0, 0);
        sectors.arc(0, 0, 300, deg_to_rag * (i * sectorSize), deg_to_rag * ((i + 1) * sectorSize));
        sectors.lineTo(0, 0);
        sectors.endFill();
        
        const text = new PIXI.Text(sectorsData[i].value, {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xffffff,
        });
        text.anchor.set(0.5, 0.5);
        text.x = Math.cos(deg_to_rag * (i * sectorSize + 10)) * 260;
        text.y = Math.sin(deg_to_rag * (i * sectorSize + 10)) * 260;
        sectors.addChild(text);
    }

    
    container.addChild(sectors);
    container.position.set(app.screen.width / 2, app.screen.height / 2);
    container.pivot.set(0.5, 0.5);

    app.stage.addChild(container, arrow, startBtn);

    startBtn.on('click', spin);

    let lastSectorData = {};
    function spin() {
        let click = false;
        diff = randomNum(2, 358);
        if(threeSpinCounter) {
            // prevent free spin on started 3 free spin roll
            diff = preventFallingSameSector(diff, 165, 186);
        }
        else {
            diff = preventFallingSameSector(diff, lastSectorData.min, lastSectorData.max);
        }
        let targetAngle = diff + 360 * 3;
        let currentAngle = 0;
        
        app.ticker.add(() => {
            if (currentAngle < targetAngle) {
                currentAngle += 5;
                sectors.rotation = PIXI.DEG_TO_RAD * currentAngle;
            }
            else {
                if(!click) {
                    identifySector(targetAngle);
                    click = true;
                }
            }
        });
    }

    function identifySector(targetAngle) {
        const finalAngle = sectors.rotation * (180 / Math.PI);
        const adjustedAngle = ((finalAngle % 360) + 360) % 360;
        let sector = Math.round(adjustedAngle / sectorSize);
        sector = sector > 17 ? 17 : sector;
        console.log(sector);
        const winObject = sectorsData.find(x => x.stopedOn === (sector + 1));
        lastSectorData = winObject;
        console.log(winObject);

        if(winObject.value !== 'Free Spin') {
            totalEl.textContent = +totalEl.textContent + +winObject.value;
            if(threeSpinCounter > 0 && threeSpinCounter <= 3) {
                const li = document.createElement('li');
                li.textContent = 'Prize: ' + winObject.value;
                freeSpinList.appendChild(li);
            }
        }
        if(threeSpinCounter > 0 && threeSpinCounter < 3 && winObject.value === 'Free Spin') {
            setTimeout(() => {
                spin();
            }, 1000);
            return;
        }
        if(threeSpinCounter >= 3) {
            threeSpinCounter = 0;
            return;
        }
        if(threeSpinCounter > 0) {
            threeSpinCounter += 1;
            setTimeout(() => {
                spin();
            }, 1000);
            return;
        }
        if(threeSpinCounter === 0 && winObject.value === 'Free Spin') {
            threeSpinCounter += 1;
            setTimeout(() => {
                spin();
            }, 1000);
        }
        
    }

    function randomNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    
    function preventFallingSameSector(diff, min, max) {
        if(diff > min && diff < max) {
            return preventFallingSameSector(randomNum(10, 349), min, max);
        }
        return diff;
    }

})();

