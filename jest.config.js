// const config = {
//     preset: '@shelf/jest-mongodb',
//     transform: {
//         '^.+\\.ts?$': 'ts-jest',
//     },
//     testEnvironment: 'node',
//     moduleFileExtensions: ['ts', 'js', 'json'],
//     testMatch: ['**/tests/**/*.test.ts'],
//     coverageDirectory: 'coverage',
//     collectCoverageFrom: ['src/**/*.{ts,js}', '!src/**/*.d.ts'],
// } as import('@jest/types').Config.InitialOptions;

// export default config;

// jest.config.js
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    preset: '@shelf/jest-mongodb',
    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'json'],
    testMatch: ['**/tests/**/*.test.ts'],
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['src/**/*.{ts,js}', '!src/**/*.d.ts'],
};

module.exports = config;
