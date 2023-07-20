const express = require('express');
const PORT = process.env.PORT || 3001;
const cors = require('cors')
const app = express();

const fs = require("fs");
const https = require("https");

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())


// Import routes
require('./src/routes')(app);

const shouldUseHttps = process.env.NODE_ENV == "production";
const path = "/home/administrador/cert-mesas/";
const domain = "www.mesastesti.com.ar";

if (shouldUseHttps) {
    const options = {
        key: fs.readFileSync(`${path}privkey.pem`),
        cert: fs.readFileSync(`${path}fullchain.pem`),
        ca: fs.readFileSync(`${path}chain.pem`),
    };

    https.createServer(options, app).listen(PORT, function () {
        console.log(`Detectado Server de Produccion.`);
        console.log(`Iniciando el servidor HTTPS API ${PORT}`);
    });
} else {
    app.listen(PORT, () => {
        console.log(`No detectado Server Produccion.\nSin certificado HTTPS.`);
        console.log(`Iniciando el servidor HTTP API ${PORT}`);
    });
}