function getDish(data, res){
    let id = Number(data.id);
    let configBuffer = fs.readFileSync(path.resolve(__dirname, `../dishes/meta${id}.json`), 'utf-8');
    let dish = {
        ingredientsLines: configBuffer.ingredientsLines,
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