export const endpoints = {
	todos: {
		'[get] /todos': {
			description: 'Get all available todos as an associative array',
			summary: 'Get all todos',
			params: [
				'(body) data* {Object} Array of Todo data to add (or in query)',
				'(query) data* {Object} Array of Todo data to add (or in body)',
			],
			responses: {
				200: 'A list of todos is returned.',
				404: 'No todos were available to return.',
				500: 'Something went wrong; todos will not be returned.',
			},
		},
		'[post] /todos': {
			description: 'Add todos as a simple array of data',
			summary: 'Add todos',
			params: [
				'(body) data* {Object} Array of Todo data to add (or in query)',
				'(query) data* {Object} Array of Todo data to add (or in body)',
			],
			responses: {
				200: 'Additions were successful, and the number added is returned.',
				500: 'Something went wrong; some todos may not have been added.',
			},
		},
		'[get] /todos/{id}': {
			description: "Get a single todo's data",
			summary: 'Get todo',
			params: ['(params) id* {String} UUID of the todo to fetch'],
			responses: {
				200: "The target todo's data is returned.",
				500: 'Something went wrong; todo data will not be returned.',
			},
		},
		'[put] /todos/{id}': {
			description: "Update a single todo's data",
			summary: 'Update todo',
			params: [
				'(params) id* {String} UUID of the todo to update',
				'(body) data {Object} Todo data to merge with existing data (or in query)',
				'(query) data {Object} Todo data to merge with existing data (or in body)',
			],
			responses: {
				200: 'Updates were successful, and the updated data is returned.',
				500: 'Something went wrong; the todo may not have been updated.',
			},
		},
		'[delete] /todos/{id}': {
			description: "Delete a single todo's data",
			summary: 'Delete todo',
			params: ['(params) id* {String} UUID of the todo to remove'],
			responses: {
				200: 'The todo was successfully removed.',
				404: 'No todo was found to remove.',
				500: 'Something went wrong; the todo may not have been removed.',
			},
		},
		'[post] /todos/importDefaultTodos': {
			description: 'Import the basic todos in the database.',
			summary: 'Import todos',
			params: [
				'(query) force {Boolean} Whether to overwrite existing data',
			],
			responses: {
				200: 'Todos were successfully imported.',
				500: 'Something went wrong; todos may not have been imported.',
			},
		},
	},
	auth: {
		'[post] /auth/importDefaultUsers': {
			description: 'Import the default user(s) into the database.',
			summary: 'Import users',
			params: [
				'(query) force {Boolean} Whether to overwrite existing data',
			],
			responses: {
				200: 'Users were successfully imported.',
				500: 'Something went wrong; users may not have been imported.',
			},
		},
	},
	weather: {
		'[get] /weather': {
			description:
				'Retrieve current weather information for a given location.',
			summary: 'Get cloud status',
			params: [
				'(body) [lat] {String} Latitude (as string) (optional)',
				'(body) [lon] {String} Longitude (as string) (optional)',
				'(body) [placename] {String} Name of the place to query (optional)',
			],
			responses: {
				200: 'Weather data was retrieved and will be returned.',
				400: 'Not enough data provided to search. No data is returned.',
				404: 'The remote resource was not available. No data is returned.',
				500: 'Something went wrong; weather data will not be returned.',
			},
		},
	},
};
