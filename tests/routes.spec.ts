import request from 'supertest';
import app, { AuthHelpers, RedisHelpers } from '../app';
import { config as configureEnv } from 'dotenv';
import { Database } from '../models/Database';
import defaultTodos from '../defaultData/todos.json';
import defaultUsers from '../defaultData/users.json';
import { Todo, User } from '../sharedTypes';
import { EnvironmentService } from '../models/EnvironmentService';

configureEnv();

const config = new EnvironmentService(process.env);

class MockApiAdapter {
	public static get(path: string): any {
		return request(app)
			.get(path)
			.set('Authorization', `Basic ${config.get('BASIC_AUTH_TOKEN')}`);
	}

	public static async put(path: string, data: any): Promise<any> {
		const response = await request(app)
			.put(path)
			.query({ data })
			.set('Authorization', `Basic ${config.get('BASIC_AUTH_TOKEN')}`);

		return { status: response.statusCode, data: (response as any)._body };
	}

	public static async post(path: string, data: any): Promise<any> {
		const response = await request(app)
			.post(path)
			.query(data)
			.set('Authorization', `Basic ${config.get('BASIC_AUTH_TOKEN')}`);

		return { status: response.statusCode, data: (response as any)._body };
	}

	public static async del(path: string): Promise<any> {
		const response = await request(app)
			.delete(path)
			.set('Authorization', `Basic ${config.get('BASIC_AUTH_TOKEN')}`);

		return { status: response.statusCode, data: (response as any)._body };
	}
}

let mockData: { todos: Record<string, Todo>; users: User[] };
let mockDb: any;
let todoId: string;

/**
 * Here we are mocking the data using the JSON files in `defaultData`.
 * Before each test, we go back to the initial state, and modify it as needed.
 */

beforeAll(() => {
	mockData = {
		todos: { ...(defaultTodos || {}) },
		users: Array.isArray(defaultUsers) ? [...defaultUsers] : [],
	};

	mockDb = {
		query: async (path: string) => {
			if (path === 'todos') {
				return mockData.todos;
			} else if (path === 'users') {
				return mockData.users;
			}
		},
		update: async (path: string, data: any) => {
			if (path === 'todos') {
				mockData.todos = data;
			}
		},
	};

	jest.spyOn(AuthHelpers, 'validateUser').mockResolvedValue({
		userId: 'testuser',
	});
	jest.spyOn(RedisHelpers, 'getRedisClient').mockResolvedValue({
		get: mockDb.query,
		set: mockDb.update,
	});
	jest.spyOn(Database, 'getInstance').mockResolvedValue(mockDb);
	jest.spyOn(Database.prototype, 'query').mockImplementation(mockDb.query);
	jest.spyOn(Database.prototype, 'update').mockImplementation(mockDb.update);

	todoId = '281e6048-0b51-4f36-938b-71a711185fd8';
});

beforeEach(() => {
	// reset the database state
	mockData = {
		todos: { ...(defaultTodos || {}) },
		users: Array.isArray(defaultUsers) ? [...defaultUsers] : [],
	};
});

// GET /todos
test('It should get a list of todos', async () => {
	const {
		statusCode,
		res: { text: responseText },
	} = await MockApiAdapter.get('/todos');

	expect(statusCode).toBe(200);
	expect(Object.keys(JSON.parse(responseText).todos)).toHaveLength(2);
});

// POST /todos
test('It should add a list of todos', async () => {
	const todosToAdd = [{ note: 'Test note 1' }, { note: 'Test note 2' }];

	const { status: updateStatus, data: updateResponse } =
		await MockApiAdapter.post(`/todos`, {
			todos: JSON.stringify(todosToAdd),
		});

	expect(updateStatus).toBe(200);
	expect(updateResponse.todosUpdated).toBe(todosToAdd.length);

	const afterUpdateRes = await MockApiAdapter.get(`/todos`);

	expect(afterUpdateRes.status).toBe(200);
	expect(Object.keys(afterUpdateRes._body.todos)).toHaveLength(4);
});

// GET /todos/:id
test('It should get a single todo', async () => {
	const {
		statusCode,
		res: { text: responseText },
	} = await MockApiAdapter.get(`/todos/${todoId}`);

	expect(statusCode).toBe(200);
	expect(JSON.parse(responseText).todo.note).toBe('My second todo!');
});

// PUT /todos/:id
test('It should update a single todo', async () => {
	const note = 'Updated note';

	const { status: updateStatus, data: updateResponse } =
		await MockApiAdapter.put(`/todos/${todoId}`, { note });

	expect(updateStatus).toBe(200);
	expect(updateResponse.updatedTodo.note).toBe(note);

	const afterUpdateRes = await MockApiAdapter.get(`/todos/${todoId}`);

	expect(afterUpdateRes.status).toBe(200);
	expect(afterUpdateRes._body.todo.note).toBe(note);
});

// DELETE /todos/:id
test('It should delete a single todo', async () => {
	const { status, data } = await MockApiAdapter.del(`/todos/${todoId}`);

	expect(status).toBe(200);
	expect(data.removed).toBe(todoId);

	const { statusCode: afterStatus } = await MockApiAdapter.get(
		`/todos/${todoId}`
	);

	expect(afterStatus).toBe(404);
});
