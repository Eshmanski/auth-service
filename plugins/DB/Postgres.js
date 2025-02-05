const Token = require('../../models/token');
const Person = require('../../models/person');

const pg = require('pg');

class PGPool {
    pool;

    constructor() {
        const config = {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT
        }

        this.pool = new pg.Pool(config);
    }

    async findPersonAll() {
        const data = await this.pool.query('SELECT * FROM person');
        return data.rows.map(row => Person.convertFromDB(row));
    }

    async findPersonById(id) {
        const data = await this.pool.query('SELECT * FROM person WHERE id = $1', [id]);
        return data.rows[0] ? Person.convertFromDB(data.rows[0]) : null;
    }

    async findPersonByEmail(email) {
        const data = await this.pool.query('SELECT * FROM person WHERE email = $1', [email]);
        return data.rows[0] ? Person.convertFromDB(data.rows[0]) : null;
    }

    async findToken(personId, device) {
        const data = await this.pool.query(
            'SELECT * FROM token WHERE person_id = $1 AND device_type = $2 AND browser_name = $3 AND browser_version = $4 AND os_name = $5 AND os_version = $6 AND ip_address = $7', 
            [personId, device.device_type, device.browser_name, device.browser_version, device.os_name, device.os_version, device.ip_address]
        );

        return data.rows[0] ? Token.convertFromDB(data.rows[0]) : null;
    }

    async findPersonByLink(link) {
        const data = await this.pool.query('SELECT * FROM person WHERE activation_link = $1', [link]);
        return Person.convertFromDB(data.rows[0]);
    }

    async createPerson(person) {
        const data = await this.pool.query(
            'INSERT INTO person (nickname, email, password, is_activated, activation_link) VALUES ($1, $2, $3, $4, $5) RETURNING *', 
            [
                person.nickname,
                person.email, 
                person.password,
                person.is_activated,
                person.activation_link,
            ]);
        
            return data.rows[0] ? Person.convertFromDB(data.rows[0]) : null;
    }

    async createToken(token) {
        const query = `
        INSERT INTO token (person_id, refresh_token, device_type, browser_name, browser_version, os_name, os_version, ip_address, created_at, last_used_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *;
        `;

        const values = [
            token.person_id,
            token.refresh_token,        
            token.device.device_type,
            token.device.browser_name,
            token.device.browser_version,
            token.device.os_name,
            token.device.os_version,
            token.device.ip_address,
        ];

        const data = await this.pool.query(query, values);
        return data.rows[0] ? Token.convertFromDB(data.rows[0]) : null;
    }

    async updatePerson(person) {
        await this.pool.query(
            'UPDATE person SET nickname = $1, email = $2, password = $3, is_activated = $4, activation_link = $5 WHERE id = $6', 
            [
                person.nickname,
                person.email, 
                person.password,
                person.is_activated,
                person.activation_link,
                person.id,
            ]);
    }

    async updateToken(token) {
        await this.pool.query(`
            UPDATE token SET 
                refresh_token = $1, 
                created_at = CURRENT_TIMESTAMP, 
                last_used_at = CURRENT_TIMESTAMP 
            WHERE 
                person_id = $2 AND 
                device_type = $3 AND 
                browser_name = $4 AND 
                browser_version = $5 AND 
                os_name = $6 AND 
                os_version = $7 AND 
                ip_address = $8
            `, 
            [
                token.refresh_token,
                token.person_id,
                token.device.device_type,
                token.device.browser_name,
                token.device.browser_version,
                token.device.os_name,
                token.device.os_version,
                token.device.ip_address,
            ]);
    }

    async deleteToken(tokenStr) {
        const data = await this.pool.query(
            'DELETE FROM token WHERE refresh_token = $1 RETURNING *',
            [tokenStr]
        );

        return data.rows[0] ? Token.convertFromDB(data.rows[0]) : null;
    }
}

module.exports = new PGPool();