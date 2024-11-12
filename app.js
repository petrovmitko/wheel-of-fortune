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
    const freeWinText = document.querySelector('.spin-win-txt');
    const currPrize = document.querySelector('.current-prize');

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
        {stopedOn: 14, value: '20', deg: 0, min: 246, max: 265},
        {stopedOn: 13, value: '200', deg: 20, min: 226, max: 245},
        {stopedOn: 12, value: '500', deg: 40, min: 206, max: 225},
        {stopedOn: 11, value: '100', deg: 60, min: 186, max: 205},
        {stopedOn: 10, value: 'Free Spin', deg: 80, min: 166, max: 185},
        {stopedOn: 9, value: '400', deg: 100, min: 146, max: 165},
        {stopedOn: 8, value: '250', deg: 120, min: 126, max: 145},
        {stopedOn: 7, value: '10', deg: 140, min: 106, max: 125},
        {stopedOn: 6, value: '700', deg: 160, min: 86, max: 105},
        {stopedOn: 5, value: '20', deg: 180, min: 66, max: 85},
        {stopedOn: 4, value: '200', deg: 200, min: 46, max: 65},
        {stopedOn: 3, value: '500', deg: 220, min: 25, max: 45},
        {stopedOn: 2, value: '100', deg: 240, min: 6, max: 25},
        {stopedOn: 1, value: '1000', deg: 260, min: 356, max: 5},
        {stopedOn: 18, value: '400', deg: 280, min: 326, max: 345},
        {stopedOn: 17, value: '250', deg: 300, min: 306, max: 325},
        {stopedOn: 16, value: '10', deg: 320, min: 286, max: 305},
        {stopedOn: 15, value: '700', deg: 340, min: 266, max: 285},
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

    startBtn.on('click', () => {
        if(threeSpinCounter === 0 ){
            spin();
        }
    });

    let lastSectorData = {};
    let freeSpinTotal = 0;
    let roundsCounter = 0;

    const specialSectors = getTwoSpecialSectors();
    /*
     c getSpecialSectorsSpinIndex() взимам позициите, на които да спре колелото на специален сектор, 
     така че да се разминат и да не могат да се изпълнят последователно.
     */
    const specialSpinIndexArray = getSpecialSectorsSpinIndex();
    let freeSpinIndexArray = [];
    for(let i = 1; i <= 10; i++) {
        if(specialSpinIndexArray.indexOf(i) === -1) {
            freeSpinIndexArray.push(i);
        }
    }    
    
    function spin() {
        roundsCounter++;
        let click = false;
        diff = randomNum(2, 358);
        if(threeSpinCounter > 0) {
            // предпазва да се паднат free spin, на 3-те последователни завъртания
            diff = preventFallingSameSector(diff, 165, 186);
        }
        else {
            // Предпазва от попадане на същия сектор в 2 последователни пъти;
            diff = preventFallingSameSector(diff, lastSectorData.min, lastSectorData.max);
        }
        if(freeSpinIndexArray.indexOf(roundsCounter) !== -1){
            // предпазва да се паднат секторите, които трябва да се повтарят
            diff = preventFallingSpecialSector(diff, 
                specialSectors[0].min, specialSectors[0].max, 
                specialSectors[1].min, specialSectors[1].max,
            );
        }
        if(roundsCounter === specialSpinIndexArray[1] || roundsCounter === specialSpinIndexArray[3]){
            // Взимам първия от избраните сектори и указвам кога/къде да спре колелото
            diff = specialSectors[0].min + 10;
        }
        if( roundsCounter === specialSpinIndexArray[0] || 
            roundsCounter === specialSpinIndexArray[2] || 
            roundsCounter === specialSpinIndexArray[4]){
            // Взимам втория от избраните сектори и указвам кога/къде да спре колелото
            diff = specialSectors[1].min + 10;
        }
        // Правя 3 последователни оборота + random стойност;
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
        // Определям на кой сектор се се спряло колелото
        const finalAngle = sectors.rotation * (180 / Math.PI);
        const adjustedAngle = ((finalAngle % 360) + 360) % 360;
        let sector = Math.round(adjustedAngle / sectorSize);
        sector = sector > 17 ? 17 : sector;
        const winObject = sectorsData.find(x => x.stopedOn === (sector + 1));
        lastSectorData = winObject;
        
        if(winObject.value !== 'Free Spin') {
            totalEl.textContent = +totalEl.textContent + +winObject.value;
            if(threeSpinCounter > 0 && threeSpinCounter <= 3) {
                const li = document.createElement('li');
                li.textContent = 'Печалба: ' + winObject.value;
                freeSpinList.appendChild(li);
                freeSpinTotal += +winObject.value;
                if(threeSpinCounter === 3) {
                    const totallLi = document.createElement('li');
                    totallLi.textContent = 'Тотал: ' + freeSpinTotal;
                    freeSpinList.appendChild(totallLi);  
                }
            }
            currPrize.innerHTML = `<h2>Моментна печалба: ${winObject.value}</h2>`;
        }
        if(threeSpinCounter > 0 && threeSpinCounter < 3 && winObject.value === 'Free Spin') {

            setTimeout(() => {
                spin();
            }, 1000);
            return;
        }
        if(threeSpinCounter >= 3) {
            // Приключват 3-те последователни автоматични завъртания
            threeSpinCounter = 0;
            freeSpinTotal = 0;
            freeWinText.classList.add('hide');
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
            // Показва се текс, който индикира, че юзъра в спечелил 3 последователни завъртания
            freeWinText.classList.remove('hide');
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

    function preventFallingSpecialSector(diff, minA, maxA, minB, maxB) {
        if((diff > minA && diff < maxA) || (diff > minB && diff < maxB)) {
            return preventFallingSameSector(randomNum(10, 349), minA, maxA, minB, maxBx);
        }
        return diff;
    }

    function getTwoSpecialSectors() {
        let a = randomNum(0, 8);
        let b = randomNum(9, 17);
        
        while(a === 4) {
            // исключвам възможноста специалния сектор да е free spin
            a = randomNum(0, 8);
        }
        return [sectorsData[a], sectorsData[b]];
    }

    function getSpecialSectorsSpinIndex() {
        return [randomNum(1, 2), randomNum(3, 4), randomNum(5, 6),randomNum(7, 8), randomNum(9, 10)];
    }

})();

