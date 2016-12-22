var YAML = require('yamljs');
var q = require('q');
var fs = require('fs');

var DEFAULT_REGEXP = "(^|[^\\w_\\$])transl\\([\\\"\\\']([^\\\"\\\']+)[\\\"\\\']\\)";

var baseTransforms = {
  translate: function(content, dictionary){
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
  },

  uppercase: function(content) {
    if (typeof content !== 'string') {
      return new Error('No content to transform (uppercase).');
    }
    return content.toUpperCase();
  },

  lowercase: function(content) {
    if (typeof content !== 'string') {
      return new Error('No content to transform (lowercase).');
    }
    return content.toLowerCase();
  },

  capitalize: function(content){
    if (typeof content !== 'string') {
      return new Error('No content to transform (capitalize).');
    }
    return content.charAt(0).toUpperCase() + content.substring(1).toLowerCase();
  },

  capitalizeEvery: function(content){
    if (typeof content !== 'string') {
      return new Error('No content to transform (capitalizeEvery).');
    }
    return content.toLowerCase().replace(/\b(.)/g, function(equals, word){
      return baseTransforms.capitalize(word);
    });
  },

  reverse: function(content){
    if (typeof content !== 'string') {
      return new Error('No content to transform (reverse).');
    }
    return content.split('').reduceRight(function(result, letter){
      return result + letter;
    }, '');
  }

};

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

    this.syntaxPattern = options.syntaxPattern || new RegExp(regexp, 'g');
    this.userTransform = options.transform || {};

    if (typeof options === 'string'){
      var lang = options.match(/([\.^\/]*)\.\w{0,4}$/);
      this.localeLang = lang && lang[0] || 'undefined';
      this.localeFilePath = options;
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
    }

    this.localeDictionary = options.localeDictionary || getDictionary(this.localeFilePath);
    return this;
  };

  Translator.prototype.translate = function(content) {
    var resultPromise = q.defer();
    var self = this;

    resultPromise.resolve(content.replace(self.syntaxPattern, function (s, prefix, data) {
      var transforms = 'translate';
      var res = data;

      if (typeof self.userTransform[transforms] === 'function') {
        res = self.userTransform[transforms](res, self.localeDictionary);
      } else if (typeof baseTransforms[transforms] === 'function') {
        res = baseTransforms[transforms](res, self.localeDictionary);
      } else {
        res = new Error(transforms + ' filter is not supported');
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
