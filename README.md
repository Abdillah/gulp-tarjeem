# Gulp Tarjeem
Here in short this Gulp plugin is,
> Function-style, dictionary agnostic translation gulp plugin which compile
> javascript source codes into localized scripts.

## "Do one thing and do it well"
This project restricted to, or only feature
* Function-styled
* Compile javascript source code to localized scripts
* Dictionary agnostic (as long as it converted to JSON)
* One dictionary into one output for each file passed through

If above points deviated, please report a bug.

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
### translate(dictionaryFilePath)
`gulp-tarjeem` is called with a string

#### dictionaryFilePath
Type: `String`

The string is a path to a locale-file-name.js with your locales. Please look at test/locales for examples.

### translate(options)
`gulp-tarjeem` is called with an object

#### options
Type: `Object`

An `Object` with the following properties that affect how this plugin works,
* `.dictionaryFilePath` String. Path to locale file.
* `.dictionaryTransformer` Function. Custom function to convert whatever `dictionaryFilePath`
  content might be into Javascript key-value object.
* `.dictionaryObject` Object. Dictionary to lookup instead of locale specified above.
  If you specify this, `dictionaryFilePath` property will be ignored.
* `.syntaxFunctionName` String. Function name to match.<br/>
  Default: `transl`

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
