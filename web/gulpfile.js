'use strict';

const gulp = require('gulp');
const path = require('path');
const gutil = require('gulp-util');
const webpack = require('webpack-stream');
const fs = require('fs-extra');
const swig = require('swig');
const beautify = require('js-beautify').js_beautify
const jade = require('gulp-jade');
const browserSync = require('browser-sync');
const webpackConfig = require('./webpack.config.dev');
const exec = require('child_process').execSync;
const cheerio = require('cheerio')


gulp.task('default', ['serve']);
gulp.task('build', () => {
    /*
    fs.removeSync('./builds');
    fs.mkdirpSync('./builds');
    */
    /** Components */
    /*
    {
        const template = swig.compileFile('./templates/ComponentEditor.swig');
        const files = fs.readdirSync('./components') || [];
        for (const file of files) {
            const source = require(`./components/${file}`);
            const content = template(source);
            const result = beautify(content);
        }
    }
    */
    let config = Object.create(webpackConfig);
    config.cache = true;
    let isError = false;
    browserSync.notify('gulp building', 2.6 * 1000);
    return gulp.src([])
        .pipe(webpack(config).on('error', function(err, stats) {
            if (err) {
                isError = true;
                fs.writeFileSync('./.error', err.toString());
                const ret = exec('cat ./.error | ./html -preview').toString();
                const $ = cheerio.load(ret);
                $('.term-container').css('text-align', 'left');
                browserSync.notify($.html(), 60 * 60 * 1000);
                this.emit('end');
            }
        }))
        .pipe(gulp.dest('./dist'))
        .on('end', () => {
            if (!isError) {
                browserSync.notify('gulp done', 2.6 * 1000);
                browserSync.reload();
            }
        })
});

gulp.task('build:html', () => {
    fs.removeSync('./dist');
    fs.mkdirpSync('./dist');
    fs.copySync('./node_modules/babel-polyfill/dist/polyfill.min.js',
        './dist/polyfill.min.js');
    return gulp.src('index.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('serve', () => {
    browserSync.init({
        server: {
            baseDir: './dist'
        },
        port: 8008,
        ui: {
            port: 5000
        }
    });
    gulp.watch(['src/**/*.js'], ['build']);
});
