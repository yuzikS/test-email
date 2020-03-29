'use strict';

const { watch, src, series, parallel, dest } = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const fileinclude = require('gulp-file-include');
const webserver = require('gulp-webserver');
const emailBuilder = require('gulp-email-builder');
const connect = require('gulp-connect');
const livereload = require('gulp-livereload');
var inlineCss = require('gulp-inline-css');

var path = {
    src:{
        html: './src/index.html',
        style: './src/scss/*.scss',
    },
    build:{
        html: './dist',
        style: './dist',
    }
};

function html() {
   return  src(path.src.html)
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(dest(path.build.html))
        .pipe(connect.reload());
}


var autoprefixerOptions = {
    browsers: ['last 2 versions', '> 5%', 'Firefox ESR'],
    cascade: false
};

function style() {
    return src(path.src.style)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer(autoprefixerOptions))
        .pipe(dest(path.build.style))
        .pipe(connect.reload());
}

function buildEmail() {
    return src(path.build.html + '/index.html')
        .pipe(
            inlineCss({
                applyStyleTags: false,
                removeStyleTags: false
            })
        )
        .pipe(dest(path.build.html))
        .pipe(connect.reload());
}



//Webserver
// function runDevServer() {
//     return src('dist')
//         .pipe(webserver({
//             livereload: true,
//             open: true
//         }));
// }

function liveReload() {
    connect.server({
        root: 'dist',
        livereload: true,
        port: 3000
    });

    // livereload({
    //     start: true,
    //     port:3000,
    // })
}


//Watch task
function watcher() {
    // livereload.listen();

    watch([path.src.style], series(style, html, buildEmail));
    watch([path.src.html], series(html, buildEmail));
}


exports.build = series(html, style, buildEmail, parallel( watcher, liveReload));
