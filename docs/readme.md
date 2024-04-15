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
