/* global process */

// Rollup plugins
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';


export default {
    entry: 'src/opus-to-pcm.js',
    dest: 'dist/opus_to_pcm.js',
    format: 'amd',
    sourceMap: false, //inline
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