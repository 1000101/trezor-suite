module.exports = (api) => {
    api.cache(true);

    return {
        presets: [
            [
                '@babel/preset-env',
                {
                    useBuiltIns: 'entry',
                    loose: true,
                },
            ],
            '@babel/preset-react',
            '@babel/preset-flow',
        ],
        plugins: [
            'react-hot-loader/babel',
            '@babel/plugin-transform-flow-strip-types',
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-object-rest-spread',
            [
                '@babel/plugin-transform-runtime',
                {
                    regenerator: true,
                },
            ],
            [
                'module-resolver',
                {
                    root: [
                        './src',
                    ],
                    alias: {
                        public: [
                            './public',
                        ],
                    },
                },
            ],
            'babel-plugin-styled-components',
        ],
        env: {
            test: {
                presets: [
                    'jest',
                ],
            },
        },
    };
};