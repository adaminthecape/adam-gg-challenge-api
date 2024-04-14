import axios from 'axios';

export function handleError(data: {
	message: string;
	notify?: boolean;
	throw?: Error;
	error?: any;
	user?: string;
}) {
	if (data.notify) {
		// Send a notification to admins
	}
	// Log the error
	if (data.message) console.warn('ERROR text:', data.message);
	if (data.error) console.warn(data.error);
	if (data.user) console.warn(`User: ${data.user}`);

	if (data.throw) {
		throw data.throw;
	}
}

export async function axiosGet(path: string): Promise<any> {
	return new Promise((resolve) => {
		axios
			.get(`${process.env.API_URL}${path}`, {
				headers: {
					Authorization: `Basic ${process.env.BASIC_AUTH_TOKEN}`,
				},
			})
			.then((data) => resolve(data))
			.catch((error) =>
				resolve({
					status: error.response.status,
					data: error.response.data,
				})
			);
	});
}

export async function axiosPut(path: string, data: any): Promise<any> {
	return new Promise((resolve) => {
		axios
			.put(`${process.env.API_URL}${path}`, {
				headers: {
					Authorization: `Basic ${process.env.BASIC_AUTH_TOKEN}`,
				},
			})
			.then((data) => resolve(data))
			.catch((error) =>
				resolve({
					status: error.response.status,
					data: error.response.data,
				})
			);
	});
}
