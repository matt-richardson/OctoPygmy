pygmy3_0.stepTemplateUpdate = (function() {
	
	function requestUpdateAllTemplateUsage(request, sender, sendResponse)
	{
		if (request.message == 'update-template-usage')
		{
			console.log("Updating step template usage");
			
			//var template = getStepTemplate(request.templateId);
			//var usage = getStepTemplateUsage(request.templateId);
		}
	}

	function setup()
	{
		chrome.runtime.onMessage.addListener(requestUpdateAllTemplateUsage);
	}

	return {
		setup: setup
	}
})();


/*
mergeLatest = function()
{
// Temporary save the current step's properties (previous): DeploymentProcess[-ACTION-].Actions[0].Properties
// Copy the Step template properties to the current step action properties: ActionTemplates[-TEMPLATE-].Properties
// Copy the Step template sensitive properties to the current step action sensitive properties: ActionTemplates[-TEMPLATE-].SensitiveProperties

// Copy the original action properties for TargetRoles and MaxParallelism from the original step: DeploymentProcess[-ACTION-].Actions[0].Properties[~TargetRoels~|MaxParallelism] = Previous[~TargetRoels~|MaxParallelism]

// Copy the original action properties for each parameter in the template that has the same name as the steps properties.
// If an existing current step property doesn't exist:
// Add the new DeploymentProcess[...].Actions[0].Properties[NAME] with the ActionTemplates[...].Parameter.DefaultValue

// Set the Template.ID and Template.Version in the action properties to that of the template.

var previous=_.clone($scope.action.Properties);
$scope.action.Properties = _.clone($scope.actionTemplate.Properties),
$scope.action.SensitiveProperties=_.clone($scope.actionTemplate.SensitiveProperties),

_.each(previous,function(v,k)
{
_.contains(["Octopus.Action.TargetRoles","Octopus.Action.MaxParallelism"],k) && ($scope.action.Properties[k]=v)
}),

_.each($scope.actionTemplate.Parameters,function(parameter)
{
parameter.Name in previous
? $scope.action.Properties[parameter.Name] = previous[parameter.Name] 
: "undefined" != typeof parameter.DefaultValue
&& null !== parameter.DefaultValue 
&& "" !== parameter.DefaultValue
&& ($scope.action.Properties[parameter.Name]=parameter.DefaultValue)
}),

$scope.action.Properties["Octopus.Action.Template.Id"] = $scope.actionTemplate.Id,
$scope.action.Properties["Octopus.Action.Template.Version"]=$scope.actionTemplate.Version
}
*/

// So for Blue fin:
/*
When they click 'Update All':
For each project that uses the template (/api/actiontemplates/[templateid]/usage
Get the deployment process (usage[x].Links.DeploymentProcess)
Get the template (api/actiontemplates/[templateid])
Find the matching step based on 'Octopus.Action.Template.Id' (process.steps[x].Actions[0].Properties['Octopus.Action.Template.Id'])
Copy all the actionTemplate.Propertties to the Process setp Actions properties (process.steps[x].Actions[0].Properties = template.Properties)
Same for sensitive properties (process.steps[x].Actions[0].SensitiveProperties = template.SensitiveProperties)
Update the TargetRoles and MaxParallelism if available in the original step (in the Properties).
Add new step template parameters that have a default value. (template.Parameters | Where p.DefaultValue Is not null, empty, or undefined)
IF a parameter does NOT have a default value, mark as not auto-updatedable.
Set the Template Id and Version (in the Properties)
*/