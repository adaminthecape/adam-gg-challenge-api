import express from 'express';
import cors from 'cors';
import { config as configureEnv } from 'dotenv';
import { importDefaultUsers } from '../controllers/auth';

const auth = express.Router();

configureEnv();

auth.use(
	cors({
		origin: process.env.UI_ORIGIN_URL,
	})
);

/**
 * @oas [post] /auth/importDefaultUsers
 * description: "Import the default user(s) into the database."
 * summary: "Import users"
 * tags:
 *   - todos
 * parameters:
 *   - (query) force {Boolean} Whether to overwrite existing data
 * responses:
 *   "200":
 *     description: Users were successfully imported.
 *   "500":
 *     description: Something went wrong; users may not have been imported.
 */
auth.post('/importDefaultUsers', importDefaultUsers);

export default auth;
