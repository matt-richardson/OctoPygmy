describe('ViewResultantVariableListController', function() {
  var sut;

  beforeEach(angular.mock.module("ngRoute", "octopusApp.projects", "ui.bootstrap", function($provide) {
    $provide.service('octopusRepository', function() {
      return {
          Projects: function() {
            return {
              get: function(projectId) {
                var mockProject = {
                  Name : "MockProject",
                  VariableSetId: 1,
                  IncludedLibraryVariableSetIds: [2,3]
                };
                return Octopus.Client.PromiseWrapper(function(resolve, reject) { resolve(mockProject) })
              }
            }
          }(),
          Variables: function() {
            //todo: this needs to return diff values based on inputs
            var mockVariableSet = {
              Variables: [
                { Id: 123, Scope: { Environment: ["environments-1"]}},
                { Id: 456, Scope: { } },
              ],
              ScopeValues: {
                "Environments": [{ Id: "environments-1", Name: "Local" }]
              }
            };
            return {
              get: function(variableId) {
                return Octopus.Client.PromiseWrapper(function(resolve, reject) { resolve(mockVariableSet) })
              }
            }
          }(),
          LibraryVariableSets: function() {
            var mockLibraryVariableSet = {
              VariableSetId: 111,
              Name: "Libary Variable Set 1",
              Id: "LibraryVariableSets-1"
            }
            return {
              get: function(libraryVariableId){
                return Octopus.Client.PromiseWrapper(function(resolve, reject) { resolve(mockLibraryVariableSet) })
              }
            }
          }()
        }
    })
  }));

  var $controller;

  beforeEach(angular.mock.inject(function(_$controller_){
    $controller = _$controller_;
  }));

  describe('$scope.toggleFilter', function() {
    it('toggleFilter() toggles the value of filterVisible', function() {
      var $scope = {};
      var $modalInstance = { close : function() {}}
      var controller = $controller('ViewResultantVariablesController', { $scope: $scope, $modalInstance: $modalInstance });
      var oldValue = $scope.filterVisible;
      $scope.toggleFilter();
      expect($scope.filterVisible).toEqual(!oldValue);
      $scope.toggleFilter();
      expect($scope.filterVisible).toEqual(oldValue);
    });
  });

  describe("$scope.formatScope", function() {
    var $scope;
    var $modalInstance;
    var controller;

    beforeEach(function() {
      $scope = {};
      $modalInstance = { close : function() {}}
      controller = $controller('ViewResultantVariablesController', { $scope: $scope, $modalInstance: $modalInstance });

    })
    it('caches the lookup', function() {
      var variableId = 1;
      var varScope = { Environment: ["environments-1"]};
      var scopeValues =  { "Environments": [{ Id: "environments-1", Name: "Local" }]};
      var result = $scope.formatScope(variableId, varScope, scopeValues);
      expect(result.length).toEqual(1);
      expect(result[0].type).toEqual('Environment');
      expect(result[0].name).toEqual('Local');
      scopeValues =  { "Environments": [{ Id: "environments-1", Name: "this shouldnt be used if its using the cache" }]};
      result = $scope.formatScope(variableId, varScope, scopeValues);
      expect(result.length).toEqual(1);
      expect(result[0].type).toEqual('Environment');
      expect(result[0].name).toEqual('Local');
    });

    it('maps ids to names', function() {
      var variableId = 1;
      var varScope = { Environment: ["environments-1"]};
      var scopeValues =  { "Environments": [{ Id: "environments-1", Name: "Local" }]};
      var result = $scope.formatScope(variableId, varScope, scopeValues);
      expect(result.length).toEqual(1);
      expect(result[0].type).toEqual('Environment');
      expect(result[0].name).toEqual('Local');
    });
  });

  // todo: needs the async promise stuff to be made sync
  // maybe http://www.bradoncode.com/blog/2015/07/13/unit-test-promises-angualrjs-q/ is relevant?
  // describe('variable scope formatting', function() {
  //   it('should format the scope', function() {
  //     var $scope = {};
  //     var $modalInstance = { close : function() {}}
  //     var controller = $controller('ViewResultantVariablesController', { $scope: $scope, $modalInstance: $modalInstance });
  //     expect($scope.variables.length).toEqual(3);
  //   });
  // });
});