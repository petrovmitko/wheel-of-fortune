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
        {stopedOn: 14, value: '500', deg: 0},
        {stopedOn: 13, value: '1000', deg: 20},
        {stopedOn: 12, value: '200', deg: 40},
        {stopedOn: 11, value: '500', deg: 60},
        {stopedOn: 10, value: 'Free Spin', deg: 80},
        {stopedOn: 9, value: '100', deg: 100},
        {stopedOn: 8, value: '20', deg: 120},
        {stopedOn: 7, value: '500', deg: 140},
        {stopedOn: 6, value: '1000', deg: 160},
        {stopedOn: 5, value: '600', deg: 180},
        {stopedOn: 4, value: '800', deg: 200},
        {stopedOn: 3, value: '50', deg: 220},
        {stopedOn: 2, value: '250', deg: 240},
        {stopedOn: 1, value: '20', deg: 260},
        {stopedOn: 18, value: '100', deg: 280},
        {stopedOn: 17, value: '700', deg: 300},
        {stopedOn: 16, value: '400', deg: 320},
        {stopedOn: 15, value: '100', deg: 340},
    ];

    const sectorSize = 360 / 18;

    for(let i = 0; i < 18; i++) {
        const deg_to_rag = PIXI.DEG_TO_RAD;
        sectors.beginFill((i & 1) ? 0x4287f5 : 0xdeac21);
        sectors.moveTo(0, 0);
        // 20 => 360 degree / 18 sectors
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

    function spin() {
        let click = false;
        diff = randomNum(10, 360);
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
        const sector = Math.round(adjustedAngle / sectorSize);
        // console.log("stopped on sector:", sector + 1);
        const winObject = sectorsData.find(x => x.stopedOn === (sector + 1));
        console.log(winObject);
        totalEl.textContent = +totalEl.textContent + +winObject.value;
        
    }

    function randomNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

})();

