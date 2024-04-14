import app from './app';
import { config as configureEnv } from 'dotenv';

configureEnv();

app.listen(process.env.API_PORT, () => {
	console.log(
		`gg-challenge-api-express listening on port ${process.env.API_PORT}`
	);
});
