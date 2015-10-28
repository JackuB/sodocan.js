angular.module('sodone')
.directive('sodocanMethod', function(){
  return {
    restrict: 'A',
    templateUrl: 'angular-sodone/method/methodTpl.html'
  };
})
.controller('sodocanMethodCtrl',
            ['$scope','sodocanAPI','sodocanRouter',
              function($scope,sodocanAPI,sodocanRouter) {
  $scope.printReference = function(refType){
    var result = ''; 
    if(refType === 'returns' && $scope.method.reference.returns.length > 0){
      result+= ' => ';
    }
    for(var i = 0; i < $scope.method.reference[refType].length; i++){
      var name = $scope.method.reference[refType][i].name;
      var type = $scope.method.reference[refType][i].type;
      if(type){
        result+= type;
      }
      if(type && name){
        result+= ':'; 
      }
      if(name){
        result+= name;
      } 
      if(i !== $scope.method.reference[refType].length - 1){
        result+=', ';
      }  
    }
    return result; 
  };
  // console.log('methods:',$scope.method);
  // console.log('$scope:',$scope);
  // sodocanAPI.getDescriptions($scope.method.functionName,5,5, function(err,data){
  //   console.log('descriptions',err,data); 
  // });
  // sodocanAPI.getExamples($scope.method.functionName,5,5, function(err,data){
  //   console.log('examples',err,data); 
  // });
  sodocanAPI.getDescriptions($scope.method.functionName,5,5, function(err,data){
    // console.log('tips',sodocanAPI.docs,data); 
  });
}]);