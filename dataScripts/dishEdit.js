const fs = require('fs');
const path = require('path');
let configBuffer = {};
let dish = {};
let ab = {};
for(let id=1; id<=27638; id++){
    let number = "";
    for(let j=0;j<5-id.toString().length;j++){
        number += "0";
    }
    number += id.toString();
    configBuffer[id] = fs.readFileSync(path.resolve(__dirname, `../dishes/meta${number}.json`), 'utf-8');
    ab = JSON.parse(configBuffer[id]);
    dish[id] = {
        name: ab.name,
        ingredientLines: ab.ingredientLines,
        attributes: ab.attributes,
    }
    dish[id] = JSON.stringify(dish[id]);
    fs.writeFileSync(path.resolve(__dirname, `../dishes/meta${number}.json`), dish[id], 'utf-8');
}
