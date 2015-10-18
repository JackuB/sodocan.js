var expect = require('chai').expect;
var docParser = require('../parser.js');
var parsedToHTML = require('../parsedToHTML.js');
var fs = require('fs');

var findCommentBlocks = docParser.findCommentBlocks;
var parseCommentBlock = docParser.parseCommentBlock;
var splitEntries = docParser.splitEntries;
var processEntry = docParser.processEntry;
var properties = docParser.properties;
var convertToJS = docParser.convertToJS;
var parseComments = docParser.parseComments;
var findFunctionInfo = docParser.findFunctionInfo;
var parseMain = docParser.parseMain;
var buildExplanations = docParser.buildExplanations;
var parseHeader = docParser.parseHeader;
var fixtures = fs.readFileSync('./spec/fixtures.js').toString();
var parsedJSON = fs.readFileSync('./spec/parsedJSON.json').toString();

describe("documentation parser", function() {
  var test;
  beforeEach(function () {
    test = '';
  });
  
  it("should contain functions findCommentBlock and parseCommentBlock", function() {
    expect(typeof findCommentBlocks).to.equal('function');
    expect(typeof parseCommentBlock).to.equal('function');
  });

  it("should be able to find a comment block denotated by /* and */", function() {
    test = '/* @doc */ \n function(arr){/* @doc stuff */}';
    var result = findCommentBlocks(test);
    expect(result).to.deep.equal(['/* @doc */', '/* @doc stuff */']);
  });

  it("should ignore blocks that do not contain '@doc'", function() {
    test = '/* */   /* @doc */';
    var result = findCommentBlocks(test);
    expect(result).to.deep.equal(['/* @doc */']);
    expect(result.length).to.equal(1);
  });

  it("should split the contents of the comment block according to keyword content", function() {
    var test ='params: {name: "foo", type: "Boolean"}' 
    + '\n@returns: {name: "foo", type: "Boolean"}';
    var entries = splitEntries(test);
    expect(entries[0]).to.equal('params: {name: "foo", type: "Boolean"}');
    expect(entries[1]).to.equal('returns: {name: "foo", type: "Boolean"}');
    expect(entries.length).to.equal(2);
  });

  it("should parse a comment block into separate entries; whether there is a single one or more", function() {
    var test ='/* @doc \n @functionName: "hey"\n   @descriptions: "man"  */';
    var entries = parseCommentBlock(test);
    expect(entries.length).to.equal(2);
    expect(entries).to.deep.equal(['functionName: "hey"', 'descriptions: "man"']);
    test ='/* @doc \n @descriptions: "man"  */';
    entries = parseCommentBlock(test);
    expect(entries.length).to.equal(1);
    expect(entries).to.deep.equal(['descriptions: "man"']);
  });

  it("should locate appropriate keyword in properties object and process its entry", function() {
    test = 'functionName: "foo"';
    var entryObj = processEntry(test);
    expect(entryObj.propertyName).to.equal('functionName');
    expect(entryObj.content).to.equal('foo');
  });

  it("should also parse string content when we use single quotes", function() {
    test = "functionName: 'foo'";
    var entryObj = processEntry(test);
    expect(entryObj.propertyName).to.equal('functionName');
    expect(entryObj.content).to.equal('foo');
  });

  it("should also parse string content with nested quotes", function() {
    test = "descriptions: 'this is great: \"?\"'";
    var entryObj = processEntry(test);
    expect(entryObj.propertyName).to.equal('descriptions');
    expect(entryObj.content).to.equal("this is great: '?'");
  });

  it("should convert invalid JSON entry to parsable JSON and return parsed content", function() {
    test = '{name: "foo", type: "String"}';
    var parsedJS = convertToJS(test);
    expect(parsedJS).to.deep.equal({name: 'foo', type: 'String'});

    test = '{name     :   "foo", type     :   "String"}';
    parsedJS = convertToJS(test);
    expect(parsedJS).to.deep.equal({name: 'foo', type: 'String'});
  });

  it("should determine appropriate action based on entry type(obj, str, array)", function() {
    test = 'params: {name: "foo", type: "Number"}';
    var entryObj = processEntry(test);
    expect(entryObj.propertyName).to.equal('params');
    expect(entryObj.content).to.deep.equal([{name: 'foo', type: 'Number'}]);

    test = 'returns:     [{name: "foo", type: "Number"}, {name: "bar", type: "Boolean"}]';
    entryObj = processEntry(test);
    expect(entryObj.propertyName).to.equal('returns');
    expect(entryObj.content).to.deep.equal([{name: 'foo', type: 'Number'}, {name: 'bar', type: 'Boolean'}]);
  });

  it("should parse a file to get documentation info", function() {
    var result = parseComments(fixtures);
    expect(Array.isArray(result)).to.equal(true);
    expect(result.length).to.equal(3);
    expect(result[0].params[0].name).to.equal('stuff');
    expect(result[1].returns[1].type).to.equal('num');
    // console.log(result);
  });

  it("should parse the names of functions even without comments", function() {
    var results = findFunctionInfo(fixtures);
    // console.log('result of function names: ', results);
    expect(results.length).to.equal(7);
    expect(results[0].functionName).to.equal('baz');
    expect(results[1].functionName).to.equal('chopsticks');
    expect(results[2].functionName).to.equal('foo');
    expect(results[3].functionName).to.equal('goldfish');
    expect(results[4].functionName).to.equal('guppy');
  });

  it("should parse info based on both functions and comments", function() {
    var results = parseMain(fixtures);
<<<<<<< HEAD
    expect(results.body.length).to.equal(7);
    expect(results.body[3].functionName).to.equal('goldfish');
    expect(results.body[3].functionName).to.equal('goldfish');
  });

  it("should correctly build the explanations object on each blockObj", function() {
    test = {functionName: "tester", 
    descriptions: "this is my function", 
    examples: "use this",
    tips: "be careful"};
    buildExplanations(test);
    expect(test.description).to.equal(undefined);
    expect(typeof test.explanations).to.equal('object');
    console.log(test.explanations);
    console.log(test); 
  });

  it("should parse a header correctly", function() {
    test = "/* @header   \n@project : AirBNB for cowboys " + 
    "  \n@author : Leo Thorp, Lain Jiang  \n@version: 0.0.1 */";
    console.log('about to parse header');
    console.log('PARSE HEADER RESULT: ', parseHeader(test));
  });

  it("should turn parsedInfo to HTML", function() {
    var results = parsedToHTML(parsedJSON);
    // console.log(results);
  });
});