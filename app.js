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
    
    let rewards = ["500", "1000", "200", "500", "Free Spin", "100", "20", "500", "1000", "600", "800", 
        "700", "250", "20", "100", "700", "400", "100"
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
        
        const text = new PIXI.Text(rewards[i], {
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
        let targetAngle = randomNum(10, 360) + 360 * 3;
        let currentAngle = 0;
        
        app.ticker.add(() => {
            if (currentAngle < targetAngle) {
                currentAngle += 5;
                sectors.rotation = PIXI.DEG_TO_RAD * currentAngle;
            }
            else {
                if(!click) {
                    identifySector(currentAngle % 360);
                    click = true;
                }
            }
        });
    }

    function identifySector(finalAngle) {
        const adjustedAngle = finalAngle < 0 ? finalAngle + 360 : finalAngle;
        const sector = Math.floor(adjustedAngle / sectorSize);
        console.log(container);
        
        console.log("stopped on sector:", sector + 1);
        console.log(rewards[sector]);
    }

    function randomNum(min, max) {
        const result = Math.floor(Math.random() * (max - min + 1) + min);
        return result % sectorSize === 0 ? result + 6 : result;
    }

})();

