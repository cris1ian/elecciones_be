module.exports = {
    development: {
        client: "mssql",
        connection: {
            host: "localhost",
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
};
