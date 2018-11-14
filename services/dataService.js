const fs = require('fs');
const path = require('path');
let configBuffer = {};
function getDish(data, res){
    let id = Number(data.id);
    let number = "";
    for(let j=0;j<5-id.toString().length;j++){
        number += "0";
    }
    number += id.toString();
    configBuffer = fs.readFileSync(path.resolve(__dirname, `../dishes/meta${number}.json`), 'utf-8');
    configBuffer = JSON.parse(configBuffer);
    let dish = {
        ingredientsLines: configBuffer.ingredientLines,
        name: configBuffer.name,
        course: configBuffer.attributes.course,
        cuisine: configBuffer.attributes.cuisine,
    }
    res.json({
        ResponseMsg: 'Dish',
        ResponseFlag: 'S',
        dish: dish
    });
}

module.exports = {
    getDish
}