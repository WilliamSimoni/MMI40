const { Pool, Client } = require('pg');
const { time } = require('../../FIBO_modules/time');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const { PostgreCore } = require('./core.database');
const { query } = require('./search.database');

class PostgresDBInsert extends PostgreCore {

    constructor() {
        super();
    }

    //INSERT PROJECT
    async insertProject(projectName, token, workspace) {
        const client = await this.pool.connect();
        let res;
        try {
            const cryptedToken = await bcrypt.hash(token, BCRYPT_SALT);
            const queryText = `INSERT INTO project (name, token, workspaceuid) VALUES($1,$2,$3)`;
            const queryParams = [projectName, cryptedToken, workspace];
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

    //INSERT ROLE
    async insertRole(projectName, name) {
        const client = await this.pool.connect();
        let res;
        try {
            const id = uuid.v4();
            const queryText = `INSERT INTO roles VALUES($1,$2,$3)`
            const queryParams = [id, name, projectName];
            res = await client.query(queryText, queryParams);
        } finally {
            client.release()
        }
        return res;
    }

    //INSERT DEVICE
    async insertDevice(deviceName, projectName) {
        const client = await this.pool.connect();
        let res;
        try {
            const id = uuid.v4();
            const queryText = `INSERT INTO devices (id, name, projectname) VALUES($1,$2,$3)`;
            const queryParams = [id, deviceName, projectName];
            res = await client.query(queryText, queryParams);
        } finally {
            client.release()
        }
        return res;
    }

    //INSERT TAG
    async insertTag(tagName, projectName) {
        const client = await this.pool.connect();
        let res;
        try {
            const id = uuid.v4();
            const queryText = `INSERT INTO tags (id, name, projectname) VALUES($1,$2,$3)`;
            const queryParams = [id, tagName, projectName];
            res = await client.query(queryText, queryParams);
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

    //INSERT SENT
    async insertSent(deviceId, dataId, projectName) {
        const client = await this.pool.connect();
        let res;
        try {
            //verify that dataID and deviceID are of the same project
            const verifyText = ` 
            SELECT * 
                FROM devices, data
                WHERE devices.projectname = data.projectname
                    AND devices.projectname = $1
                    AND devices.id = $2
                    AND data.id = $3
            ;`;
            const verifyParams = [projectName, deviceId, dataId]
            const verify = await client.query(verifyText, verifyParams);

            if (!verify.rows[0]) {
                throw new Error('can\'t insert');
            }

            const id = uuid.v4();
            const queryText = `INSERT INTO sent (deviceid, dataid) VALUES($1,$2)`;
            const queryParams = [deviceId, dataId];
            res = await client.query(queryText, queryParams);
        } finally {
            client.release()
        }
        return res;
    }

    //INSERT USER
    async insertUser(username, password, projectName, role) {
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

            //find roleID
            const roleID = await client.query(
                `SELECT id FROM roles WHERE name = $1 AND projectname = $2`,
                [role, projectName]
            );

            if (!roleID.rows[0]) {
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
    async putTokenInBlackList(token, projectName) {
        const client = await pool.connect();
        let res;
        try {
            const id = uuid.v4();
            const queryText = `INSERT INTO tokensblacklist (id, token, expirationdate, projectname)
            VALUES($1,$2,$3,$4);`;
            const queryParams = [id, token, time.add(time.now(), 24, 'hour'), projectName];
            res = await client.query(queryText, queryParams);
        } finally {
            client.release()
        }
        return res;
    }

}

exports.PostgresDBInsert = PostgresDBInsert;