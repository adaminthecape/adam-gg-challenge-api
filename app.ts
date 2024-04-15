import express from 'express';
import redis, { RedisClientType } from 'redis';
import cors from 'cors';
import { config as configureEnv } from 'dotenv';
import { IReq, IRes } from './sharedTypes';
import { handleError } from './utils';
import todos from './routes/todos';
import { Database, redisGet, redisSet } from './models/Database';
import md5 from 'md5';
import auth from './routes/auth';
import weather from './routes/weather';
import path from 'path';
import showdown from 'showdown';
import fs from 'node:fs';
import { endpoints } from './docs/endpoints';
import { EnvironmentService } from './models/EnvironmentService';
import defaultUsers from './defaultData/users.json';

configureEnv();

const configService = new EnvironmentService(process.env);

const app = express();

export class RedisHelpers {
	/**
	 * Initialise the Redis client and connect to it.
	 * @returns Redis in-memory database interface, basically
	 */
	public static async getRedisClient(): Promise<any> {
		const client = redis.createClient({
			legacyMode: true,
			url: `redis://${configService.get(
				'REDIS_HOST'
			)}:${configService.get('REDIS_PORT')}`,
		});

		client.on('error', (error: unknown) =>
			console.error('Redis ERROR:', error)
		);

		await client?.connect?.();

		return client;
	}
}

export class AuthHelpers {
	constructor() {}

	/**
	 * Given a username and password, validate that the username exists and
	 * that the password matches the hashed password in the database.
	 */
	public static async validateUser(
		req: IReq,
		username: string,
		password: string
	): Promise<{ userId: string }> {
		try {
			// get this user from the db
			const db = await Database.getInstance(req);

			const users = await db.query('users');

			const user = users?.find((u) => u.username === username);

			if (!user) {
				throw new Error('No matching users!');
			}

			// compare the hashed passwords
			if (md5(password) !== user.password) {
				throw new Error('No matching users!');
			}

			return { userId: username };
		} catch (e) {
			handleError({
				message: 'Failed to validate user! Username: ' + username,
			});

			return { userId: '' };
		}
	}

	/**
	 * Decode the token into a username and password.
	 * @param token
	 */
	public static decodeBasicAuth(token: string): string[] {
		const defaultResult = ['', ''];
		const prefix = 'Basic ';

		if (!token?.startsWith(prefix)) return defaultResult;

		const [_, authString] = token.split(prefix);

		if (!authString) return defaultResult;

		const decoded = atob(authString);

		const [username, password] = decoded.split(':');

		return [username, password];
	}

	/**
	 * Decode the token if available, and verify the user; if the user is not
	 * validated against the database using the password in the token, the
	 * request cannot proceed.
	 * @param req
	 * @param res
	 * @param next
	 */
	public static async setUserInReq(
		req: IReq,
		res: IRes,
		next: any
	): Promise<any> {
		console.log(`\n******** New Request: ${req.url} ********`);
		try {
			const db = await Database.getInstance(req);

			// ensure there is a user to query
			await AuthHelpers.setDefaultUser({ db, query: {} });

			// Decode the token, get the user's id, and add it to the req
			const { url, params, query, body } = req;

			if (url === '/docs') {
				return next();
			}

			if (!req.headers.authorization) {
				console.log('No authorization!', {
					auth: req.headers.authorization,
					url,
					params,
					query,
					body,
				});

				return res.sendStatus(403);
			}

			const [username, password] = AuthHelpers.decodeBasicAuth(
				req.headers.authorization || ''
			);

			const userData = await AuthHelpers.validateUser(
				req,
				username,
				password
			);

			if (!userData?.userId) {
				console.log('User failed validation!', {
					auth: req.headers.authorization,
					url,
					params,
					query,
					body,
					userData,
				});

				return res.sendStatus(403);
			}

			req.currentUser = userData;

			console.log('Authenticated for route:', req.url);

			req.db = redisClient;
			req.config = configService;

			next();
		} catch (e) {
			handleError({
				message: 'Could not validate user',
				error: e,
			});

			return res.sendStatus(500);
		}
	}

	/**
	 * Pre-fill the database with a basic user to enable using the API.
	 * @param req
	 * @param res
	 * @param next
	 */
	public static async setDefaultUser(req: IReq): Promise<any> {
		console.log(`\n******** Setting default users ********`);
		try {
			if (!(defaultUsers && typeof defaultUsers === 'object')) {
				throw new Error('Could not get default users!');
			}

			const existingUsers = await redisGet(redisClient, 'users');

			if (!existingUsers) {
				await redisSet(redisClient, 'users', defaultUsers.users);
			}
		} catch (e) {
			handleError({
				message: 'Could not pre-fill users',
				error: e,
			});

			return;
		}
	}
}

let redisClient: RedisClientType;

// Initiate the in-memory database
// This format avoids error TS1378 (top-level await) in tests
(async () => {
	redisClient = await RedisHelpers.getRedisClient();
})();
// Set users, if none exist
(async () => {
	redisClient = await AuthHelpers.setDefaultUser();
})();

/**
 * Go to <API url>/docs to see the output.
 */
app.get('/docs', async (req, res) => {
	const converter = new showdown.Converter();
	const text = fs.readFileSync(path.resolve('docs', 'readme.md'), 'utf8');

	const { todos, auth, weather } = endpoints;

	let endpointData = '';

	[todos, auth, weather].forEach((type) => {
		Object.entries(type).forEach(([name, data]) => {
			endpointData += `\n### \`${name}\` - ${data.summary}\n`;
			endpointData += `${data.description}\n`;
			endpointData += `#### Parameters\n* ${data.params.join('\n* ')}\n`;
			endpointData += `#### Responses\n* ${Object.entries(data.responses)
				.reduce((agg, [key, value]) => {
					return agg.concat(`${key} - ${value}` as any);
				}, [])
				.join('\n* ')}\n`;
		});
	});

	const html = converter.makeHtml(`${text}\n${endpointData}`);

	res.set('Content-Type', 'text/html');
	res.send(
		Buffer.from(
			`<html><body><div style="margin:1rem">${html}</div></body></html>`
		)
	);
});

// Specify origin URL - you must set your Origin header to this
app.use(
	cors({
		origin: configService.get('UI_ORIGIN_URL'),
	})
);

// Auth for all routes defined below here
app.use(AuthHelpers.setUserInReq);

app.use('/todos', todos);
app.use('/auth', auth);
app.use('/weather', weather);

export default app;
