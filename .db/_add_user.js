
require('dotenv').config();

const db = require('../plugins/DB/Postgres');
const Person = require('../models/person');
const bcrypt = require('bcrypt');

function getFlags() {
	const params = {};

	process.argv.forEach(arg => {
		if (!arg.includes('--')) return;

		const arr = arg.split('=');
		params[arr[0].replace('--', '')] = arr[1];
	});

	return params;
}

async function addUser(email, password) {
	try {
		const hashedPassword = await bcrypt.hash(password, 3);

		const person = new Person({
			email: email.toLowerCase(),
			password: hashedPassword,
			superuser: true,
			is_activated: true,
			activation_link: null,
		});

		await db.createPerson(person);
	} catch (error) {
		throw error;
	}
}

async function run() {
	const params = getFlags();

	if (!params.email || !params.password) {
		console.log('User and password are required');
		return;
	}

	let isError = false;

	try {
		await addUser(params.email, params.password);
	} catch (error) {
		isError = true
		console.log('Error');
		console.log(error);
	} finally {
		await db.pool.end();
		process.exit(isError ? 1 : 0);
	}
}


run();