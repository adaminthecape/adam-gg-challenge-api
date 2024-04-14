import z from 'zod';

const cEnvironmentSchema = z.strictObject({
	NODE_ENV: z.optional(
		z.union([z.literal('production'), z.literal('development')])
	),
	UI_ORIGIN_URL: z.optional(z.string()),
	API_URL: z.optional(z.string()),
	API_PORT: z.optional(z.string()),
	REDIS_HOST: z.optional(z.string()),
	REDIS_PORT: z.optional(z.string()),
	REDIS_PASSWORD: z.optional(z.string()),
	BASIC_AUTH_TOKEN: z.optional(z.string()),
	WEATHER_API_KEY: z.optional(z.string()),
});

type Environment = z.infer<typeof cEnvironmentSchema>;

export class EnvironmentService {
	private variables: Environment;

	public constructor(variables: any) {
		const vars: Environment = {};

		Object.entries(variables || {}).forEach(([key, value]) => {
			const { success } = cEnvironmentSchema.safeParse({ [key]: value });

			if (success) {
				vars[key] = value;
			}
		});

		if (!(vars.API_PORT && vars.API_URL)) {
			throw new Error('API config missing! Set API_PORT and API_URL');
		}

		if (!(vars.REDIS_HOST && vars.REDIS_PORT)) {
			throw new Error(
				'Redis config missing! Set REDIS_HOST and REDIS_PORT'
			);
		}

		if (!vars.REDIS_PASSWORD) {
			console.warn(
				'Redis password missing! Set REDIS_PASSWORD (optional)'
			);
		}

		if (!vars.UI_ORIGIN_URL) {
			throw new Error('API origin URL missing! Set UI_ORIGIN_URL');
		}

		if (!vars.WEATHER_API_KEY) {
			console.warn(
				'Weather API key missing! Set WEATHER_API_KEY (optional)'
			);
		}

		this.variables = vars;
	}

	public get<T>(name: keyof Environment) {
		return <T>(<unknown>this.variables[name]);
	}
}
