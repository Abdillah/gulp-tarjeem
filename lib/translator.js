var YAML = require('yamljs');
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

var getDictionary = function(path){
  var dictionary;

  if (path.match(/\.json$/)) {
    dictionary = JSON.parse(
      fs.readFileSync(path,{
        encoding: 'utf8'
      })
    );
  }
  else if (path.match(/\.yml$/)){
    dictionary = YAML.load(path);
  }
  if (!dictionary){
    try{
      dictionary = JSON.parse(
        fs.readFileSync(path+'.json',{
          encoding: 'utf8'
        })
      );
    }
    catch(e){
      dictionary = YAML.load(path + '.yml');
    }
  }
  return dictionary;
};



module.exports = (function() {
  var Translator = function(options){
    options = options || {};

    var regexp = DEFAULT_REGEXP;
    if (options.syntaxFunctionName) {
      this.syntaxFunctionName = options.syntaxFunctionName || 'transl';
      regexp = regexp.replace('transl', this.syntaxFunctionName);
    }

    this.syntaxPattern = new RegExp(regexp, 'g');

    if (typeof options.translate === 'function') {
        this.translate = option.translate;
    } else {
        return throw Error('options.translate not a function');
    }

    if (typeof options === 'string') {
      // A filepath to dictionary
      var lang = options.match(/([\.^\/]*)\.\w{0,4}$/);
      this.localeLang = lang && lang[0] || 'undefined';
      this.localeFilePath = options;
      this.localeDictionary = getDictionary(this.localeFilePath);
    } else if (options.localeDictionary) {
      // A dictionary
      this.localeDictionary = options.localeDictionary;
    } else {
      this.localeLang = options.localeLang;
      this.localeFilePath = options.localeFilePath;
      this.localeDirectory = options.localeDirectory;
      this.localeFileExt = options.localeFileExt;

      if (!this.localeFilePath){
        this.localeFilePath = this.localeDirectory + this.localeLang;
      }

      if (this.localeFileExt) {
        this.localeFilePath += this.localeFileExt;
      }
        this.localeDictionary = getDictionary(this.localeFilePath);
    }

    return this;
  };

  Translator.prototype.translate = function(content) {
    var resultPromise = q.defer();
    var self = this;

    resultPromise.resolve(content.replace(self.syntaxPattern, function (s, prefix, data) {
      var res = data;

      if (typeof self.translate === 'function') {
        res = self.translate(res, self.localeDictionary);
      } else {
        res = translate(res, self.localeDictionary);
      }

      if (res instanceof Error) {
        return resultPromise.reject(res);
      }

      return prefix + res;
    }, content));

    return resultPromise.promise;
  };

  return Translator;
}());
