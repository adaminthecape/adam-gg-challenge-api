import { IReq, IRes, Todo } from '../sharedTypes';
import { Database } from '../models/Database';
import { handleError } from '../utils';
import defaultTodos from '../defaultData/todos.json';

export function mergeTodoData(
	existingData: Partial<Todo> | undefined,
	newData: Partial<Todo> | undefined
): Todo {
	try {
		const mergedData = {
			...(existingData || {}),
			...(newData || {}),
		};

		mergedData.updated = Date.now();

		if (!mergedData.created) {
			mergedData.created = mergedData.updated;
		}

		if (!mergedData.note) {
			mergedData.note = '';
		}

		return mergedData as Todo;
	} catch (e) {
		return existingData as Todo;
	}
}

export async function getAllTodos(req: IReq, res: IRes): Promise<IRes> {
	try {
		const db = await Database.getInstance(req, true);

		const todos = await db.query('todos');

		if (!todos) {
			return res.status(404).json({ success: false });
		}

		return res.status(200).json({ success: true, todos });
	} catch (e) {
		handleError({
			message: 'Failed to get all todos',
			error: e,
			user: req.currentUser.userId,
		});

		return res.status(500).json({ success: false, todos: [] });
	}
}

export async function getSingleTodo(req: IReq, res: IRes): Promise<IRes> {
	const { id: todoId } = req.params;

	try {
		if (!todoId) {
			throw new Error(`Bad todo id: "${todoId}"`);
		}

		const db = await Database.getInstance(req, true);

		const todos = await db.query('todos');

		if (!todos || typeof todos !== 'object') {
			throw new Error('No todos to search within!');
		}

		console.log({ todos });

		const { [todoId]: todo } = todos;

		console.log({ todo });

		if (!todo) {
			return res.status(404).json({ success: false });
		}

		return res.status(200).json({ success: true, todo });
	} catch (e) {
		handleError({
			message: `Failed to get single todo (id: ${todoId})`,
			error: e,
			user: req.currentUser.userId,
		});

		return res.status(500).json({ success: false, todo: null });
	}
}

export async function createTodos(req: IReq, res: IRes): Promise<IRes> {
	let todosToAdd = req.body?.todos || req.query.todos;

	if (todosToAdd && typeof todosToAdd === 'string') {
		try {
			todosToAdd = JSON.parse(todosToAdd);
		} catch (e) {
			//
		}
	}

	try {
		if (!(Array.isArray(todosToAdd) && todosToAdd.length)) {
			throw new Error(`Bad todo data to add!`);
		}

		const db = await Database.getInstance(req);

		let todos = (await db.query('todos')) || {};

		todosToAdd.forEach((todo) => {
			todos[crypto.randomUUID()] = mergeTodoData(undefined, todo);
		});

		await db.update('todos', todos);

		return res
			.status(200)
			.json({ success: true, todosUpdated: todosToAdd.length });
	} catch (e) {
		handleError({
			message: 'Failed to create todos',
			error: e,
			user: req.currentUser.userId,
		});

		return res.status(500).json({ success: false, todos: [] });
	}
}

export async function updateSingleTodo(req: IReq, res: IRes): Promise<IRes> {
	const { id: todoId } = req.params;
	const data = req.body?.data || req.query.data;

	try {
		if (!todoId) {
			throw new Error(`Bad todo id: "${todoId}"`);
		}

		if (!data || typeof data !== 'object') {
			throw new Error(`Bad data: "${data}"`);
		}

		const db = await Database.getInstance(req, true);

		const todos = await db.query('todos');

		const { [todoId]: todo } = todos;

		if (!todo || typeof todo !== 'object') {
			return res.status(404).json({ success: false });
		}

		const updatedTodo = {
			...todo,
			...data,
			updated: Date.now(),
		};

		todos[todoId] = updatedTodo;

		await db.update('todos', todos);

		return res.status(200).json({ success: true, updatedTodo });
	} catch (e) {
		handleError({
			message: `Failed to update single todo (id: ${todoId})`,
			error: e,
			user: req.currentUser.userId,
		});

		return res.status(500).json({ success: false, error: e.message });
	}
}

export async function removeSingleTodo(req: IReq, res: IRes): Promise<IRes> {
	const { id: todoId } = req.params;

	try {
		if (!todoId) {
			throw new Error(`Bad todo id: "${todoId}"`);
		}

		const db = await Database.getInstance(req);

		const todos = await db.query('todos');

		if (todoId in todos) {
			delete todos[todoId];
		} else {
			return res.status(404).json({ success: false });
		}

		const { [todoId]: todo } = todos;

		if (todo) {
			throw new Error('Todo was not removed!');
		}

		await db.update('todos', todos);

		return res.status(200).json({ success: true, removed: todoId });
	} catch (e) {
		handleError({
			message: `Failed to remove single todo (id: ${todoId})`,
			error: e,
			user: req.currentUser.userId,
		});

		return res.status(500).json({ success: false, error: e.message });
	}
}

export async function importDefaultTodos(req: IReq, res: IRes): Promise<IRes> {
	try {
		await setDefaultTodos(req);

		return res.status(200).json({ success: true });
	} catch (e) {
		handleError({
			message: 'Failed to create default todos',
			error: e,
			user: req.currentUser.userId,
		});

		return res.status(500).json({ success: false });
	}
}

export async function setDefaultTodos(req: IReq): Promise<void> {
	if (!(defaultTodos && typeof defaultTodos === 'object')) {
		throw new Error('Could not get default todos!');
	}

	const db = await Database.getInstance(req);

	const existingTodos = await db.query('todos');

	if (!req.query.force && existingTodos) {
		throw new Error('Some todos exist! Use `force` to override');
	}

	await db.update('todos', defaultTodos);
}
