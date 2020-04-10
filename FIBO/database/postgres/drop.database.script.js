const { Pool, Client } = require('pg');
require('dotenv').config();

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
                devices, 
                alarms, 
                access, 
                sent, 
                roles, 
                according, 
                users 
                CASCADE;
        `);
        console.log(res);
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