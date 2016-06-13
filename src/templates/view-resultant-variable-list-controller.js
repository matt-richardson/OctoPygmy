function modalController ($scope, $routeParams, busy, octopusRepository, $route, $modal, unsavedChanges, $modalInstance) {
    var isLoading = $scope.isLoading = busy.create();
    var isSaving = $scope.isSaving = busy.create();
    var formattedScope = {};
    $scope.close = function () { $modalInstance.close(); };

    var formatScope = function(variableId, varscope, scopeValues) {
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
                variable.formattedScope = formatScope(variable.Id, variable.Scope, variableSet.ScopeValues);
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
                        variable.formattedScope = formatScope(variable.Id, variable.Scope, variableSet.ScopeValues);
                    });
                    $scope.variables = $scope.variables.concat(variableSet.Variables);
                    $scope.variableSetsWaitingToLoad--;
                })
            })
        })
    }));
};
