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
		nanoajax.ajax({url: url, method: "PUT", body: JSON.stringify(process)}, function(status, response){
				console.debug("Received update reponse:" + url);
				console.debug(response);
				
				var result = JSON.parse(response);
				
				handle(result);
		});
	}
	
	function notifyProcessUpdated(process, actionsUpdated, manualUpdates, sender)
	{
		console.debug("Notifying tab of updated process");
		console.debug(sender);
		chrome.tabs.sendMessage(sender.tab.id, {message: "process-updated", process: process, actionIdsUpdated: actionsUpdated, actionsNotUpdated: manualUpdates});
		// Send message to tab.
	}
	
	function parameterHasDefaultValue(parameter)
	{
		return (typeof parameter.DefaultValue) != "undefined"
			&& parameter.DefaultValue !== null
			&& parameter.DefaultValue !== "";	
	}
	
	function isNewParameterWithNoDefaultValue(parameter, action)
	{
		return !parameterHasDefaultValue(parameter)
			&& !(parameter.Name in action.Properties);
	}
	
	function updateDeploymentProcessTemplate(octopusRoot, process, template, sender)
	{
		console.debug("Updating deployment process template");
		var actionIdsUpdated = [];
		var manualUpdates = [];
		
		for (var i = 0; i < process.Steps.length; i++){
			if (process.Steps[i].Actions[0].Properties["Octopus.Action.Template.Id"] == template.Id){
				var action = process.Steps[i].Actions[0];
				console.debug("Found template in deployment process: " + action.Name);
				
				if (_.some(template.Parameters, function(p){
					return isNewParameterWithNoDefaultValue(p, action); }))
				{
					console.debug("Template action requires new parameter that has no default value.");
					manualUpdates.push(action.Id);
					continue;
				}
				
				var previous = _.clone(action.Properties);
				
				action.Properties = _.clone(template.Properties);
				action.SensitiveProperties = _.clone(template.SensitiveProperties);

				_.each(["Octopus.Action.TargetRoles", "Octopus.Action.MaxParallelism"], function(key){
					if(_.contains(previous, key)){
						action.Properties[key] = previous[key];
					}
				});

				_.each(template.Parameters, function(parameter){
					if(parameter.Name in previous){
						action.Properties[parameter.Name] = previous[parameter.Name];
					} else if(parameterHasDefaultValue(parameter)){
						action.Properties[parameter.Name] = parameter.DefaultValue;
					}
				});

				action.Properties["Octopus.Action.Template.Id"] = template.Id;
				action.Properties["Octopus.Action.Template.Version"] = template.Version;
				
				actionIdsUpdated.push(action.Id);
			}
		}
		
		postUpdatedDeploymentProcess(octopusRoot, process, function(result){
			notifyProcessUpdated(result, actionIdsUpdated, manualUpdates, sender);
		});
	}
	
	function setup()
	{
		chrome.runtime.onMessage.addListener(requestUpdateAllTemplateUsage);
	}

	return {
		setup: setup
	}
})();
