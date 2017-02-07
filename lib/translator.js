var q = require('q');
var fs = require('fs');

var DEFAULT_REGEXP = "(^|[^\\w_\\$])transl\\([\\\"\\\']([^\\\"\\\']+)[\\\"\\\']\\)";

var translate = function(content, dictionary) {
  if (!content) {
    return new Error('No content to transform (translate).');
  }

  var res = content.trim().split('.').reduce(function(dict, key) {
    if (!dict) {
      return null;
    }
    return dict[key];
  }, dictionary);

  if (!res) {
    return new Error('No such content (' + content + ') in locale file');
  } else {
    return '\"' + res + '\"';
  }
}

var getDictionaryFromFile = function(path, transformer) {
  if (typeof transformer !== 'function') {
    transformer = JSON.parse;
  }

  filecontent = fs.readFileSync(path+'.json', {
      encoding: 'utf8'
  });

  return transformer(filecontent);
};

module.exports = (function() {
  var Translator = function(options){
    options = options || {};

    var regexp = DEFAULT_REGEXP;
    if (options.syntaxFnName) {
      regexp = regexp.replace('transl', options.syntaxFnName || 'transl');
    }

    this.syntaxPattern = new RegExp(regexp, 'g');

    if (typeof options.translate === 'function') {
      this._translate = option.translatorFn;
    } else {
      this._translate = translate;
    }

    var dictionaryTransformer;
    if (typeof options.dictionaryTransformer === 'function') {
      dictionaryTransformer = options.dictionaryTransformer;
    }

    if (typeof options === 'string') {
      this.dictionaryObject = getDictionaryFromFile(options, dictionaryTransformer);
    } else if (options.dictionaryFilePath) {
      this.dictionaryObject = getDictionaryFromFile(options.dictionaryFilePath, dictionaryTransformer);
    } else if (options.dictionaryObject) {
      this.dictionaryObject = options.dictionaryObject;
    } else {
      throw new Error('Please supply a dictionary either pass `dictionaryFilePath` or `dictionaryObject` option');
    }

    return this;
  };

  Translator.prototype.translate = function(content) {
    var resultPromise = q.defer();
    var self = this;

    resultPromise.resolve(content.replace(self.syntaxPattern, function (s, prefix, data) {
      var res = data;

      res = self._translate(res, self.dictionaryObject);

      if (res instanceof Error) {
        return resultPromise.reject(res);
      }

      return prefix + res;
    }, content));

    return resultPromise.promise;
  };

  return Translator;
}());
