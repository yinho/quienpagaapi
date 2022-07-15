require("express-async-errors");
const express = require("express");
const mariadb = require('mariadb');

const app = express();

const errorHandling = (err, req, res, next) => {
    console.log(err);
    res.status(500).json({
        msg: err.message,
        success: false,
    });
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const pool = mariadb.createPool({
    host: "192.168.1.35",
    port: 3307,
    user: "quienpagaapi",
    password: "+7Ys=Tjk+pa<5W^q",
    database: "quienpaga",
    connectionLimit: 5
});


let usuarios = ["Alex", "Borja", "Sergio"]



async function getQuienPagoMenosQuery(conn) {


    const rows = await conn.query("SELECT nombre, count(*) FROM pagos GROUP BY nombre ORDER BY 2");

    return rows;


}



function insertaPago(conn, nombre) {


    let sql = `INSERT INTO pagos (nombre, fecha) VALUES ('${nombre}', now())`;
    conn.query(sql);

}

function actualizaUltimoPago(conn, nombre) {


    let sql = `UPDATE pagos SET nombre = '${nombre}' WHERE ID = (select max(id) from pagos)`;
    conn.query(sql);

}

function obtenerQuienPagoHoy(conn, nombre) {


    const sql = `SELECT nombre from pagos WHERE DATE(fecha) = curdate() order by fecha desc LIMIT 1`;
    const rows = conn.query(sql);
    return rows;
}



async function obtenerQuienPagoMenosDb(conn) {

    const result = await getQuienPagoMenosQuery(conn);

    var nombre;
    if (result.length > 0) {
        nombre = result[0].nombre;
    }
    else {
        nombre = usuarios[getRandomInt(0, 3)];
    }
    return nombre;

}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


app.get('/api/quienpaga', async (req, res) => {



    let conn;
    try {
        conn = await pool.getConnection();

        var personaConMenosPagos = await obtenerQuienPagoMenosDb(conn);
        await insertaPago(conn, personaConMenosPagos);

    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.end();
    }

    let respuesta = { "turno": personaConMenosPagos }
    res.send(respuesta);
});


app.get('/api/quienpaga/hoy', async (req, res) => {

    let conn;
    let persona;
    try {
        conn = await pool.getConnection();
        var rows = await obtenerQuienPagoHoy(conn);
        
        if (rows.length == 0) {
            persona = await obtenerQuienPagoMenosDb(conn);
            await insertaPago(conn, persona);
        }
        else
            persona = rows[0].nombre;


    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.end();
    }

    let respuesta = { "turno": persona }


    res.send(respuesta);
});

app.post('/api/pago/:nombre', async (req, res) => {

    let conn;
    try {
        conn = await pool.getConnection();

        await actualizaUltimoPago(conn, req.params.nombre)

    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.end();
    }

    let respuesta = { "result": "ok" }
    res.send(respuesta);


});

app.use(errorHandling);

app.listen(8080, () => {

    console.log("El servidor está inicializado en el puerto 8080");
});
