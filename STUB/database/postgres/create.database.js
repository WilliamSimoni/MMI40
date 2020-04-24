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

        //CREATE SUPER USER
        if (dbTablesName.indexOf('superusers') === -1) {
            const res = await client.query(
                `CREATE TABLE superusers
                        (
                            username text NOT NULL,
                            password text NOT NULL,
                            PRIMARY KEY (username)
                        )
                        WITH (
                            OIDS = FALSE
                        );
                    `);
            console.log(res);
        }

        //CREATE PROJECT IF IT DOES NOT EXIST

        if (dbTablesName.indexOf('project') === -1) {
            const res = await client.query(
                `CREATE TABLE project
                (
                    name text NOT NULL,
                    token text NOT NULL,
                    tokenexpires bigint NOT NULL,
                    workspaceuid text NOT NULL,
                    zdmemail text NOT NULL,
                    zdmpassword text NOT NULL,
                    superuser text NOT NULL,
                    PRIMARY KEY (name),
                    FOREIGN KEY (superuser)
                        REFERENCES superusers (username) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE CASCADE
                        NOT VALID
                )
                WITH (
                    OIDS = FALSE
                );
                
            `);
            console.log(res);
        }

        //CREATE FLEETS
        
        if (dbTablesName.indexOf('fleets') === -1) {
            const res = await client.query(
                `CREATE TABLE fleets
                (
                    id uuid NOT NULL,
                    name text,
                    zdmfleetid text NOT NULL,
                    projectname text NOT NULL,
                    PRIMARY KEY (id),
                    UNIQUE (zdmfleetid, projectname),
                    FOREIGN KEY (projectname)
                        REFERENCES project (name) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE CASCADE
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
                        ON DELETE CASCADE
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
                    aggregationfunction text NOT NULL,
                    projectname text NOT NULL,
                    PRIMARY KEY (id),
                    FOREIGN KEY (projectname)
                        REFERENCES project (name) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE CASCADE
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
                    active boolean NOT NULL,
                    PRIMARY KEY (id),
                    FOREIGN KEY (dataid)
                        REFERENCES data (id) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE CASCADE
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
                PRIMARY KEY (id),
                UNIQUE (username, projectname),
                FOREIGN KEY (projectname)
                    REFERENCES project (name) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE CASCADE
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
                userid uuid NOT NULL,
                fleetid uuid NOT NULL,
                PRIMARY KEY (userid, fleetid),
                FOREIGN KEY (userid)
                    REFERENCES users (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE CASCADE
                    NOT VALID,
                FOREIGN KEY (fleetid)
                    REFERENCES fleets (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE CASCADE
                    NOT VALID
            )
            WITH (
                OIDS = FALSE
            );
            `);
            console.log(res);
        }

        //CREATE RELATIVE
        if (dbTablesName.indexOf('relative') === -1) {
            const res = await client.query(
                `CREATE TABLE relative
                (
                    dataid uuid NOT NULL,
                    fleetid uuid NOT NULL,
                    PRIMARY KEY (dataid, fleetid),
                    FOREIGN KEY (dataid)
                        REFERENCES data (id) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE CASCADE
                        NOT VALID,
                    FOREIGN KEY (fleetid)
                        REFERENCES fleets (id) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE CASCADE
                        NOT VALID
                )
                WITH (
                    OIDS = FALSE
                );
            `);
            console.log(res);
        }

        //CREATE TAGGROUP
        if (dbTablesName.indexOf('taggroup') === -1) {
            const res = await client.query(
                `CREATE TABLE taggroup
                (
                    id uuid NOT NULL,
                    dataid uuid NOT NULL,
                    PRIMARY KEY (id),
                    FOREIGN KEY (dataid)
                        REFERENCES data (id) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE CASCADE
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
                    groupid uuid NOT NULL,
                    PRIMARY KEY (tagid, groupid),
                    FOREIGN KEY (tagid)
                        REFERENCES tags (id) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE CASCADE
                        NOT VALID,
                    FOREIGN KEY (groupid)
                        REFERENCES taggroup (id) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE CASCADE
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
                    PRIMARY KEY (id)
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

//EXEC
createDatabase(pool)
    .catch(error => console.error(error));