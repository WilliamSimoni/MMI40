require('dotenv').config();
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const { Pool, Client } = require('pg');

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl: false
});

async function insertProject(projectName, username, password) {
    const client = await pool.connect();
    try {
        const psw = await bcrypt.hash(password, 5);
        const id = uuid.v4();
        const res = await client.query(
            `INSERT INTO project (name, username, password, workspaceuid) VALUES($1,$2,$3,$4)`,
            [projectName, username, psw, id]);
        console.log(res);
    } finally {
        client.release()
    }
}

async function insertRole(projectName, name) {
    console.log(projectName, name);
    const client = await pool.connect();
    try {
        const id = uuid.v4();
        console.log(id);
        const res = await client.query(
            `INSERT INTO roles VALUES($1,$2,$3)`,
            [id, name, projectName]);
        console.log(res);
    } finally {
        client.release()
    }
}

async function insertUser(username, password, projectName, role) {
    const client = await pool.connect();
    try {

        //verify username does not exist
        let res = await client.query(
            `SELECT username FROM users WHERE username = $1 AND projectname = $2`,
            [username, projectName]
        );
        
        if (res.rows[0]){
            return 'username already exixsts';
        }

        //find roleID
        const roleID = await client.query(
            `SELECT id FROM roles WHERE name = $1 AND projectname = $2`,
            [role, projectName]
        );

        if (!roleID.rows[0]){
            return 'role was not found';
        }

        const id = uuid.v4();
        const psw = await bcrypt.hash(password, 5);

        res = await client.query(
            `INSERT INTO users VALUES($1,$2,$3,$4,$5)`,
            [id, username, psw, projectName, roleID.rows[0].id]
        );

    } finally {
        client.release()
    }
}

insertProject('ferrari', 'ferrari', '12345678')
    .catch(error => console.error(error));
    
insertRole('ferrari', 'operatore')
    .catch(error => console.error(error));

insertUser('William', '12345678', 'ferrari', 'operatore')
    .then(res => console.log(res))
    .catch(error => console.error(error));

insertUser('Roberto', '12345678', 'ferrari', 'operatore')
    .then(res => console.log(res))
    .catch(error => console.error(error));

insertUser('Emilia', '12345678', 'ferrari', 'operatore')
    .then(res => console.log(res))
    .catch(error => console.error(error));
