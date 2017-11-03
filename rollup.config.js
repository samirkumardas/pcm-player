/* global process */

// Rollup plugins
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';

export default {
    input: 'src/opus-to-pcm.js',
    output: {
        file: 'dist/opus_to_pcm.js',
        format: 'iife',
        name: 'Decoder',
        sourcemap: false, //inline
    },
    plugins: [
        eslint(),
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