const { Pool, Client } = require('pg');
require('dotenv').config();

console.log(process.env.PGPORT);

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl: false
});

async function dropDatabase(pool) {
    const client = await pool.connect();
    try {
        let res = await client.query(
            `DROP TABLE IF EXISTS 
                tags, 
                project, 
                data, 
                tokensblacklist, 
                superusers, 
                alarms, 
                access, 
                roles, 
                according, 
                users,
                fleets,
                relative,
                taggroup
                CASCADE;
        `);
        res = await client.query(
            'DROP TYPE IF EXISTS alarmtype'
        );
        console.log(res);
    } finally {
        client.release()
    }
}

//EXEC
dropDatabase(pool)
    .catch(error => console.error(error));