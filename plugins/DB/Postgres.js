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

    async findTokenById(personId) {
        const data = await this.pool.query('SELECT * FROM token WHERE person_id = $1', [personId]);
        return data.rows[0] ? Token.convertFromDB(data.rows[0]) : null;
    }

    async findTokenByRefresh(refresh) {
        const data = await this.pool.query('SELECT * FROM token WHERE refresh_token = $1', [refresh]);
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
                person.isActivated,
                person.activationLink,
            ]);
        
            return data.rows[0] ? Person.convertFromDB(data.rows[0]) : null;
    }

    async createToken(token) {
        const data = await this.pool.query(
            'INSERT INTO token (person_id, refresh_token) VALUES ($1, $2) RETURNING *', 
            [
                token.personId,
                token.refreshToken,
            ]);
        
            return data.rows[0] ? Token.convertFromDB(data.rows[0]) : null;
    }

    async updatePerson(person) {
        await this.pool.query(
            'UPDATE person SET nickname = $1, email = $2, password = $3, is_activated = $4, activation_link = $5 WHERE id = $6', 
            [
                person.nickname,
                person.email, 
                person.password,
                person.isActivated,
                person.activationLink,
                person.id,
            ]);
    }

    async updateToken(token) {
        await this.pool.query(
            'UPDATE token SET refresh_token = $1 WHERE person_id = $2', 
            [
                token.refreshToken,
                token.personId,
            ]);
    }

    async deleteToken(token) {
        const data = await this.pool.query(
            'DELETE FROM token WHERE refresh_token = $1 RETURNING *',
            [token]
        );
        console.log(data.rows[0])
        return data.rows[0] ? Token.convertFromDB(data.rows[0]) : null;
    }
}

module.exports = new PGPool();