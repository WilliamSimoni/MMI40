
const { Pool, Client } = require('pg');
const { time } = require('../custom-modules/time');

const uuid = require('uuid');
const bcrypt = require('bcrypt');

const { Safe } = require('../custom-modules/safe');
const { createDatabase } = require('./postgres/create.database');

const EXPRIRATION_TIME = process.env.EXPRIRATION_TIME;
const BCRYPT_SALT = Number(process.env.BCRYPT_SALT);

//create encryption object for encrypt tokens
const ENCRYPT_PASS = process.env.ENCRYPT_KEY;
const ENCRYPT_KEY_USERNAME = process.env.ENCRYPT_KEY_USERNAME;

const safe = new Safe(ENCRYPT_PASS);
const safe_email = new Safe(ENCRYPT_KEY_USERNAME);

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

    //SEARCH METHODS
    //all SEARCH functions get parameters to query the database and then return an array of all the rows found

    //SEARCH USER
    async searchUser(username, projectName) {
        const client = await this.pool.connect();
        let res;
        try {
            const queryText = `
                SELECT users.username, users.password, fleets.id as fleetid, fleets.zdmfleetid
                FROM users, access, fleets
                WHERE access.userid = users.id
                    AND	  users.username = $1
                    AND   users.projectname = $2
                    AND	  access.fleetid = fleets.id;`;
            const queryParams = [username, projectName];
            res = await client.query(queryText, queryParams);
        } finally {
            client.release()
        }

        return res.rows;
    }

    //SEARCH SUPERUSER
    async searchSuperUser(username) {
        const client = await this.pool.connect();
        let res;
        try {
            const queryText = `SELECT * FROM superusers WHERE username = $1`;
            const queryParams = [username];
            res = await client.query(queryText, queryParams);
        } finally {
            client.release()
        }

        return res.rows;
    }

    //SEARCH SUPERUSER PROJECT
    async searchSuperuserProject(username) {
        const client = await this.pool.connect();
        let res;
        try {
            const queryText = `SELECT name,workspaceuid FROM project WHERE superuser=$1`;
            const queryParams = [username];
            res = await client.query(queryText, queryParams);
        } finally {
            client.release()
        }

        return res.rows;
    }
    //SEARCH PROJECT
    async searchProject(projectName) {
        const client = await this.pool.connect();
        let res;
        try {
            const queryText = `SELECT * FROM project WHERE name=$1`;
            const queryParams = [projectName];
            res = await client.query(queryText, queryParams);
        } finally {
            client.release()
        }

        return res.rows;
    }

    //SEARCH TOKEN IN BLACKLIST
    async searchTokenInBlackList(token) {
        const client = await this.pool.connect();
        let res;
        try {
            const queryText = `SELECT id FROM tokensblacklist WHERE token = $1`;
            const queryParams = [token];
            res = await client.query(queryText, queryParams);
        } finally {
            client.release()
        }

        return res.rows;
    }

    //SEARCH USER FLEETS
    async searchFleets(userid, projectName) {
        const client = await this.pool.connect();
        let res;
        try {
            const queryText = `
            SELECT id, zdmfleetid 
            FROM fleets, access 
            WHERE access.userid = $1 
                AND access.fleetid = fleets.id
                AND fleets.projectname = $2`;
            const queryParams = [userid, projectName];
            res = await client.query(queryText, queryParams);
        } finally {
            client.release()
        }

        return res.rows;
    }

    //UPDATE METHODS

    //UPDATE PROJECT TOKEN
    async updateProjectToken(projectName, token, expires) {
        const client = await this.pool.connect();
        let res;
        const cryptedToken = await safe.encryptAsync(token);
        try {
            const queryText = `
                UPDATE project SET token = $1, tokenexpires = $2
                    WHERE name=$3;
            `;
            const queryParams = [cryptedToken, expires, projectName];
            res = await client.query(queryText, queryParams);
        } finally {
            client.release()
        }

        return res.rows;
    }

    //DELETE METHODS

    //DELETE PROJECT
    async deleteProject(projectName, username) {
        const client = await this.pool.connect();
        let res;
        try {
            const queryText = `DELETE FROM project WHERE name=$1 AND superuser=$2`;
            const queryParams = [projectName, username];
            res = await client.query(queryText, queryParams);
        } finally {
            client.release()
        }

        return res;
    }

    //INSERT METHODS

    //INSERT PROJECT
    async insertProject(projectName, token, tokenExpires, workspace, zdmemail, zdmpassword, superuser) {
        const client = await this.pool.connect();
        let res;
        try {
            projectName = projectName.replace(/\w+/g, (match) => match.toLowerCase());
            const cryptedToken = await safe.encryptAsync(token);
            const cryptedpsw = await safe.encryptAsync(zdmpassword);
            const cryptedemail = await safe_email.encryptAsync(zdmemail);
            const queryText = `INSERT INTO project (name, token, tokenexpires, workspaceuid, zdmemail, zdmpassword, superuser) VALUES($1,$2,$3,$4,$5,$6,$7)`;
            const queryParams = [projectName, cryptedToken, tokenExpires, workspace, cryptedemail, cryptedpsw, superuser];
            res = await client.query(queryText, queryParams);
        } finally {
            client.release()
        }

        return res;
    }

    //INSERT ACCESS
    async insertAccess(roleId, dataId, projectName) {
        const client = await this.pool.connect();
        let res;
        try {
            //verify that roleID and dataID exists and are part of the same project
            const verifyText = ` 
        SELECT roles.id, data.id
            FROM roles, data
            WHERE roles.projectname = data.projectname
                AND roles.id = $1
                AND data.id = $2
                AND roles.projectname = $3 
        ;`;
            const verifyParams = [roleId, dataId, projectName]
            const verify = await client.query(verifyText, verifyParams);

            if (!verify.rows[0]) {
                throw new Error('can\'t insert');
            }

            const queryText = `INSERT INTO access (roleid, dataid) VALUES($1,$2)`;
            const queryParams = [roleId, dataId];
            res = await client.query(queryText, queryParams);
        } finally {
            client.release()
        }

        return res;
    }

    //INSERT DATA
    async insertData(aggrFunName, aggrFunCode, projectName) {
        const client = await this.pool.connect();
        let res;
        try {
            const id = uuid.v4();
            const queryText = `INSERT INTO data (id, aggregationfunctionname, aggregationfunctioncode, projectname) VALUES($1,$2,$3,$4)`;
            const queryParams = [id, aggrFunName, aggrFunCode, projectName];
            res = await client.query(queryText, queryParams);
        } finally {
            client.release()
        }
        return res;
    }

    //INSERT MULTIPLE DATA 
    async insertMultipleData(data, deviceID, tagID, roleID, projectName) {
        const client = await this.pool.connect();
        let res;
        try {
            const queryTextData = `INSERT INTO data (id, aggregationfunctionname, aggregationfunctioncode, projectname) VALUES($1,$2,$3,$4)`;
            const queryTextAlarm = `INSERT INTO alarms (id, threshold, type, dataid, activated) VALUES($1,$2,$3,$4,$5)`;
            const queryTextAccording = `INSERT INTO according (tagid, dataid) VALUES($1,$2)`;
            const queryTextAccess = `INSERT INTO access (roleid, dataid) VALUES($1,$2)`;
            const queryTextSent = `INSERT INTO sent (deviceid, dataid) VALUES($1,$2)`;
            for (let item of data) {
                const dataID = uuid.v4();
                //CREATE DATA
                await client.query(queryTextData, [dataID, item.aggregationFunctionName, item.aggregationFunctionCode, projectName]);
                //CREATE ALARM
                for (let alm of item.alarm) {
                    const almID = uuid.v4();
                    await client.query(queryTextAlarm, [almID, alm.threshold, alm.type, dataID, true]);
                }
                //CREATE ACCORDING
                for (let tag of item.keyword) {
                    await client.query(queryTextAccording, [tagID[tag], dataID]);
                }
                //CREATE SENT
                for (let dev of item.device) {
                    await client.query(queryTextSent, [deviceID[dev], dataID]);
                }
                //CREATE ACCESS
                for (let admRoles of item.admittedroles) {
                    await client.query(queryTextAccess, [roleID[admRoles], dataID]);
                }

            }
            res = 'end';
        } finally {
            client.release()
        }
        return res;
    }

    //INSERT ROLE
    async insertRole(projectName, names) {
        const client = await this.pool.connect();
        let res = {};
        try {
            const queryText = `INSERT INTO roles VALUES($1,$2,$3)`
            for (let name of names) {
                const id = uuid.v4();
                res[name] = id;
                const queryParams = [id, name, projectName];
                await client.query(queryText, queryParams);
            }
        } finally {
            client.release()
        }
        return res;
    }

    //INSERT DEVICE
    async insertDevice(devicesName, projectName) {
        const client = await this.pool.connect();
        let res = {};
        try {
            const queryText = `INSERT INTO devices (id, name, projectname) VALUES($1,$2,$3)`;
            for (let deviceName of devicesName) {
                const id = uuid.v4();
                res[deviceName] = id;
                const queryParams = [id, deviceName, projectName];
                await client.query(queryText, queryParams);
            }
        } finally {
            client.release()
        }
        return res;
    }

    //INSERT TAG
    async insertTag(tagsName, projectName) {
        const client = await this.pool.connect();
        let res = {};
        try {
            const queryText = `INSERT INTO tags (id, name, projectname) VALUES($1,$2,$3)`;
            for (let tagName of tagsName) {
                const id = uuid.v4();
                res[tagName] = id;
                const queryParams = [id, tagName, projectName];
                await client.query(queryText, queryParams);
            }
        } finally {
            client.release()
        }
        return res;
    }

    //INSERT ACCORDING
    async insertAccording(tagId, dataId, projectName) {
        const client = await this.pool.connect();
        let res;
        try {
            //verify that dataID and tagID are of the same project
            const verifyText = ` 
            SELECT * 
                FROM tags, data
                WHERE tags.projectname = data.projectname
                    AND tags.projectname = $1
                    AND tags.id = $2
                    AND data.id = $3
            ;`;
            const verifyParams = [projectName, tagId, dataId]
            const verify = await client.query(verifyText, verifyParams);

            if (!verify.rows[0]) {
                throw new Error('can\'t insert');
            }

            const id = uuid.v4();
            const queryText = `INSERT INTO according (tagid, dataid) VALUES($1,$2)`;
            const queryParams = [tagId, dataId];
            res = await client.query(queryText, queryParams);
        } finally {
            client.release()
        }
        return res;
    }

    //INSERT FLEETS
    async insertFleet(fleetid, projectName) {
        const client = await this.pool.connect();
        let res;
        try {
            const id = uuid.v4();
            const queryText = `INSERT INTO fleets (id, zdmfleetid, projectname) VALUES($1,$2,$3)`;
            const queryParams = [id, fleetid, projectName];
            res = await client.query(queryText, queryParams);
            return id;
        } finally {
            client.release()
        }
    }

    //INSERT SUPERUSER
    async insertSuperUser(username, password) {
        const client = await this.pool.connect();
        let res;
        try {
            //verify username does not exist
            let res = await client.query(
                `SELECT * FROM superusers WHERE username = $1`,
                [username]
            );

            if (res.rows[0]) {
                return 'username already exixsts';
            }

            const psw = await bcrypt.hash(password, 5);

            const queryText = `INSERT INTO superusers (username, password) VALUES($1,$2)`;
            const queryParams = [username, psw];
            res = await client.query(queryText, queryParams);
        } finally {
            client.release()
        }
        return res;
    }

    //INSERT USERS
    async insertUsers(users, projectName, roleId) {
        const client = await this.pool.connect();
        let res;
        try {
            const queryText = `INSERT INTO users VALUES($1,$2,$3,$4,$5)`;
            for (let user of users) {
                const id = uuid.v4();
                const psw = await bcrypt.hash(user.pass, 5);
                const queryParams = [id, user.name, psw, projectName, roleId[user.role]];
                res = await client.query(queryText, queryParams);
            }
        } finally {
            client.release()
        }
        return res;
    }

    //INSERT USER
    async  insertUser(username, password, projectName, fleets) {
        const client = await this.pool.connect();
        try {

            //verify username does not exist
            let res = await client.query(
                `SELECT username FROM users WHERE username = $1 AND projectname = $2`,
                [username, projectName]
            );

            if (res.rows[0]) {
                return 'username already exixsts';
            }

            const id = uuid.v4();
            const psw = await bcrypt.hash(password, 5);

            //insert user
            await client.query(
                `INSERT INTO users VALUES($1,$2,$3,$4)`,
                [id, username, psw, projectName]
            );

            //insert fleets
            let fleetQuery = '';
            for (let i = 0; i < fleets.length; i++) {
                if (i == 0)
                    fleetQuery += `('${fleets[i]}'`
                else
                    fleetQuery += `,'${fleets[i]}' `
            }
            fleetQuery += ')';

            const fleetsIds = await client.query(
                `SELECT id FROM fleets WHERE projectname = $1 AND zdmfleetid IN ${fleetQuery}`,
                [projectName]
            );

            for (let item of fleetsIds.rows) {
                await client.query(
                    'INSERT INTO access (userid,fleetid) VALUES($1,$2)',
                    [id, item.id]
                )
            }

            return id;
        } finally {
            client.release()
        }

    }

    //INSERT ALARMS
    async insertAlarms(threshold, type, dataid) {
        const client = await this.pool.connect();
        let res;
        try {
            const id = uuid.v4();
            const queryText = `INSERT INTO alarms (id, threshold, type, dataid) VALUES($1,$2,$3,$4)`;
            const queryParams = [id, threshold, type, dataid];
            res = await client.query(queryText, queryParams);
        } finally {
            client.release()
        }
        return res;
    }

    //INSERT TOKEN IN BLACKLIST
    async insertTokenInBlackList(token, expirationdate) {
        const client = await this.pool.connect();
        let res;
        try {
            const id = uuid.v4();
            const queryText = `INSERT INTO tokensblacklist (id, token, expirationdate)
            VALUES($1,$2,$3);`;
            const queryParams = [id, token, expirationdate];
            res = await client.query(queryText, queryParams);
        } finally {
            client.release()
        }
        return res;
    }
}

exports.PostgresDB = PostgresDB;