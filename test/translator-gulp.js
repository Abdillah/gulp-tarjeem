var File = require('vinyl');
var through = require('through2');
var assert = require('assert');
var Stream = require('stream');

var gulpTranslator = require('../translator-gulp.js');

describe('gulp-translator', function() {
  describe('with varied options properties', function() {
    it('should use localeFilePath rather than localeDirectory', function() {
      var translator = gulpTranslator({
        localeFilePath: './test/locales/ru.json',
        localeDirectory: './test/locales',
        localeLang: 'en'
      });
      var content = new Buffer('transl("title")');
      var translated = '"Заголовок"';

      var n = 0;

      var _transform = function(file, enc, callback) {
        assert.equal(file.contents, translated);
        n++;
        callback();
      };

      var _flush = function(callback) {
        assert.equal(n, 1);
        callback();
      };

      var t = through.obj(_transform, _flush);
      translator.pipe(t);
      translator.end(new File({
        contents: content
      }));
    });

    it('should work with other syntaxFunctionName', function() {
      var translator = gulpTranslator({
        localeFilePath: './test/locales/ru.json',
        syntaxFunctionName: 'translate'
      });
      var content = new Buffer('translate("title")');
      var translated = '"Заголовок"';

      var n = 0;

      var _transform = function(file, enc, callback) {
        assert.equal(file.contents, translated);
        n++;
        callback();
      };

      var _flush = function(callback) {
        assert.equal(n, 1);
        callback();
      };

      var t = through.obj(_transform, _flush);
      translator.pipe(t);
      translator.end(new File({
        contents: content
      }));
    });

    it('should use supplied syntaxPattern instead of the default regex with syntaxFunctionName specified', function() {
      var translator = gulpTranslator({
        localeFilePath: './test/locales/ru.json',
        syntaxPattern: /(^|[^\w_\$])transl\([\"\']([^\"\']+)[\"\']\)/g,
        syntaxFunctionName: 'translate'
      });
      var content = new Buffer('transl("title")');
      var translated = '"Заголовок"';

      var n = 0;

      var _transform = function(file, enc, callback) {
        assert.equal(file.contents, translated);
        n++;
        callback();
      };

      var _flush = function(callback) {
        assert.equal(n, 1);
        callback();
      };

      var t = through.obj(_transform, _flush);
      translator.pipe(t);
      translator.end(new File({
        contents: content
      }));
    });
  });

  describe('with null contents', function() {
    it('should let null files pass through', function(done) {
      var translator = gulpTranslator('./test/locales/en.yml');
      var n = 0;

      var _transform = function(file, enc, callback) {
        assert.equal(file.contents, null);
        n++;
        callback();
      };

      var _flush = function(callback) {
        assert.equal(n, 1);
        done();
        callback();
      };

      var t = through.obj(_transform, _flush);
      translator.pipe(t);
      translator.end(new File({
        contents: null
      }));
    });
  });

  describe('with buffer contents', function() {
    it('should interpolate strings  from *.yml locale file - ENGLISH', function(done) {
      var translator = gulpTranslator('./test/locales/en.yml');
      var n = 0;
      var content = new Buffer("transl(\"user.title\") + transl(\"title\")");
      var translated =  "ENGLISH USER TITLE" + "Title";

      var _transform = function(file, enc, callback) {
        assert.equal(eval(file.contents.toString('utf8')), translated);
        n++;
        callback();
      };

      var _flush = function(callback) {
        assert.equal(n, 1);
        done();
        callback();
      };

      var t = through.obj(_transform, _flush);
      translator.pipe(t);
      translator.end(new File({
        contents: content
      }));
    });

    it('should interpolate strings  from *.yml locale file - POLISH', function(done) {
      var translator = gulpTranslator('./test/locales/pl.yml');
      var n = 0;
      var content = new Buffer("transl(\"user.title\") + transl(\"title\")");
      var translated = "POLSKI TYTUL" + "Tytul";

      var _transform = function(file, enc, callback) {
        assert.equal(eval(file.contents.toString('utf8')), translated);
        n++;
        callback();
      };

      var _flush = function(callback) {
        assert.equal(n, 1);
        done();
        callback();
      };

      var t = through.obj(_transform, _flush);
      translator.pipe(t);
      translator.end(new File({
        contents: content
      }));
    });

    it('should interpolate strings from *.json locale file - RUSSIAN', function(done) {
      var translator = gulpTranslator('./test/locales/ru.json');
      var n = 0;
      var content = new Buffer("transl(\"user.title\") + transl(\"title\")");
      var translated = "РУССКИЙ ЗАГОЛОВОК" + "Заголовок";

      var _transform = function(file, enc, callback) {
        assert.equal(eval(file.contents.toString('utf8')), translated);
        n++;
        callback();
      };

      var _flush = function(callback) {
        assert.equal(n, 1);
        done();
        callback();
      };

      var t = through.obj(_transform, _flush);
      translator.pipe(t);
      translator.end(new File({
        contents: content
      }));
    });

    it("should throw error about undefined locale", function(done){
      var translator = gulpTranslator('./test/locales/pl.yml');
      var n = 0;
      var content = new Buffer("transl(\"unsupported\")");

      var _transform = function(file, enc, callback) {
        n++;
        callback();
      };

      var _flush = function(callback) {
        assert.equal(n, 0);
        callback();
      };


      translator.on('error', function(err){
        assert.equal(err.message,
          'Error: No such content (unsupported) in locale file and is used in /path');
        done();
      });

      var t = through.obj(_transform, _flush);
      translator.pipe(t);
      translator.end(new File({
        path: '/path',
        contents: content
      }));
    });

    it('should not translate native function resemble transl()', function () {
      var translator = gulpTranslator('./test/locales/en.yml');
      var n = 0;
      var content = new Buffer("intransl(\"argument\") + transl(\"title\")");
      var translated =  "intransl(\"argument\") + \"Title\"";

      var _transform = function(file, enc, callback) {
        assert.equal(file.contents.toString('utf8'), translated);
        n++;
        callback();
      };

      var _flush = function(callback) {
        assert.equal(n, 1);
        callback();
      };

      translator.on('error', function(err) {
        assert.equal('If this one called', 'it always error. Right?');
      });

      var t = through.obj(_transform, _flush);
      translator.pipe(t);
      translator.end(new File({
        contents: content
      }));
    });
  });

  describe('with stream contents', function() {
    it('should emit errors', function(done) {
      var translator = gulpTranslator('./test/locales/en.yml');
      var content = Readable("{{ title }} {{title}}");

      var n = 0;

      var _transform = function(file, enc, callback) {
        n++;
        callback();
      };

      var _flush = function(callback) {
        assert.equal(n, 0);
        callback();
      };

      translator.on('error', function(err){
        assert.equal(err.message, "Streaming not supported");
        done();
      });

      var t = through.obj(_transform, _flush);

      translator.pipe(t);
      translator.end(new File({
        contents: content
      }));
    });
  });
});

function Readable(content, cb){
  var readable = new Stream.Readable();
  readable._read = function() {
    this.push(new Buffer(content));
    this.push(null); // no more data
  };
  if (cb) readable.on('end', cb);
  return readable;
}
