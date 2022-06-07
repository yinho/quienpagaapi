const express = require("express");
const app = express();
let usuarios = ["Alex", "Borja", "Sergio"]




app.get('/', function (req, res) {
    
    let respuesta = { "turno": usuarios[getRandomInt(0,3)]}
    res.send(respuesta);
  });
  
app.listen(8080, () => {

    console.log("El servidor está inicializado en el puerto 8080");
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}