# Gulp Tarjeem
Modular advice: "Do one thing and do it well"
> Function-style javascript translation which compile the source into many locales.


## Usage
### In gulpfile.js
First, install `gulp-tarjeem` as a development dependency:

```shell
# Not published yet :(
npm install --save-dev gulp-tarjeem
```

Then, add it to your `gulpfile.js`:

```javascript
var translate = require('gulp-tarjeem');

gulp.task('translate', function() {
  var translations = ['en', 'id'];

  translations.forEach(function(translation){
    gulp.src('app/script/**/*.js')
      .pipe(translate(options))
      .pipe(gulp.dest('dist/script/' + translation));
  });
});
```

or better, handle errors:
```javascript
gulp.task('translate', function() {
  var translations = ['en', 'id'];

  translations.forEach(function(translation){
    gulp.src('app/script/**/*.js')
      .pipe(
        translate(options)
        .on('error', function(){
          console.error(arguments);
        })
      )
      .pipe(gulp.dest('dist/script/' + translation));
  });
});
```

### In your locales
You may put locale in a directory with language abbrev as it's name.

**locales/en.json**
```
{ "title": "My New Gulp Plugin, Call It Tarjeem" }
```

**locales/id.json**
```
{ "title": "Plugin Gulp Baru Milikku, Panggil Dia Tarjeem" }
```


### In your script.js
Then you can "calling" `transl` plugin with an argument of a key in your locales
you specified earlier.

Something like this will do,
```
document.getElementById('title').text(transl("title"))
```

will be compiled into
```
// File: en/script.js
document.getElementById('title').text("My New Gulp Plugin, Call It Tarjeem")
```
```
// File: id/script.js
document.getElementById('title').text("Plugin Gulp Baru Milikku, Panggil Dia Tarjeem")
```

If you're still not sure, please look at tests.


## API
### translate(localeFilePath)
`gulp-tarjeem` is called with a string

#### localeFilePath
Type: `String`

The string is a path to a nameOfTheFile.yml with your locales. Please look at test/locales for examples.

### translate(options)
`gulp-tarjeem` is called with an object

#### options
Type: `Object`

An `Object` with the following properties that affect how this plugin works,
* `.localeFilePath` String. Optional. Path to locale file.
  Or you can use `.localeLang` and `.localeDirectory`.
  But to note, this option has highest priority.
* `.localeFileExt` String. Optional. If you specify path to file will transform
  `newLocalePath = oldLocalePath + .localeFileExt`.
* `.localeLang` String. Optional. Target language.
* `.localeDirectory` String. Optional. Directory with locale files.
  If no `.localeFilePath` specified, try construct it from `.localeDirectory + .localeLang`.
* `.localeDictionary` Object. Dictionary to lookup instead of locale specified above.
  If you specify this, another `locale*` properties will be ignored.
* `.syntaxFunctionName` String. Function name to match.<br/>
  Default: `transl`
* `.translate` Function.
  First argument is an `content` to transform it.
  Second is an dictionary, that you specified.
  Function should return transformed string or `Error` object with some message.


## Tips & Trick
This plugin is actually very flexible. A String in Javascript can be chained with
built in method such as `toUpperCase()`, `toLowerCase()`. So, you can do lots of things.

```
// Chain with .toUpperCase()
var message1 = transl("title").toUpperCase();

// Process with function
var message2 = String.toUpperCase(transl("title"));

// Chain to replace a placeholder
var message3 = transl("title").replace(':year', new Date.getFullYear());
```

## TODO:
- refactor tests
- work on matchers (sigh...)


# License
This work adapted from @arathunku's MIT-licensed (https://github.com/arathunku/gulp-translator).

Further work contribution licensed into [Mozilla Public License 2.0 (MPL-2.0)](https://www.mozilla.org/en-US/MPL/).
