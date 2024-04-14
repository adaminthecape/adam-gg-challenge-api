import { IReq, IRes } from '../sharedTypes';
import { Database } from '../models/Database';
import { handleError } from '../utils';
import defaultUsers from '../defaultData/users.json';

export async function importDefaultUsers(req: IReq, res: IRes): Promise<IRes> {
	try {
		await setDefaultUsers(req);

		return res.status(200).json({ success: true });
	} catch (e) {
		handleError({
			message: 'Failed to create default users',
			error: e,
			user: req.currentUser.userId,
		});

		return res.status(500).json({ success: false });
	}
}

export async function setDefaultUsers(req: IReq): Promise<void> {
	if (!(defaultUsers && typeof defaultUsers === 'object')) {
		throw new Error('Could not get default users!');
	}

	const db = await Database.getInstance(req);

	const existingUsers = await db.query('users');

	if (!req.query.force && existingUsers) {
		throw new Error('Some users exist! Use `force` to override');
	}

	await db.update('users', defaultUsers.users);
}
