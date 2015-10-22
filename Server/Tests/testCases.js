var testCases = exports.testCases = {
  'api/sodocan': {
    searchObject: {project: 'sodocan'},
    contexts: {all:[]}
  },
  'api/sodocan/ref/makeSkele': {
    searchObject: {project: 'sodocan', functionName: 'makeSkele'},
    contexts: {all:[]}
  },
  'api/sodocan/examples': {
    searchObject: {project: 'sodocan'},
    contexts: {examples:[]}
  },
  'api/sodocan/descriptions/all': {
    searchObject: {project: 'sodocan'},
    contexts: {descriptions:['all']}
  },
  'api/sodocan/descriptions/1/10': {
    searchObject: {project: 'sodocan', functionName: 'makeSkele'},
    contexts: {descriptions:['1', '10']}
  },
  'api/sodocan/all/all': {
    searchObject: {project: 'sodocan'},
    contexts: {all:['all','all']}
  },
  'api/sodocan/tips/descriptions': {
    searchObject: {project: 'sodocan'},
    contexts: {tips: [], descriptions: []}
  },
  'api/sodocan/all/tips/0': {
    searchObject: {project: 'sodocan'},
    contexts: {all: ['all'], tips: ['0']}
  },
  'api/sodocan/ref/makeItPretty/descriptions/entryID-128/all': {
    searchObject: {project: 'sodocan', functionName: 'makeItPretty'},
    contexts: {descriptions: ['entryID-128', 'all']}
  },
  'api/sodocan/ref/makeItPretty/descriptions/entryID-128/additionID-14': {
    searchObject: {project: 'sodocan', functionName: 'makeItPretty'},
    contexts: {descriptions: ['entryID-128', 'additionID-14']}
  }
};