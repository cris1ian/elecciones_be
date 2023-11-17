const knex = require("./knex/knex.js");
const bcrypt = require("bcrypt")

exports.login = (req, res) => {
    const { celular, password } = req.body;

    if (!celular) return res.status(400).send({ body: "Se requiere numero de celular o código" })
    if (!password) return res.status(400).send({ body: "Se requiere contraseña" })

    return knex("punto_muestral")
        .select("*")
        .where({ celular })
        .then(async (resp) => {
            if (!resp[0]) return res.status(404).send({ body: "No se halló el usuario" })
            generateHash(password);
            const passwordOk = await comparePassword(password, resp[0]?.password);
            if (!passwordOk) return res.status(404).send({ body: "No se halló el usuario" });
            resp = resp.map(elem => { delete elem.password; return elem })
            return res.status(200).send(resp);
        })
        .catch((err) => {
            console.log(err);
            return res.send({ status: 400, body: "Error desconocido" })
        });
};

function generateHash(password) {
    bcrypt.hash(password, 6, function (err, hash) {
    });
}

function comparePassword(plaintextPassword, hash) {
    return bcrypt.compare(plaintextPassword, hash)
        .then(result => {
            return result
        })
        .catch(err => {
            console.log(err)
            return false
        })
}