#! /usr/bin/env node
var fs = require('fs');
var parsedToHTML = require('./parsedToHTML.js');

//consider including more specific types of description: params description, returns description
//maybe we don't need 'name' for the 'returns' array

var properties = {
  'functionName': '',
  'params': [],
  'returns': [],
  'group': '',
  'description': '',
  'example': '',
  'tips': '',
  'classContext': ''
};

var fileOperations = function(paths) {
  //last path in array is the output file; earlier ones are js files to parse
  var outputPath = paths.pop();
  var fileNumbers = [];
  for (var i = 0; i < paths.length; i++) {
    fileNumbers.push(i + 1);
    fs.readFile(paths[i], function(err, data) {
      var JSONdata = JSON.stringify(parseMain(data.toString()));
      console.log('JSONdata in fileOperations:', JSONdata);
      fs.appendFile(outputPath, JSONdata, function(err, data) {
        console.log('successfully parsed file ' + fileNumbers.shift() + ' of ' + paths.length);
      });
    });
  }
};

// right now does not distinguish between API and helper functions
var parseMain = function(string) {
  // assuming function names are supplied
  var functionInfo = findFunctionInfo(string);
  var commentInfo = parseComments(string);
  return combineInfo(functionInfo, commentInfo);
};

var parseComments = function(string) {
  var results = [];  
  var blocks = findCommentBlocks(string);
  blocks.forEach(function(block) {
    var blockObj = {};
    var entries = parseCommentBlock(block);
    entries.forEach(function(entry) {
      var entryObj = processEntry(entry);
      blockObj[entryObj.propertyName] = entryObj.content;
    });
    results.push(blockObj);
  }); 
  return results;
};

// var buildCrowdEntries = function(blockObj) {
//   blockObj.crowdEntries = {
//     descriptions: [blockObj.description],
//     examples: [blockObj.example],
//     tips: [blockObj.tips]
//   };
// };

var findCommentBlocks = function(string) {
  //search the string for a substring beginning with /* and ending with */
  // right now assumes @doc is the first thing in the block after 0 or more white spaces
  // but not other chars
  var blockRegex = /\/\*{1}(\s*?)@doc([\s\S]+?)?\*\//g;
  return string.match(blockRegex);
};

/* 
  stuff
*/

var findFunctionInfo = function(string) {
  var functionPatternA = /(?:[{,]|var)[\n\r]?\s*([a-zA-Z0-9_]+)\s*[=:]\s*function\(([a-zA-Z0-9_,\s]*)\)/g;
  var functionPatternB = /function\s*([a-zA-Z0-9_]+)\s*\(([a-zA-Z0-9_,\s]*)\)/g;
  //var paramsPattern = /function\s*[a-zA-Z0-9_]*\s*(\([a-zA-Z0-9_,\s]*\))/g;

  var matchListA = functionPatternA.exec(string);
  var matchListB = functionPatternB.exec(string);
  var functionInfo = [];

  // right now paramsList will return an array even if there's no params
  // may refactor later, may not
  while (matchListA) {
    var paramsList = matchListA[2].split(',').map(function(param){
      return {'name': param.trim()};
    });
    var obj = {
      functionName: matchListA[1],
      params: paramsList
    };
    functionInfo.push(obj);
    matchListA = functionPatternA.exec(string);
  }

  while (matchListB) {
    var paramsList = matchListB[2].split(',').map(function(param){
      return {'name': param.trim()};
    });
    var obj = {
      functionName: matchListB[1],
      params: paramsList
    };
    functionInfo.push(obj);
    matchListB = functionPatternB.exec(string);
  }

  return functionInfo.sort(function(a, b) {
    return b.functionName < a.functionName;
  });
};

// {foo: bar, faz: function()}
// var func = function(a)
// function func(a)

var parseCommentBlock = function(commentBlock) {
  //@functionName:
  // @params: '...stuff...' 
  //                   @description: '....'
  commentBlock = commentBlock.substring(2, commentBlock.length - 2);
  commentBlock = commentBlock.trim();
  commentBlock = commentBlock.substring(4);
  commentBlock = commentBlock.trim();
  commentBlock = commentBlock.substring(1);
  // check if matches pattern: [\n\r]\s*@; if so, there are multiple entries
  var entries;
  if (commentBlock.match(/[\n\r]\s*@/)) {
    entries = splitEntries(commentBlock);
  } else {
    entries = [commentBlock];
  }   
  return entries;
};

var propertyIsValid = function(propName) {
  return (propName in properties);
};

var processEntry = function(entry) {
  //grab property name (in between @ and :)
  //grab contents after colon

  var propNameRegex = /^\w+?:/; 
  var nameOfProperty = entry.match(propNameRegex).join();
  var propNameLength = nameOfProperty.length;
  nameOfProperty = nameOfProperty.substring(0, propNameLength - 1).trim();
  if  (!propertyIsValid(nameOfProperty)) {
    console.log('ERROR: Invalid property name: ', nameOfProperty);
  }
  var parsedContent = entry.substring(propNameLength).trim();
  //if the content is an object or array, convert it to JS
  if (parsedContent[0] === '[' || parsedContent[0] ==='{') { 
    parsedContent = convertToJS(parsedContent);
  }  
  else {
    parsedContent = parseString(parsedContent);
  }
  var entryObj = { 
    propertyName: nameOfProperty, 
    content: null
  };
  // now only checks for str/obj/array; may refactor to include num/bool if necessary
  if (Array.isArray(parsedContent) || typeof parsedContent === 'string') {
    entryObj.content = parsedContent;
  } else if (typeof parsedContent === 'object') {
    entryObj.content = [];
    entryObj.content.push(parsedContent);
  } else {
    console.log('ERROR: invalid content type: ', typeof parsedContent);
  }
  return entryObj;
};

var convertToJS = function(string) {
  var fixedJSON = string.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2": ');
  fixedJSON = fixedJSON.replace(/:\s*(['])([^']+)(['])/g, ':"$2"');
  return JSON.parse(fixedJSON); 
};

//[^']*
// : 'stuff_*&&^%%*(@())!##@""'
// : 'she said: "oh hi"'
// : "she said: 'oh hi'"
// : 'stuff', name: 'stuff'
// @functionName: 'stuff'
// @description: 'convoluted: "yes"'
// JSON.parse('"stuff: \'stuff\'"'); "stuff: 'stuff'"

// first char is neither [ or {, so parse the plain string
  // check if first char is ' 
    // find double quotes (unescaped) 
      // escape them and replace them with single quotes  replace " with \'
    // replace head and tail with double quotes 

var parseString = function(string) {
  if (string[0] === "'") {
    string = string.replace(/"/g, "\'");
    string = '"' + string.substring(1, string.length - 1) + '"';
  }
  return JSON.parse(string);
};

var splitEntries = function(string) {
  var entryDividingRegex = /[\r\n]\s*@/g;
  return string.split(entryDividingRegex);
};

var combineInfo = function(functionArr, commentArray) {
  var combinedArr = [];
  var storage = {};

  for (var i = 0; i < functionArr.length; i++) {
    storage[functionArr[i].functionName] = functionArr[i];
  }
  for (var j = 0; j < commentArray.length; j++) {
    storage[commentArray[j].functionName] = commentArray[j];
  }
  for (var name in storage) {
    combinedArr.push(storage[name]);
  }
  return combinedArr;
};

module.exports = {
  parseComments: parseComments,
  findCommentBlocks: findCommentBlocks,
  parseCommentBlock: parseCommentBlock,
  splitEntries: splitEntries,
  processEntry: processEntry,
  convertToJS: convertToJS,
  findFunctionInfo: findFunctionInfo,
  parseMain: parseMain
};

//for command line use
var userArgs = process.argv.slice(2);
if (userArgs) fileOperations(userArgs);

// @params: 'abc', @name: 'name'
// @params: [{ name: 'sdfsd' type: 'Boolean' }, { name: 'sdfsd' type: 'Boolean' }]
  // check if it's an object or an array
    // if object, pushes into an empty array
// @returns: [{ name: 'sdfsd' type: 'Boolean' }, { name: 'sdfsd' type: 'Boolean' }]
  // check if it's an object or an array
    // if object, pushes into an empty array

// extra(?): how to handle multiple files (organize result, etc)

// error catching 
  // for file source
// find comment blocks : /** ... */
  //@doc signals that the documentation info for a function is to follow
  // loook for @keywords and call respective functions to further parse the keyword
    // @functionName: if not provided, look for function dec patter; 
        // if no function dec pattern, throw new Error
    // @methodContext = Vector  (extra: find a way to infer this from surroundings?)
    //   Vector.calculateMagnitude
  //check for one the two function patterns, either function Name(args) {} or var Name = function() {}
  //Name is value of @functionName
  
  //return json array of objects
  
  // @functionName
  // @params
    // @name: name of param
    // @type
    // @default: default value of param (optional)
  // @returns
    // @name: name of return value
    // @type
  // @description
  // @group: heading for a group of functions
  
  // extra: @special (user-defined keyword)
  // extra: cross-referencing {@link BABYLON.Vector3|Vector3} i 