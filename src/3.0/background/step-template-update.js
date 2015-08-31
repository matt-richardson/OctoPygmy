pygmy3_0.stepTemplateUpdate = (function() {
	
	function requestUpdateAllTemplateUsage(request, sender, sendResponse)
	{
		if (request.message == 'update-template-usage')
		{
			console.log("Updating step template usage");			
			var octopusRoot = sender.url.substring(0,sender.url.indexOf('/app'));
			var templateId = sender.url.split("/").slice(-1)[0];			
			console.debug("  Step template id updating: " + templateId);
			
			getStepTemplate(octopusRoot, templateId, function receiveTemplate(template){
				getStepTemplateUsage(octopusRoot, template, function receiveUsage(usage){
					for(var i = 0; i < usage.length; i++){
						
						getDeploymentProcess(octopusRoot, usage[i].Links.DeploymentProcess, function(process){
							updateDeploymentProcessTemplate(octopusRoot, process, template, sender);
						});
					}
				});
			});

		}
	}

	function getStepTemplate(octopusRoot, templateId, handle)
	{	
		var templateUrl = octopusRoot + "/api/actiontemplates/" + templateId;	
		console.debug("Getting step template: " + templateUrl);
		nanoajax.ajax(templateUrl, function(status, response){
				console.debug('Received step template:' + templateUrl);
				console.debug(response);
				
				var template = JSON.parse(response);
				
				handle(template);
		});		
	}
	
	function getStepTemplateUsage(octopusRoot, template, handle)
	{
		var usageUrl = octopusRoot + "/api/actiontemplates/" + template.Id + "/usage";
		console.debug("Getting step template usage: " + usageUrl);	
		nanoajax.ajax(usageUrl, function(status, response){
				console.debug('Received step template usage:' + usageUrl);
				console.debug(response);
				
				var usage = JSON.parse(response);
				
				handle(usage);
		});
	}

	function getDeploymentProcess(octopusRoot, processUrl, handle)
	{
		var url = octopusRoot + processUrl;
		console.debug("Getting deployment process: " + url);	
		nanoajax.ajax(url, function(status, response){
				console.debug("Received deployment process:" + url);
				console.debug(response);
				
				var result = JSON.parse(response);
				
				handle(result);
		});
	}
	
	function postUpdatedDeploymentProcess(octopusRoot, process, handle)
	{
		var url = octopusRoot + process.Links.Self;
		console.debug("Posting updated deployment process: " + url);	
		nanoajax.ajax(url, function(status, response){
				//console.debug("Received update reponse:" + url);
				//console.debug(response);
				
				//var result = JSON.parse(response);
				
				handle({});
		});
	}
	
	function notifyProcessUpdated(process, actionsUpdated, sender)
	{
		console.debug("Notifying tab of updated process");
		console.debug(sender);
		chrome.tabs.sendMessage(sender.tab.id, {message: "process-updated", process: process, actionIdsUpdated: actionsUpdated});
		// Send message to tab.
	}
	
	function updateDeploymentProcessTemplate(octopusRoot, process, template, sender)
	{
		console.debug("Updating deployment process template");
		var actionIdsUpdated = [];
		
		for (var i = 0; i < process.Steps.length; i++)
		{
			if (process.Steps[i].Actions[0].Properties["Octopus.Action.Template.Id"] == template.Id)
			{
				console.debug("Found template in deployment process");
				actionIdsUpdated.push(process.Steps[i].Actions[0].Id);
			}
		}
		
		postUpdatedDeploymentProcess(octopusRoot, process, function(result){
			notifyProcessUpdated(process, actionIdsUpdated, sender);
		});
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