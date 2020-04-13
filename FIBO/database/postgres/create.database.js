const { Pool, Client } = require('pg');

async function createDatabase(pool) {

    //Note: all the tables are put in public schema

    const client = await pool.connect();

    try {
        //list tables contained in database
        const dbTables = await client.query(
            ` 
            SELECT
                *
            FROM
                pg_catalog.pg_tables
            WHERE
                schemaname != 'pg_catalog'
            AND schemaname != 'information_schema';
            `
        );

        //extract name from result
        const dbTablesName = (() => {
            const result = [];
            for (let table of dbTables.rows) {
                result.push(table.tablename);
            }
            return result;
        })();

        console.log(dbTablesName);

        //CREATE PROJECT IF IT DOES NOT EXIST

        if (dbTablesName.indexOf('project') === -1) {
            const res = await client.query(
                `CREATE TABLE project
                (
                    name text NOT NULL,
                    token text NOT NULL,
                    workspaceuid text NOT NULL,
                    PRIMARY KEY (name)
                )
                WITH (
                    OIDS = FALSE
                );
            `);
            console.log(res);
        }

        //CREATE DEVICES

        if (dbTablesName.indexOf('devices') === -1) {
            const res = await client.query(
                `CREATE TABLE devices   
                (
                    id uuid NOT NULL,
                    name text NOT NULL,
                    projectname text NOT NULL,
                    PRIMARY KEY (id),
                    UNIQUE (name, projectname),
                    FOREIGN KEY (projectname)
                        REFERENCES project (name) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE NO ACTION
                        NOT VALID
                )
                WITH (
                    OIDS = FALSE
                );
            `);
            console.log(res);
        }

        //CREATE TAGS

        if (dbTablesName.indexOf('tags') === -1) {
            const res = await client.query(
                `CREATE TABLE tags
                (
                    id uuid NOT NULL,
                    name text NOT NULL,
                    projectname text NOT NULL,
                    PRIMARY KEY (id),
                    UNIQUE (name, projectname),
                    FOREIGN KEY (projectname)
                        REFERENCES project (name) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE NO ACTION
                        NOT VALID
                )
                WITH (
                    OIDS = FALSE
                );
            `);
            console.log(res);
        }

        //CREATE DATA
        if (dbTablesName.indexOf('data') === -1) {
            const res = await client.query(
                `CREATE TABLE data
                (
                    id uuid NOT NULL,
                    aggregationfunctionname text NOT NULL,
                    aggregationfunctioncode int NOT NULL,
                    projectname text NOT NULL,
                    PRIMARY KEY (id),
                    FOREIGN KEY (projectname)
                        REFERENCES project (name) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE NO ACTION
                        NOT VALID
                )
                WITH (
                    OIDS = FALSE
                );
                
            `);
            console.log(res);
        }

        //CREATE ALARM
        if (dbTablesName.indexOf('alarms') === -1) {

            //CREATE TYPE ALARMTYPE
            const typeRes = await client.query(
                `
                CREATE TYPE alarmtype AS ENUM
                    ('min', 'max');
            `);

            console.log(typeRes);

            const res = await client.query(
                `CREATE TABLE alarms
                (
                    id uuid NOT NULL,
                    threshold integer NOT NULL,
                    type alarmtype NOT NULL,
                    dataid uuid NOT NULL,
                    PRIMARY KEY (id),
                    FOREIGN KEY (dataid)
                        REFERENCES data (id) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE NO ACTION
                        NOT VALID
                )
                WITH (
                    OIDS = FALSE
                );
            `);
            console.log(res);
        }

        //CREATE ROLES
        if (dbTablesName.indexOf('roles') === -1) {
            const res = await client.query(
                `CREATE TABLE roles
            (
                id uuid NOT NULL,
                name text NOT NULL,
                projectname text NOT NULL,
                PRIMARY KEY (id),
                UNIQUE (name, projectname),
                FOREIGN KEY (projectname)
                    REFERENCES project (name) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID
            )
            WITH (
                OIDS = FALSE
            );
            `);
            console.log(res);
        }

        //CREATE USERS
        if (dbTablesName.indexOf('users') === -1) {
            const res = await client.query(
                `CREATE TABLE users
            (
                id uuid NOT NULL,
                username text NOT NULL,
                password text NOT NULL,
                projectname text NOT NULL,
                roleid uuid NOT NULL,
                PRIMARY KEY (id),
                UNIQUE (username, projectname),
                FOREIGN KEY (projectname)
                    REFERENCES project (name) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID,
                FOREIGN KEY (roleid)
                    REFERENCES roles (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID
            )
            WITH (
                OIDS = FALSE
            );
            `);
            console.log(res);
        }

        //CREATE ACCESS

        if (dbTablesName.indexOf('access') === -1) {
            const res = await client.query(
                `CREATE TABLE access
            (
                roleid uuid NOT NULL,
                dataid uuid NOT NULL,
                PRIMARY KEY (roleid, dataid),
                FOREIGN KEY (roleid)
                    REFERENCES roles (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID,
                FOREIGN KEY (dataid)
                    REFERENCES data (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID
            )
            WITH (
                OIDS = FALSE
            );
            `);
            console.log(res);
        }

        //CREATE SENT
        if (dbTablesName.indexOf('sent') === -1) {
            const res = await client.query(
                `CREATE TABLE sent
                (
                    deviceid uuid NOT NULL,
                    dataid uuid NOT NULL,
                    PRIMARY KEY (deviceid, dataid),
                    FOREIGN KEY (deviceid)
                        REFERENCES devices (id) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE NO ACTION
                        NOT VALID,
                    FOREIGN KEY (dataid)
                        REFERENCES data (id) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE NO ACTION
                        NOT VALID
                )
                WITH (
                    OIDS = FALSE
                );
            `);
            console.log(res);
        }

        //CREATE ACCORDING
        if (dbTablesName.indexOf('according') === -1) {
            const res = await client.query(
                `CREATE TABLE according
                (
                    tagid uuid NOT NULL,
                    dataid uuid NOT NULL,
                    PRIMARY KEY (tagid, dataid),
                    FOREIGN KEY (tagid)
                        REFERENCES tags (id) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE NO ACTION
                        NOT VALID,
                    FOREIGN KEY (dataid)
                        REFERENCES data (id) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE NO ACTION
                        NOT VALID
                )
                WITH (
                    OIDS = FALSE
                );
        `);
            console.log(res);
        }

        //CREATE BLACKLIST
        if (dbTablesName.indexOf('tokensblacklist') === -1) {
            const res = await client.query(
                `CREATE TABLE tokensblacklist
                (
                    id uuid NOT NULL,
                    token text NOT NULL,
                    expirationdate bigint NOT NULL,
                    projectname text NOT NULL,
                    PRIMARY KEY (id),
                    FOREIGN KEY (projectname)
                        REFERENCES project (name) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE NO ACTION
                        NOT VALID
                )
                WITH (
                    OIDS = FALSE
                );
            `);
            console.log(res);
        }

    } finally {
        client.release()
    }
}

//EXEC
exports.createDatabase = createDatabase;