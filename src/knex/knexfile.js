/** Crear un nuevo grupo para apuntar a una DB diferente, y controlar con una variable global */

module.exports = {
    development: {
        client: "mssql",
        connection: {
            host: "www.kernelinformatica.com.ar",
            port: 14335,
            user: "SA",
            password: "Alberdi11",
            database: "elecciones_db",
        },
        migrations: {
            directory: __dirname + "/knex/migrations",
        },
        seeds: {
            directory: __dirname + "/knex/seeds",
        },
    },
    production: {
        client: "mssql",
        connection: {
            host: "localhost",
            port: 14335,
            user: "SA",
            password: "Alberdi11",
            database: "elecciones_db",
        },
        migrations: {
            directory: __dirname + "/knex/migrations",
        },
        seeds: {
            directory: __dirname + "/knex/seeds",
        },
    },
};
