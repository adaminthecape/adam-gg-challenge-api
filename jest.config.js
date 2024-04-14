export default {
	preset: 'ts-jest/presets/js-with-ts',
	testEnvironment: 'node',
	roots: ['<rootDir>/tests/'],
	testMatch: [
		'!**/dist/**/*',
		'<rootDir>/__tests__/**/*.spec.ts',
		'<rootDir>/**/*.spec.ts',
	],
	moduleFileExtensions: ['js', 'json', 'ts'],
	transform: {
		'^.+\\.(j|t)sx?$': 'ts-jest',
	},
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
	},
	setupFilesAfterEnv: ['./jest.setup.redis-mock.ts'],
};
