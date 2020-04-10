const { Pool, Client } = require('pg');
const {query} = require('./postgres/search.database');
const {time} = require('../FIBO_modules/time');
const uuid = require('uuid');
const {createDatabase} = require('./postgres/create.database');

const EXPRIRATION_TIME = process.env.EXPRIRATION_TIME;
const BCRYPT_SALT = process.env.BCRYPT_SALT;

class PostgresDB {
    constructor() {
        if (!PostgresDB.instance) {
            //Create Pool for connetion to Postgre
            this.pool = new Pool({
                user: process.env.PGUSER,
                host: process.env.PGHOST,
                database: process.env.PGDATABASE,
                password: process.env.PGPASSWORD,
                port: process.env.PGPORT,
                ssl: false
            });
            PostgresDB.instance = this;
        }
        
        return PostgresDB.instance;
    }

    //SEARCH USER
    searchUser(username, projectName){
        return query(
            this.pool,
            `SELECT * FROM users WHERE username = $1 AND projectname = $2;`,
            [username, projectName]
        );
    }
    
    //PUT TOKEN IN BLACKLIST
    putTokenInBlackList(token,projectName){
        const id = uuid.v4();
        return query(
            this.pool,
            `INSERT INTO tokensblacklist (id, token, expirationdate, projectname)
             VALUES($1,$2,$3,$4);`,
            [id, token, time.add(time.now(),24,'hour'), projectName]
        )
    }
    
    //SEARCH TOKEM IN BLACKLIST
    searchTokenInBlackList(token){
        return query(
            this.pool,
            `SELECT id FROM tokensblacklist WHERE token = $1`,
            [token]
        )
    }
}

exports.PostgresDB = PostgresDB;