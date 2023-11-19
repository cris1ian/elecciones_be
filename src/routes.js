const controllers = require("./controllers");
const auth = require("./auth");

module.exports = (app) => {
    app.post("/login", auth.login);
    app.post("/punto_muestral/:celular", controllers.postPuntoMuestral);
    app.get("/punto_muestral/:celular", controllers.getPuntoMuestral);
    app.get("/punto_muestral/:idPuntoMuestral/mesas", controllers.getPuntoMuestralByIdPuntoMuestral);
    app.get("/punto_muestral/:idPuntoMuestral/mesas/:idMesa/categorias", controllers.getPuntoMuestralByIdMesa);

    app.get("/categorias", controllers.getCategorias);
    app.get("/categoria/:idCategoria/candidatos", controllers.getCategoriaById);

    app.get("/mesas", controllers.getMesas);
    app.post("/mesa-candidato/:descripcionMesa/:descripcionCategoria", controllers.postMesa);

    app.get("/resultados/:idCategoria/:idMesa", controllers.getResultados);
    app.get("/puntos-informados/:idCategoria", controllers.getPuntos);
    app.get("/admin-sp/:spName", controllers.getAdmin);
    app.get("/localidad", controllers.getLocalidad);

    app.get("/comparativa", controllers.getComparativa);
    app.get("/circuitos", controllers.getCircuitos);
};
