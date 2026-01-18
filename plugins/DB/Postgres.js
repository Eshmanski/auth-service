const Person = require('../../models/person');
const pg = require('pg');

class PGPool {
	pool;

	constructor() {
		const config = {
			user: process.env.DB_PGS_USER,
			host: process.env.DB_PGS_HOST,
			database: process.env.DB_PGS_NAME,
			password: process.env.DB_PGS_PASSWORD,
			port: process.env.DB_PGS_PORT
		}

		this.pool = new pg.Pool(config);
	}

	async findPersonAll() {
		const data = await this.pool.query('SELECT * FROM auth.person');
		return data.rows.map(row => Person.convertFromDB(row));
	}

	async findPersonById(id) {
		const data = await this.pool.query('SELECT * FROM auth.person WHERE id = $1', [id]);
		return data.rows[0] ? Person.convertFromDB(data.rows[0]) : null;
	}

	async findPersonByEmail(email) {
		const data = await this.pool.query('SELECT * FROM auth.person WHERE email = $1', [email]);
		return data.rows[0] ? Person.convertFromDB(data.rows[0]) : null;
	}

	async findPersonByLink(link) {
		const data = await this.pool.query('SELECT * FROM auth.person WHERE activation_link = $1', [link]);

		if (data.rows.length === 0) return null;
		return Person.convertFromDB(data.rows[0]);
	}

	async createPerson(person) {
		const data = await this.pool.query(
			'INSERT INTO auth.person (email, password, superuser, is_activated, activation_link) VALUES ($1, $2, $3, $4, $5) RETURNING *',
			[
				person.email,
				person.password,
				person.superuser,
				person.is_activated,
				person.activation_link,
			]);

		return data.rows[0] ? Person.convertFromDB(data.rows[0]) : null;
	}

	async updatePerson(person) {
		await this.pool.query(
			'UPDATE auth.person SET email = $1, password = $2, is_activated = $3, activation_link = $4 WHERE id = $5',
			[
				person.email,
				person.password,
				person.is_activated,
				person.activation_link,
				person.id,
			]);
	}
}

module.exports = new PGPool();