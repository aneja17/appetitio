const fs = require('fs');
const path = require('path');
let configBuffer = {};
let ingredients = {};
configBuffer = fs.readFileSync(path.resolve(__dirname, `../config/yummly.json`), 'utf-8');
configBuffer = JSON.parse(configBuffer);
let w=0;
for(let i=0; i<configBuffer.length; i++){
    for(let j=0; j<configBuffer[i].ingredients.length; j++){
        if(! (configBuffer[i].ingredients[j] in ingredients)){
            ingredients[configBuffer[i].ingredients[j]] = w;
            w++;
        }
    }
}
ingredients = JSON.stringify(ingredients);
fs.writeFileSync(path.resolve(__dirname, `../config/ingredients.json`), ingredients, 'utf-8');