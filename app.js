// require
var express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');

//inicializar variables
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload());//creo que se podria usar para subir una imagen desde el celular no se como se hace...
app.use(cors());

//CORS Middleware: para que no lance errores de seguridad
app.use(function(req,res,next){
    //enabling cors
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods","GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
    next();
});

//conexion bdd
const mc = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password:'',
    database:'canito_dm'
});
//crear tabla y poblado
mc.connect(function(err){
        if (err) {
            return console.error('error: ' + err.message);
          }
            let drop = "DROP TABLE IF EXISTS producto";
            let createProducto = `create table if not exists producto(
                                  id_producto int primary key auto_increment,
                                  nombre varchar(255)not null,
                                  precio int not null,
                                  descripcion varchar(255)not null,
                                  categoria varchar(255)not null,
                                  URL_img varchar(255)not null,
                                  cantidad_personas varchar(255)not null                            
                              )`;
            let sql = "INSERT INTO producto ( nombre, precio, descripcion, categoria, URL_img, cantidad_personas) VALUES ?";
            let values= [
                ['torta de manjar', 10000, 'torta de manjar', 'tortas','https://www.gourmet.cl/wp-content/uploads/2017/05/torta-choc-manjar-editada.jpg', 15],
                [ 'torta de mil hojas', 10000, 'torta de mil hojas', 'tortas','https://www.gourmet.cl/wp-content/uploads/2017/05/torta-choc-manjar-editada.jpg', 15],
                [ 'torta de naraja', 10000, 'torta de naraja', 'tortas','https://www.gourmet.cl/wp-content/uploads/2017/05/torta-choc-manjar-editada.jpg', 15],
                [ 'torta de piña', 10000, 'torta de piña', 'tortas','https://www.gourmet.cl/wp-content/uploads/2017/05/torta-choc-manjar-editada.jpg', 15],
                [ 'torta trasnochada', 10000, 'torta trasnochada', 'tortas','https://www.gourmet.cl/wp-content/uploads/2017/05/torta-choc-manjar-editada.jpg', 15],
            ];
          
            mc.query(drop, function(err, results, fields) {
                if (err) {                
                  console.log(err.message);
                }
                console.log('Drop producto realizado');
              });
            mc.query(createProducto, function(err, results, fields) {
            if (err) {
              console.log(err.message);
            }
            console.log('create producto realizado');
          });
          mc.query(sql, [values], function (err, result) {
            if (err) throw err;
            console.log(values);
            console.log('insert producto realizado');
          });
          mc.end(function(err) {
            if (err) {
              return console.log(err.message);
            }
          });                
});

//escuchar peticiones
app.listen(80,()=>{
console.log('Express Server - puerto 80 online');
});

// Rutas
app.get('/',(req, res,next)=>{
    res.status(200).json({
        Ok: true,
        mensaje: 'Peticion realizada correctamente'
    })
});

//get productos
app.get('/productos', function(req,res){
    mc.query('SELECT * FROM producto', function(error,  results, fields ){
        if(error) throw error;
        return res.send({error: false, data: results, message:'Lista de productos.'})
    })
})

//agregar producto
app.post('/producto', function(req, res){
    let datosProducto ={    
        nombre:	req.body.nombre,
        precio:	parseInt(req.body.precio),
        descripcion:req.body.descripcion,
        categoria:req.body.categoria,
        URL_img: req.body.URL_img,
        cantidad_personas: parseInt(req.body.cantidad_personas)
    };
    if(mc){
       mc.query("INSERT INTO producto SET ?", datosProducto, 
            function(error,result){
                if(error){
                    res.status(500).json({"Mensaje": "Error"});
                }else{
                    res.status(201).json({"Mensaje":"Insertado"});
                }
            });
    }
});

/*actualizar producto*/
app.put('/producto/:id', function(req,res){
    let id = req.params.id;
    let producto = {
        nombre:	req.body.nombre,
        precio:	parseInt(req.body.precio),
        descripcion:req.body.descripcion,
        categoria:req.body.categoria,
        URL_img: req.body.URL_img,
        cantidad_personas: parseInt(req.body.cantidad_personas)
    };

    console.log(producto);
    
    if(!id || !producto){
        return res.status(400).send({error: producto, message:'Debe proveer un id y los datos de un producto'});
    }
    mc.query("UPDATE producto SET ? WHERE Id = ?", [producto,id], function(error,results,fields){
        if(error){ 
            console.log(error);
            throw error;
        }
        return res.status(200).json({
            Mensaje:"Registro ha sido actualizado",
            result: results,
        })
    })
})

