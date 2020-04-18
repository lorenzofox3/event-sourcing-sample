import replace from '@rollup/plugin-replace';

const balancePublic = process.env.BUILD_BALANCE_PUBLIC || 'http://localhost:3002';

export default {
    input: './web/src/index.js',
    output: {
        format: 'es',
        file: './web/dist/index.js'
    },
    plugins: [
        replace({
            '__BALANCE_PUBLIC__': JSON.stringify(balancePublic)
        })
    ]
};