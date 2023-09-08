const knex = require("./knex/knex.js");

/**
 * Config multer
 */
const multer = require("multer");

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            console.log("Dest");
            cb(null, "upload/");
        },
        filename: function (req, file, cb) {
            const idMesa = req.params.descripcionMesa;
            const idCategoria = req.params.descripcionCategoria;

            cb(
                null,
                `mesa-${idMesa}_categoria-${idCategoria}_date-${Date.now()}`
            );
        },
    }),
});

/**
 * Arrancan endpoints
 */

exports.getPuntoMuestral = (req, res) => {
    const celular = req.params ? req.params.celular : null;

    // Si SI tiene celular, filtro por el. Caso contrario, busco todos los punto_muestral
    if (celular) {
        return knex("punto_muestral")
            .select("*")
            .where("celular", celular)
            .then((resp) => res.send(resp))
            .catch((err) => {
                console.log("Celular:" + celular);
                console.log("ERROR");
                console.log(err);
            });
    } else {
        return knex("mesa")
            .select("*")
            .then((resp) => res.send(resp));
    }
};

exports.postPuntoMuestral = (req, res) => {
    return knex("punto_muestral")
        .update("registro_ingreso", req.body.registroIngreso)
        .update("horapresencia", knex.raw("GETDATE()"))
        .where("celular", req.params.celular)
        .then((resp) =>
            res.send({
                status: "Ok",
                body: "Presencia reportada correctamente",
            })
        )
        .catch((err) =>
            res.status(404).send({
                status: "Error",
                body: err,
            })
        );
};

exports.getPuntoMuestralByIdPuntoMuestral = (req, res) => {
    return knex("mesa")
        .select("*")
        .where("idpuntomuestral", req.params.idPuntoMuestral)
        .then((resp) => res.send(resp));
};

/**
 * Filtro las categorias DE ESA MESA que ya se han votado
 *  */
exports.getPuntoMuestralByIdMesa = (req, res) => {
    return knex("categoria")
        .select("idcategoria")
        .distinct()
        .join("candidato", "candidato.idcategoria", "categoria.id")
        .join("mesa_candidato", function () {
            this.on("mesa_candidato.idcandidato", "=", "candidato.id").andOn(
                "mesa_candidato.idmesa",
                "=",
                knex.raw("?", [req.params.idMesa])
            );
        })
        .join("mesa", "mesa.id", "mesa_candidato.idmesa")
        .where(function () {
            this.where("mesa.id", knex.raw("?", [req.params.idMesa])).andWhere(
                "mesa.idpuntomuestral",
                knex.raw("?", [req.params.idPuntoMuestral])
            );
        })
        .then((categoriasCargadas) => {
            const categoriasArray = categoriasCargadas.map(
                (a) => a.idcategoria
            );

            return knex("categoria")
                .select("*")
                .whereNotIn("id", categoriasArray)
                .then((resp) => res.send(resp));
        })
        .catch((err) => console.log(err));
};

/**
 * Retorna TODAS las categorias
 */
exports.getCategorias = (req, res) => {
    return knex("categoria")
        .select("*")
        .orderBy("ordenCategoria","asc")
        .then((resp) => res.send(resp))
        .catch((err) => res.status(500).send(err));
};

/**
 * Retorna TODOS las mesas
 */
exports.getMesas = (req, res) => {
    return knex("mesa")
        .select("*")
        .then((resp) => res.send(resp));
};

exports.getCategoriaById = (req, res) => {
    return knex("candidato")
        .select("*")
        .orderBy("orden","asc")
        .where("idcategoria", req.params.idCategoria)
        .then((resp) => res.send(resp));
};

exports.postMesa = (req, res, next) => {
    // Primero checkeo que se suba bien la foto. Caso contrario cancelo todo
    upload.single("attachment")(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.log(err);
            return res.status("404".send(err));
        } else if (err) {
            console.log(err);
            return res.status("500".send(err));
        }

        /**
         * Mapeo el body a un array de promises (todos los insert a la db) que despues resuelvo todos juntos
         */
        const mesasCandidatos = JSON.parse(req.body["mesasCandidatos"]);

        const mesasCandidatosPromises = mesasCandidatos
            .map((mc) => ({
                idmesa: mc.mesa.id,
                idcandidato: mc.candidato.id,
                cantidadvotos: mc.cantidadVotos,
            }))
            .map((m) => knex("mesa_candidato").insert(m));

        Promise.all(mesasCandidatosPromises)
            .then((resp) =>
                res.send({
                    status: "ok",
                })
            )
            .catch((err) =>
                res.status(404).send({
                    status: "error",
                    body: err,
                })
            );
    });
};

exports.getResultados = (req, res) => {
    return knex
        .raw(
            `calculaProyeccion ${req.params.idCategoria}, ${req.params.idMesa}`
        )
        .then(function (result) {
            res.send(result);
        });
};

exports.getPuntos = (req, res) => {
    return knex
        .raw(`puntosInformadosTotal ${req.params.idCategoria}`)
        .then(function (result) {
            res.send(result);
        });
};

exports.getAdmin = (req, res) => {
    console.log(req.params.spName);

    return knex
        .raw(`${req.params.spName}`)
        .then(function (result) {
            res.send(result);
        })
        .catch(function (err) {
            res.status(404).send(err);
        });
};

exports.getLocalidad = (req, res) => {
    return knex("punto_muestral")
        .select("localidad")
        .distinct()
        .whereNotNull("localidad")
        .then((resp) => res.send(resp.map((e) => e.localidad)))
        .catch((err) => {
            console.log("ERROR");
            console.log(err);
        });
};
