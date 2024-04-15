# Interview challenge API

## Running the API

1. Go to the target directory (e.g. `challenge-api-express`).
1. Run `tsx server.ts` or `ts-node server.ts`.
1. If you see `API listening on port <port>`, you're good to go.

## Setting up in-memory storage

To set up your local database, you will need to first set up a Redis instance, and then allow the API to fill it with default data. With Docker:

1. Install Docker
1. Pull the Redis image: `docker pull redis`
1. Start the Redis container: `docker run --name gg-api-redis -d redis`
1. Configure the image: `docker exec -it gg-api-redis bash`

Or mount the Docker image or Redis instance with your method of choice.

After setting up the instance, you may need to start the server locally. On Linux, simply run `redis-server`.

On Windows, you may need to [install WSL](TODO), then install an Ubuntu distribution from the Windows Store, and then run the following commands in sequence:

-   `sudo apt-add-repository ppa:redislabs/redis`
-   `sudo apt-get update`
-   `sudo apt-get upgrade`
-   `sudo apt-get install redis-server`

Finally, run `redis-cli` in the terminal, and you can run commands in your Redis instance. For example, run `GET todos` in the Redis terminal, and you should see a list of todos saved in memory.

## Setting up your environment variables

You will need to add a `.env` file in the root directory with the following keys:

-   `NODE_ENV` - standard Node.js environment (production, development)
-   `UI_ORIGIN_URL` - Origin that will be expected to make requests, per CORS. This must be specified in your REST client when making requests. I use `http://localhost:3000`.
-   `API_PORT` - Port this API will operate on (I am using `5000`)
-   `REDIS_HOST` - URL of your Redis instance
-   `REDIS_PORT` - Port for your Redis instance
-   `REDIS_PASSWORD` - Password for your Redis instance (not necessary)
-   `BASIC_AUTH_TOKEN` - base64 encoded string of a username & password joined with a colon `:`. This is used for Jest testing and corresponds to `testuser` and `testpassword`. You can generate this string as below, in [Querying the API](#querying-the-api)
-   `WEATHER_API_URL` - The URL of the weather service to use; this uses `https://api.openweathermap.org` (other services will need code configuration to specify endpoints & input data)
-   `WEATHER_API_KEY` - Your OpenWeatherMap API key.

## Querying the API

You will need a REST client, or `curl`, or the method of your choice.

Authentication follows Basic Authentication protocol, and requires the `Authorization` header to be passed with `Basic <token>` where `<token>` is the `base64` encoded username and password, joined with a colon (`:`).

You can generate this in JavaScript as such:

```
(username, password) => `Authorization: Basic ${btoa([username, password].join(':'))}`
```

Endpoint information can be found below, under [Endpoints](#endpoints).

## Architecture

Everything is built on [Node.js](https://nodejs.org/).  
The API uses [Express.js](https://expressjs.com/).
In-memory database storage is provided using [Redis](https://redis.io/).  
Unit testing is done with [Jest](https://jestjs.io/).  
Weather (and geocoding) data is provided via [OpenWeatherMap](https://openweathermap.org/).

## Endpoints

### `[get] /todos` - Get all todos

Get all available todos as an associative array

#### Parameters

-   (body) data\* {Object} Array of Todo data to add (or in query)
-   (query) data\* {Object} Array of Todo data to add (or in body)

#### Responses

-   200 - A list of todos is returned.
-   404 - No todos were available to return.
-   500 - Something went wrong; todos will not be returned.

### `[post] /todos` - Add todos

Add todos as a simple array of data

#### Parameters

-   (body) data\* {Object} Array of Todo data to add (or in query)
-   (query) data\* {Object} Array of Todo data to add (or in body)

#### Responses

-   200 - Additions were successful, and the number added is returned.
-   500 - Something went wrong; some todos may not have been added.

### `[get] /todos/{id}` - Get todo

Get a single todo's data

#### Parameters

-   (params) id\* {String} UUID of the todo to fetch

#### Responses

-   200 - The target todo's data is returned.
-   500 - Something went wrong; todo data will not be returned.

### `[put] /todos/{id}` - Update todo

Update a single todo's data

#### Parameters

-   (params) id\* {String} UUID of the todo to update
-   (body) data {Object} Todo data to merge with existing data (or in query)
-   (query) data {Object} Todo data to merge with existing data (or in body)

#### Responses

-   200 - Updates were successful, and the updated data is returned.
-   500 - Something went wrong; the todo may not have been updated.

### `[delete] /todos/{id}` - Delete todo

Delete a single todo's data

#### Parameters

-   (params) id\* {String} UUID of the todo to remove

#### Responses

-   200 - The todo was successfully removed.
-   404 - No todo was found to remove.
-   500 - Something went wrong; the todo may not have been removed.

### `[post] /todos/importDefaultTodos` - Import todos

Import the basic todos in the database.

#### Parameters

-   (query) force {Boolean} Whether to overwrite existing data

#### Responses

-   200 - Todos were successfully imported.
-   500 - Something went wrong; todos may not have been imported.

### `[post] /auth/importDefaultUsers` - Import users

Import the default user(s) into the database.

#### Parameters

-   (query) force {Boolean} Whether to overwrite existing data

#### Responses

-   200 - Users were successfully imported.
-   500 - Something went wrong; users may not have been imported.

### `[get] /weather` - Import users

Import the default user(s) into the database.

#### Parameters

-   (body) [lat] {String} Latitude (as string) (optional)
-   (body) [lon] {String} Longitude (as string) (optional)
-   (body) [placename] {String} Name of the place to query (optional)

#### Responses

-   200 - Weather data was retrieved and will be returned.
-   400 - Not enough data provided to search. No data is returned.
-   404 - The remote resource was not available. No data is returned.
-   500 - Something went wrong; weather data will not be returned.### `[get] /todos` - Get all todos
    Get all available todos as an associative array

#### Parameters

-   (body) data\* {Object} Array of Todo data to add (or in query)
-   (query) data\* {Object} Array of Todo data to add (or in body)

#### Responses

-   200 - A list of todos is returned.
-   404 - No todos were available to return.
-   500 - Something went wrong; todos will not be returned.

### `[post] /todos` - Add todos

Add todos as a simple array of data

#### Parameters

-   (body) data\* {Object} Array of Todo data to add (or in query)
-   (query) data\* {Object} Array of Todo data to add (or in body)

#### Responses

-   200 - Additions were successful, and the number added is returned.
-   500 - Something went wrong; some todos may not have been added.

### `[get] /todos/{id}` - Get todo

Get a single todo's data

#### Parameters

-   (params) id\* {String} UUID of the todo to fetch

#### Responses

-   200 - The target todo's data is returned.
-   500 - Something went wrong; todo data will not be returned.

### `[put] /todos/{id}` - Update todo

Update a single todo's data

#### Parameters

-   (params) id\* {String} UUID of the todo to update
-   (body) data {Object} Todo data to merge with existing data (or in query)
-   (query) data {Object} Todo data to merge with existing data (or in body)

#### Responses

-   200 - Updates were successful, and the updated data is returned.
-   500 - Something went wrong; the todo may not have been updated.

### `[delete] /todos/{id}` - Delete todo

Delete a single todo's data

#### Parameters

-   (params) id\* {String} UUID of the todo to remove

#### Responses

-   200 - The todo was successfully removed.
-   404 - No todo was found to remove.
-   500 - Something went wrong; the todo may not have been removed.

### `[post] /todos/importDefaultTodos` - Import todos

Import the basic todos in the database.

#### Parameters

-   (query) force {Boolean} Whether to overwrite existing data

#### Responses

-   200 - Todos were successfully imported.
-   500 - Something went wrong; todos may not have been imported.

### `[post] /auth/importDefaultUsers` - Import users

Import the default user(s) into the database.

#### Parameters

-   (query) force {Boolean} Whether to overwrite existing data

#### Responses

-   200 - Users were successfully imported.
-   500 - Something went wrong; users may not have been imported.

### `[get] /weather` - Import users

Import the default user(s) into the database.

#### Parameters

-   (body) [lat] {String} Latitude (as string) (optional)
-   (body) [lon] {String} Longitude (as string) (optional)
-   (body) [placename] {String} Name of the place to query (optional)

#### Responses

-   200 - Weather data was retrieved and will be returned.
-   400 - Not enough data provided to search. No data is returned.
-   404 - The remote resource was not available. No data is returned.
-   500 - Something went wrong; weather data will not be returned.
