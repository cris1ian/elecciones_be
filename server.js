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
const domain = "www.mesastesti.com.ar"

if (shouldUseHttps) {
    const options = {
        key: fs.readFileSync(`/etc/letsencrypt/live/${domain}/privkey.pem`),
        cert: fs.readFileSync(`/etc/letsencrypt/live/${domain}/fullchain.pem`),
        ca: fs.readFileSync(`/etc/letsencrypt/live/${domain}/chain.pem`),
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