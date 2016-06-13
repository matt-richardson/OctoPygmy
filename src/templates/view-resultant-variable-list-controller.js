var module = angular.module('octopusApp.projects');

module.controller('foo', function($scope, $modal, busy, octopusRepository) {
    $scope.show = function() {
        var modalInstance = $modal.open({
            backdrop: "static",
            keyboard: !0,
            size: 'lg',
            //template: '<div class="modal-header">    <button class="close" type="button" data-dismiss="modal" aria-hidden="true" ng-hide="isWorking.busy" ng-click="close()">x</button><h3>Deployment process for release {{releaseVersion}} </h3></div><div class="modal-body">foo</div>',
            template: '<div class="modal-header"><button class="close" type="button" data-dismiss="modal" aria-hidden="true" ng-hide="isWorking.busy" ng-click="close()">x</button><h3>All variables for project {{projectName}} </h3></div><div class="modal-body"><div ng-show="projectHasUnsavedChanges" class="note note-warning">Your project includes unsaved changes, which are not visible here.</div><loading-wrapper busy="isLoading"><div class="variables-snapshot" ng-show="variableSetsWaitingToLoad == 0"><div><div class=\'pull-right form-group\'><a ng-show=\'filterVisible\' ng-click="toggleFilter()" style=\'cursor:pointer\'>« hide filter</a><a ng-show=\'!filterVisible\' ng-click="toggleFilter()" style=\'cursor:pointer\'>show filter »</a></div><div ng-show="filterVisible" style=\'clear:both\'><div class=\'form-group\' ><label class=\'control-label col-sm-4\' for=\'search.environmentId\'>Environment</label><div class=\'col-sm-8\'><octo-select placeholder="Any environment"available="scopeValues.Environments"ng-model="search.environmentId"id="search.environmentId" /></div></div><div class=\'form-group\'><label class=\'control-label col-sm-4\' for=\'search.roleIds\'>Roles</label><div class=\'col-sm-8\'><octo-select multiple=\'multiple\'placeholder="Any role"available="scopeValues.Roles"ng-model="search.roleIds"id="search.roleIds" /></div></div><div class=\'form-group\'><label class=\'control-label col-sm-4\' for=\'search.machineId\'>Target</label><div class=\'col-sm-8\'><octo-select placeholder="Any target"available="scopeValues.Machines"ng-model="search.machineId"id="search.machineId" /></div></div><div class=\'form-group\'><label class=\'control-label col-sm-4\' for=\'search.actionId\'>Step</label><div class=\'col-sm-8\'><octo-select placeholder="Any step"available="scopeValues.Actions"ng-model="search.actionId"id="search.actionId" /></div></div><div class=\'form-group\'><label class=\'control-label col-sm-4\' for=\'search.channelId\'>Step</label><div class=\'col-sm-8\'><octo-select placeholder="Any channel"available="scopeValues.Channels"ng-model="search.channelId"id="search.channelId" /></div></div></div></div><table class="table table-bordered fixed-table-width"><thead><tr><th>Name</th><th>Value</th><th>Scope</th><th>Source</th></tr></thead><tbody class="smaller-fonts"><tr ng-repeat="variable in variables | filter:filterScope | orderBy:\'Name\' "><td class="force-word-wrap">{{ variable.Name }}</td><td class="force-word-wrap"><span ng-show="variable.IsSensitive">&#x25cf;&#x25cf;&#x25cf;&#x25cf;&#x25cf;&#x25cf;&#x25cf;&#x25cf;</span>{{ variable.Value }}</td><td class="force-word-wrap"><div ng-repeat="scope in variable.formattedScope"><b>{{ scope.type }}</b>: {{ scope.name }}<br/></div></td><td class="force-word-wrap"><a ng-click="close()" ng-show="variable.SourceId" href=\'#/library/variables/{{ variable.SourceId }}\'>{{ variable.Source }}</a><span ng-show="!variable.SourceId">{{ variable.Source }}</span></td></tr></tbody></table></div></div><div class="modal-footer"><div><button class="btn btn-default" ng-disabled="isLoading.busy" ng-click="close()">close</button></div></div>',
            controller: 'foo',
            dialogClass: "modal"
        });
    }

    var isLoading = $scope.isLoading = busy.create();
    var isSaving = $scope.isSaving = busy.create();
    var formattedScope = {};
    $scope.close = function () { $modalInstance.close(); };

    $scope.formatScope = function(variableId, varscope, scopeValues) {
        if (!varscope || !scopeValues)
            return "";
        if (formattedScope[variableId])
            return formattedScope[variableId];
        var values = [];
        _.each(_.sortBy(_.pairs(varscope), function(pr) {
                return pr[0]
            }), function(pr) {
            var refs = scopeValues[pr[0] + "s"];
            _.each(pr[1], function(id) {
                var item = _.findWhere(refs, {Id: id});
                item && values.push({ type: pr[0], name: item.Name } )
            })
        });
        return formattedScope[variableId] = values,
        values
    };

    //todo: $routeParams.Id is null, so we are hacking around it
    //var projectId = $routeParams.id;
    var projectId = angular.element('h3').injector().get('$routeParams').id;
    $scope.filterVisible = false;
    $scope.toggleFilter = function() { $scope.filterVisible = !$scope.filterVisible; };
    $scope.search = {
        environmentId: "",
        machineId: "",
        actionId: "",
        roleIds: [],
        channelId: ""
    };

    var doesScopeMatch = function(variableScope, searchId, scopeValues) {
        if (variableScope == undefined || searchId == "" || searchId == null){
            return true;
        }
        var match = _.findWhere(scopeValues, {Id: searchId});
        var result = _.indexOf(variableScope, match.Id) > -1;
        return result;
    };

    $scope.filterScope = function(value, index, array) {
        var environmentMatches = doesScopeMatch(value.Scope.Environment, $scope.search.environmentId, $scope.scopeValues.Environments);
        var machineMatches = doesScopeMatch(value.Scope.Machine, $scope.search.machineId, $scope.scopeValues.Machines);
        var stepMatches = doesScopeMatch(value.Scope.Action, $scope.search.actionId, $scope.scopeValues.Actions);
        var channelMatches = doesScopeMatch(value.Scope.Channel, $scope.search.channelId, $scope.scopeValues.Channels);
        var roleMatches = ($scope.search.roleIds.length == 0);
        _.each($scope.search.roleIds, function(roleId) {
            roleMatches = roleMatches || doesScopeMatch(value.Scope.Role, roleId, $scope.scopeValues.Roles);
        })
        return environmentMatches && machineMatches && stepMatches && roleMatches && channelMatches;
    };

    $scope.scopeValues = [];
    $scope.variableSetsLoading = {};
    $scope.variables = [];
    // $scope.projectHasUnsavedChanges = unsavedChanges.hasUnsavedChanges();
    $scope.variableSetsWaitingToLoad = 0;
    isLoading.promise(octopusRepository.Projects.get(projectId).then(function(project) {
        //debugger;
        $scope.projectName = project.Name;
        $scope.variableSetsWaitingToLoad += project.IncludedLibraryVariableSetIds.length;
        isLoading.promise(octopusRepository.Variables.get(project.VariableSetId)).then(function(variableSet) {
            _.each(variableSet.Variables, function(variable) {
                variable.Source = 'Project';
                variable.formattedScope = $scope.formatScope(variable.Id, variable.Scope, variableSet.ScopeValues);
            });
            $scope.scopeValues = variableSet.ScopeValues;
            $scope.variables = $scope.variables.concat(variableSet.Variables);
        })

        _.each(project.IncludedLibraryVariableSetIds, function(includedLibraryVariableSetId) {
            var variableSetLoading = $scope.variableSetsLoading[includedLibraryVariableSetId] = busy.create();
            variableSetLoading.promise(octopusRepository.LibraryVariableSets.get(includedLibraryVariableSetId)).then(function(libraryVariableSet) {
                variableSetLoading.promise(octopusRepository.Variables.get(libraryVariableSet.VariableSetId)).then(function(variableSet) {
                    _.each(variableSet.Variables, function(variable) {
                        variable.Source = libraryVariableSet.Name;
                        variable.SourceId = libraryVariableSet.Id;
                        variable.formattedScope = $scope.formatScope(variable.Id, variable.Scope, variableSet.ScopeValues);
                    });
                    $scope.variables = $scope.variables.concat(variableSet.Variables);
                    $scope.variableSetsWaitingToLoad--;
                })
            })
        })
    }));
});

module.controller('ViewResultantVariablesController', function ($scope, $routeParams, busy, octopusRepository, $route, $modal, unsavedChanges, $modalInstance) {
    var isLoading = $scope.isLoading = busy.create();
    var isSaving = $scope.isSaving = busy.create();
    var formattedScope = {};
    $scope.close = function () { $modalInstance.close(); };

    $scope.formatScope = function(variableId, varscope, scopeValues) {
        if (!varscope || !scopeValues)
            return "";
        if (formattedScope[variableId])
            return formattedScope[variableId];
        var values = [];
        _.each(_.sortBy(_.pairs(varscope), function(pr) {
                return pr[0]
            }), function(pr) {
            var refs = scopeValues[pr[0] + "s"];
            _.each(pr[1], function(id) {
                var item = _.findWhere(refs, {Id: id});
                item && values.push({ type: pr[0], name: item.Name } )
            })
        });
        return formattedScope[variableId] = values,
        values
    };
    var projectId = $routeParams.id;
    $scope.filterVisible = false;
    $scope.toggleFilter = function() { $scope.filterVisible = !$scope.filterVisible; };
    $scope.search = {
        environmentId: "",
        machineId: "",
        actionId: "",
        roleIds: [],
        channelId: ""
    };

    var doesScopeMatch = function(variableScope, searchId, scopeValues) {
        if (variableScope == undefined || searchId == "" || searchId == null){
            return true;
        }
        var match = _.findWhere(scopeValues, {Id: searchId});
        var result = _.indexOf(variableScope, match.Id) > -1;
        return result;
    };

    $scope.filterScope = function(value, index, array) {
        var environmentMatches = doesScopeMatch(value.Scope.Environment, $scope.search.environmentId, $scope.scopeValues.Environments);
        var machineMatches = doesScopeMatch(value.Scope.Machine, $scope.search.machineId, $scope.scopeValues.Machines);
        var stepMatches = doesScopeMatch(value.Scope.Action, $scope.search.actionId, $scope.scopeValues.Actions);
        var channelMatches = doesScopeMatch(value.Scope.Channel, $scope.search.channelId, $scope.scopeValues.Channels);
        var roleMatches = ($scope.search.roleIds.length == 0);
        _.each($scope.search.roleIds, function(roleId) {
            roleMatches = roleMatches || doesScopeMatch(value.Scope.Role, roleId, $scope.scopeValues.Roles);
        })
        return environmentMatches && machineMatches && stepMatches && roleMatches && channelMatches;
    };

    $scope.scopeValues = [];
    $scope.variableSetsLoading = {};
    $scope.variables = [];
    $scope.projectHasUnsavedChanges = unsavedChanges.hasUnsavedChanges();
    $scope.variableSetsWaitingToLoad = 0;
    isLoading.promise(octopusRepository.Projects.get(projectId).then(function(project) {
        $scope.projectName = project.Name;
        $scope.variableSetsWaitingToLoad += project.IncludedLibraryVariableSetIds.length;
        isLoading.promise(octopusRepository.Variables.get(project.VariableSetId)).then(function(variableSet) {
            _.each(variableSet.Variables, function(variable) {
                variable.Source = 'Project';
                variable.formattedScope = $scope.formatScope(variable.Id, variable.Scope, variableSet.ScopeValues);
            });
            $scope.scopeValues = variableSet.ScopeValues;
            $scope.variables = $scope.variables.concat(variableSet.Variables);
        })

        _.each(project.IncludedLibraryVariableSetIds, function(includedLibraryVariableSetId) {
            var variableSetLoading = $scope.variableSetsLoading[includedLibraryVariableSetId] = busy.create();
            variableSetLoading.promise(octopusRepository.LibraryVariableSets.get(includedLibraryVariableSetId)).then(function(libraryVariableSet) {
                variableSetLoading.promise(octopusRepository.Variables.get(libraryVariableSet.VariableSetId)).then(function(variableSet) {
                    _.each(variableSet.Variables, function(variable) {
                        variable.Source = libraryVariableSet.Name;
                        variable.SourceId = libraryVariableSet.Id;
                        variable.formattedScope = $scope.formatScope(variable.Id, variable.Scope, variableSet.ScopeValues);
                    });
                    $scope.variables = $scope.variables.concat(variableSet.Variables);
                    $scope.variableSetsWaitingToLoad--;
                })
            })
        })
    }));
});

var $injector = angular.injector(['ng', 'ngRoute', 'octopusApp.projects', 'ui.bootstrap']);
$injector.invoke(function($rootScope, $compile, $routeParams) {
    var target = "<a ng-controller='foo' ng-click='show()'>click me {{id}}</a>"
    var result = $compile(target)($rootScope);
    angular.element("#bluefin-viewresultantvariablelist-button").append(result);
});