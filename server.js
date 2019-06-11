const express = require('express');
const PORT = process.env.PORT || 3001;
const knex = require('./knex/knex.js');
const cors = require('cors')
const app = express();

const candidatosNombres = require('./constants/candidatosNombres').default;
const reglas = require('./constants/reglas').default;


/**
 * Config multer
 */
const multer = require('multer');

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            console.log("Dest");
            cb(null, 'upload/')
        },
        filename: function (req, file, cb) {
            const idMesa = req.params.descripcionMesa;
            const idCategoria = req.params.descripcionCategoria;

            cb(null, `mesa-${idMesa}_categoria-${idCategoria}_date-${Date.now()}`)
        }
    })
})

/**
 * Configura las CORS
 */
app.use(cors())

/**
 * Arrancan endpoints
 */

app.get(
    '/punto_muestral/:celular',
    (req, res) => {

        const celular = req.params ? req.params.celular : null;

        // Si SI tiene celular, filtro por el. Caso contrario, busco todos los punto_muestral
        if (celular) {
            return knex('punto_muestral').select('*')
                .where('celular', celular)
                .then(
                    resp => res.send(resp)
                )

        } else {
            return knex('mesa').select('*')
                .then(
                    resp => res.send(resp)
                )
        }

    }
);


app.get(
    '/punto_muestral/:idPuntoMuestral/mesas',
    (req, res) =>
        knex('mesa').select('*')
            .where('idpuntomuestral', req.params.idPuntoMuestral)
            .then(
                resp => res.send(resp)
            )
);

/**
 * Retorna TODAS las categorias
 */
app.get(
    '/categorias',
    (req, res) =>
        knex('categoria').select('*')
            .then(
                resp => res.send(resp)
            )
);

/**
 * Retorna TODOS las mesas
 */
app.get(
    '/mesas',
    (req, res) =>
        knex('mesa').select('*')
            .then(
                resp => res.send(resp)
            )
);

/**
 * Filtro las categorias DE ESA MESA que ya se han votado
 *  */
app.get(
    '/punto_muestral/:idPuntoMuestral/mesas/:idMesa/categorias',
    (req, res) =>
        knex('categoria').select('idcategoria').distinct()
            .join('candidato', 'candidato.idcategoria', 'categoria.id')
            .join('mesa_candidato', function () {
                this.on('mesa_candidato.idcandidato', '=', 'candidato.id')
                    .andOn('mesa_candidato.idmesa', '=', knex.raw('?', [req.params.idMesa]))
            })
            .join('mesa', 'mesa.id', 'mesa_candidato.idmesa')
            .where(function () {
                this
                    .where('mesa.id', knex.raw('?', [req.params.idMesa]))
                    .andWhere('mesa.idpuntomuestral', knex.raw('?', [req.params.idPuntoMuestral]))
            })
            .then(
                categoriasCargadas => {
                    const categoriasArray = categoriasCargadas.map(a => a.idcategoria);

                    return knex('categoria').select('*')
                        .whereNotIn('id', categoriasArray)
                        .then(
                            resp => res.send(resp)
                        )
                }
            )
            .catch(
                err => console.log(err)
            )
);

app.get(
    '/categoria/:idCategoria/candidatos',
    (req, res) =>
        knex('candidato').select('*')
            .where('idcategoria', req.params.idCategoria)
            .then(
                resp => res.send(resp)
            )
);


app.post(
    '/mesa-candidato/:descripcionMesa/:descripcionCategoria',
    (req, res, next) => {

        // Primero checkeo que se suba bien la foto. Caso contrario cancelo todo
        upload.single('attachment')(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                return res.status('404'.send(err))
            } else if (err) {
                return res.status('500'.send(err))
            }

            /**
             * Mapeo el body a un array de promises (todos los insert a la db) que despues resuelvo todos juntos
             */
            const mesasCandidatos = JSON.parse(req.body['mesasCandidatos']);

            // RN: Candidato total votos tiene que ser menor o igual a 350
            const candidatoTotalVotos = mesasCandidatos.find(mc => mc.candidato.nombre === candidatosNombres.TOTAL_VOTOS);
            if (candidatoTotalVotos.cantidadVotos > reglas.MAX_VOTOS) {
                res.status('404').send({
                    status: 'error',
                    body: `Total Votos supera la cantidad máxima permitida: ${reglas.MAX_VOTOS}`
                })
            }

            // RN: Sumatoria cnadidatos exceptuando total votos tiene que ser menor o igual a 350
            const sumTotalVotos = mesasCandidatos
                .filter(mc => mc.candidato.nombre !== candidatosNombres.TOTAL_VOTOS)
                .reduce(
                    (acc, mc) => acc + Number(mc.cantidadVotos),
                    0
                )

            if (sumTotalVotos > reglas.MAX_VOTOS) {
                res.status('404').send({
                    status: 'error',
                    body: `La suma de los votos de cada candidato supera la cantidad máxima permitida: ${reglas.MAX_VOTOS}`
                })
            }

            const mesasCandidatosPromises = mesasCandidatos
                .map(
                    mc => ({
                        idmesa: mc.mesa.id,
                        idcandidato: mc.candidato.id,
                        cantidadvotos: mc.cantidadVotos
                    })
                )
                .map(
                    m => knex('mesa_candidato').insert(m)
                )


            Promise.all(mesasCandidatosPromises)
                .then(
                    resp => res.send({
                        status: 'ok'
                    })
                )
                .catch(
                    err => res.status(404).send({
                        status: 'error',
                        body: err
                    })
                )

        })


    }
)


app.get(
    '/resultados',
    (req, res) =>
        knex.raw('calculaProyeccion').then(function(result) {
            // console.dir(result, {depth: null})
            // console.log(result)
            res.send(result)
        })


        // knex('mesa_candidato').select('urlimagen', 'nombre', 'cantidadvotos')
        //     .join('candidato', 'candidato.id', 'mesa_candidato.idcandidato')
        //     .join('mesa', 'mesa.id', 'mesa_candidato.idcandidato')
        //     .then(
        //         resp => res.send(
        //             resp.map(
        //                 r => ({
        //                     categoriaDescripcion: 'Gobernador',
        //                     candidatoNombre: 'Bonfatti',
        //                     contados: 1500,
        //                     proyectados: 60120,
        //                     porcentaje: 20,
        //                     urlImagen: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Antonio_Bonfatti_2019.png'
        //                 })
        //             )
        //         )
        //     )
);

/**
 * Fin endpoints
 */

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});
