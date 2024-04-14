import express, { NextFunction } from 'express';
import cors from 'cors';
import { config as configureEnv } from 'dotenv';
import { IReq, IRes } from '../sharedTypes';
import axios from 'axios';
import { handleError } from '../utils';
import { EnvironmentService } from '../models/EnvironmentService';

const weather = express.Router();

configureEnv();

const config = new EnvironmentService(process.env);

weather.use(
	cors({
		origin: config.get('UI_ORIGIN_URL'),
	})
);

/**
 * @oas [get] /weather
 * description: "Retrieve current weather information for a given location."
 * summary: "Get cloud status"
 * tags:
 *   - weather
 * parameters:
 *   - (body) [lat] {String} Latitude (as string) (optional)
 *   - (body) [lon] {String} Longitude (as string) (optional)
 *   - (body) [placename] {String} Name of the place to query (optional)
 * responses:
 *   "200":
 *     description: Weather data was retrieved and will be returned.
 *   "400":
 *     description: Not enough data provided to search. No data is returned.
 *   "404":
 *     description: The remote resource was not available. No data is returned.
 *   "500":
 *     description: Something went wrong; weather data will not be returned.
 */
weather.get('/', async (req: IReq, res: IRes, next: NextFunction) => {
	// Not using a controller for this as it's the only `weather` method.

	const { placename } = req.query;
	let { lat, lon } = req.query;

	if (!(placename || (lat && lon))) {
		return res.status(400).json({ success: false });
	}

	// if given place name, convert to lat/lon
	if (placename && !(lat && lon)) {
		let dataFromPlacename: Array<{
			name: string;
			local_names: Record<string, string>;
			lat: number;
			lon: number;
			country: string;
			state: string;
		}>;

		try {
			dataFromPlacename = await axios.get(
				`https://api.openweathermap.org/geo/1.0/direct`,
				{
					params: {
						appid: config.get('WEATHER_API_KEY'),
						limit: 1,
						q: placename,
					},
				}
			);

			if (Array.isArray(dataFromPlacename) && dataFromPlacename.length) {
				if (dataFromPlacename[0]?.lat) {
					lat = dataFromPlacename[0].lat;
				}

				if (dataFromPlacename[0]?.lon) {
					lon = dataFromPlacename[0].lon;
				}
			}
		} catch (e) {
			handleError({
				message: 'Weather API failed to resolve placename',
				error: e,
			});
		}
	}

	if (!(lat && lon)) {
		return res
			.status(404)
			.json({ success: false, error: 'Not enough data to search' });
	}

	try {
		const { data } = await axios.get(
			`https://api.openweathermap.org/data/2.5/weather`,
			{
				params: {
					appid: config.get('WEATHER_API_KEY'),
					lat,
					lon,
				},
			}
		);

		return res.status(200).json({ success: true, data });
	} catch (e) {
		handleError({
			message: 'Weather API failed to resolve weather data',
			error: e,
		});

		return res.status(500).json({ success: false, error: e.message });
	}
});

export default weather;
