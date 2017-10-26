/* global process */

// Rollup plugins
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';


export default {
    entry: 'src/player.js',
    dest: 'dist/player.min.js',
    format: 'iife',
    moduleName: 'RingPlayer',
    sourceMap: false, //inline
    plugins: [
        eslint({
            exclude: [
                'src/styles/**',
            ]
        }),
        babel({
            exclude: 'node_modules/**',
        }),
        replace({
            exclude: 'node_modules/**',
            ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        }),
        (process.env.NODE_ENV === 'production' && uglify()),
    ],
};