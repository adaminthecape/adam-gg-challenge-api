export function handleError(data: {
	message: string;
	notify?: boolean;
	throw?: Error;
	error?: any;
	user?: string;
}) {
	// Log the error
	if (data.message) console.warn('ERROR text:', data.message);
	if (data.error) console.warn(data.error);
	if (data.user) console.warn(`User: ${data.user}`);

	if (data.throw) {
		throw data.throw;
	}
}
