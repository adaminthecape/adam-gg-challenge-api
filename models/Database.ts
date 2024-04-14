import { config as configureEnv } from 'dotenv';
import { IReq } from '../sharedTypes';
import { handleError } from '../utils';
import redis, { RedisClientType } from 'redis';
import { EnvironmentService } from './EnvironmentService';

export async function redisGet(db: any, path: string): Promise<any> {
	// validate connection
	if (!db) {
		return undefined;
	}

	const response = await new Promise((resolve, reject) => {
		db.get(path, (err, reply) => {
			if (err) {
				console.error(err);

				reject(err);
			} else {
				resolve(reply);
			}
		});
	});

	return response;
}

export async function redisSet(db: any, path: string, data: any): Promise<any> {
	// validate connection
	if (!db) {
		return undefined;
	}

	try {
		if (data && typeof data === 'object') {
			data = JSON.stringify(data);
		}
	} catch (e) {
		console.warn('Failed to transform data!');
		return undefined;
	}

	const response = await new Promise((resolve, reject) => {
		db.set(path, data, (err, reply) => {
			if (err) {
				console.error(err);

				reject(err);
			} else {
				resolve(reply);
			}
		});
	});

	console.log('response:', path, response);

	return response;
}

export class Database {
	public static async getInstance(
		req: IReq,
		isDebug?: boolean
	): Promise<Database> {
		if (req.dbInstance) {
			return req.dbInstance;
		}

		const instance = new Database(req, isDebug);

		await instance.connect();

		req.dbInstance = instance;

		return req.dbInstance;
	}

	private req: IReq;
	private isDebug?: boolean;
	private connection: any;

	constructor(req: IReq, isDebug?: boolean) {
		this.req = req;
		this.isDebug = isDebug;
	}

	public get client() {
		return this.connection;
	}

	private debug(...messages: any) {
		if (this.isDebug) {
			console.log('DB (debug):', ...messages);
		}
	}

	public async release() {
		if (this.connection && typeof this.connection?.quit == 'function') {
			this.connection.quit();
		} else {
			this.debug('Failed to close connection');
		}
	}

	private async connect(): Promise<void> {
		if (this.connection) {
			return;
		}

		if (this.req.db) {
			this.connection = this.req.db;

			return;
		}

		try {
			configureEnv();

			const config = new EnvironmentService(process.env);

			const url = config.get('REDIS_HOST');
			const port = config.get('REDIS_PORT');

			const redisClient = redis.createClient({
				legacyMode: true,
				url: `redis://${url}:${port}`,
			});

			redisClient.on('error', (error: unknown) => {
				handleError({
					message: 'Redis Connect ERROR',
					error,
				});
			});

			await redisClient.connect();

			this.connection = redisClient;

			this.debug('connected to Redis:', !!this.connection);
		} catch (e) {
			handleError({
				message: 'DB Connect ERROR',
				error: e,
			});
		}
	}

	public async update<T = Record<string, any>>(
		path: string,
		data: T
	): Promise<any> {
		if (!this.connection) {
			this.debug('DB update ERROR: No connection!');
			return undefined;
		}

		this.debug('update:', path, data);

		const dataToSet =
			data && typeof data === 'object' ? JSON.stringify(data) : data;

		try {
			await redisSet(this.connection, path, dataToSet);
		} catch (e) {
			handleError({
				message: 'DB update ERROR',
				error: e,
			});

			return undefined;
		}
	}

	public async query(path: string): Promise<any> {
		if (!this.connection) {
			this.debug('DB query ERROR: No connection!');
			return undefined;
		}

		try {
			const data = await redisGet(this.connection, path);

			try {
				return JSON.parse(data);
			} catch (e) {
				return data;
			}
		} catch (e) {
			handleError({
				message: 'DB query ERROR',
				error: e,
			});

			return undefined;
		}
	}
}
