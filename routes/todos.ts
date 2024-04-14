import express from 'express';
import cors from 'cors';
import { config as configureEnv } from 'dotenv';
import {
	getAllTodos,
	getSingleTodo,
	createTodos,
	importDefaultTodos,
	updateSingleTodo,
	removeSingleTodo,
} from '../controllers/todos';
import { EnvironmentService } from '../models/EnvironmentService';

const todos = express.Router();

configureEnv();

const config = new EnvironmentService(process.env);

todos.use(
	cors({
		origin: config.get('UI_ORIGIN_URL'),
	})
);

/**
 * @oas [get] /todos
 * description: "Get all available todos as an associative array"
 * summary: "Get all todos"
 * tags:
 *   - todos
 * responses:
 *   "200":
 *     description: A list of todos is returned.
 *   "404":
 *     description: No todos were available to return.
 *   "500":
 *     description: Something went wrong; todos will not be returned.
 */
todos.get('/', getAllTodos);

/**
 * @oas [post] /todos
 * description: "Add todos as a simple array of data"
 * summary: "Add todos"
 * tags:
 *   - todos
 * parameters:
 *   - (body) data* {Object} Array of Todo data to add (or in query)
 *   - (query) data* {Object} Array of Todo data to add (or in body)
 * responses:
 *   "200":
 *     description: Additions were successful, and the number added is returned.
 *   "500":
 *     description: Something went wrong; some todos may not have been added.
 */
todos.post('/', [express.json()], createTodos);

/**
 * @oas [get] /todos/{id}
 * description: "Get a single todo's data"
 * summary: "Get todo"
 * tags:
 *   - todos
 * parameters:
 *   - (params) id* {String} UUID of the todo to fetch
 * responses:
 *   "200":
 *     description: The target todo's data is returned.
 *   "500":
 *     description: Something went wrong; todo data will not be returned.
 */
todos.get('/:id', getSingleTodo);

/**
 * @oas [put] /todos/{id}
 * description: "Update a single todo's data"
 * summary: "Update todo"
 * tags:
 *   - todos
 * parameters:
 *   - (params) id* {String} UUID of the todo to update
 *   - (body) data {Object} Todo data to merge with existing data (or in query)
 *   - (query) data {Object} Todo data to merge with existing data (or in body)
 * responses:
 *   "200":
 *     description: Updates were successful, and the updated data is returned.
 *   "500":
 *     description: Something went wrong; the todo may not have been updated.
 */
todos.put('/:id', [express.json()], updateSingleTodo);

/**
 * @oas [delete] /todos/{id}
 * description: "Delete a single todo's data"
 * summary: "Delete todo"
 * tags:
 *   - todos
 * parameters:
 *   - (params) id* {String} UUID of the todo to remove
 * responses:
 *   "200":
 *     description: The todo was successfully removed.
 *   "404":
 *     description: No todo was found to remove.
 *   "500":
 *     description: Something went wrong; the todo may not have been removed.
 */
todos.delete('/:id', removeSingleTodo);

/**
 * @oas [post] /todos/importDefaultTodos
 * description: "Import the basic todos in the database."
 * summary: "Import todos"
 * tags:
 *   - todos
 * parameters:
 *   - (query) force {Boolean} Whether to overwrite existing data
 * responses:
 *   "200":
 *     description: Todos were successfully imported.
 *   "500":
 *     description: Something went wrong; todos may not have been imported.
 */
todos.post('/importDefaultTodos', importDefaultTodos);

export default todos;
