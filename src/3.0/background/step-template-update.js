pygmy3_0.stepTemplateUpdate = (function() {
	
	function requestUpdateAllTemplateUsage(request, sender, sendResponse)
	{
		if (request.message == 'update-template-usage')
		{
			console.log("Updating step template usage");
			var octopusRoot = sender.tab.url.substring(0,sender.url.indexOf('/app'));
			var templateId = sender.tab.url.split("/").slice(-1)[0];
			console.info("Step template id updating: " + templateId);
			
			if (templateId === null || templateId == ""){
				console.log("No template id found, skipping");
				return;
			}

			getStepTemplate(octopusRoot, templateId, function receiveTemplate(template){
				getStepTemplateUsage(octopusRoot, template, function receiveUsage(usage){
					for(var i = 0; i < usage.length; i++){

						getDeploymentProcess(octopusRoot, usage[i].Links.DeploymentProcess, function(process){
							updateDeploymentProcessTemplate(octopusRoot, process, template, sender,
								_.partial(processUpdated, octopusRoot, sender),
								_.partial(processManual, octopusRoot, sender),
								processNoUpdate
								);
						});
					}
				});
			});
		}
	}
	
	function processUpdated(octopusRoot, sender, process, actionIdsUpdated, manualUpdates)
	{
		postUpdatedDeploymentProcess(octopusRoot, process, function(result){
			notifyProcessUpdated(result, actionIdsUpdated, manualUpdates, sender);
		});
	}

	function processManual(octopusRoot, sender, process, manualUpdates )
	{
		notifyProcessUpdated(process, [], manualUpdates, sender);
	}
	
	function processNoUpdate(process)
	{
		console.info("Deployment process for " + process.ProjectId + " was already up to date.");
	}
	
	function getJsonResponse(url, handle)
	{
		nanoajax.ajax(url, function(status, response){
			console.debug("Received " + status + " response from " + url);
			console.debug(response);
			var result = JSON.parse(response);
			handle(result);
		});
	}
	
	function getStepTemplate(octopusRoot, templateId, handle)
	{
		var templateUrl = octopusRoot + "/api/actiontemplates/" + templateId;
		getJsonResponse(templateUrl, handle);
	}
	
	function getStepTemplateUsage(octopusRoot, template, handle)
	{
		var usageUrl = octopusRoot + "/api/actiontemplates/" + template.Id + "/usage";
		getJsonResponse(usageUrl, handle);
	}

	function getDeploymentProcess(octopusRoot, processUrl, handle)
	{
		var url = octopusRoot + processUrl;
		getJsonResponse(url, handle);
	}
	
	function postUpdatedDeploymentProcess(octopusRoot, process, handle)
	{
		var url = octopusRoot + process.Links.Self;
		console.info("Posting updated deployment process: " + url);	
		nanoajax.ajax({url: url, method: "PUT", body: JSON.stringify(process)}, function(status, response){
				console.debug("Received update reponse:" + url);
				console.debug(response);
				
				var result = JSON.parse(response);
				
				handle(result);
		});
	}
	
	function notifyProcessUpdated(process, actionsUpdated, manualUpdates, sender)
	{
		console.log("Notifying tab of updated process");
		chrome.tabs.sendMessage(sender.tab.id, {message: "process-updated", process: process, actionIdsUpdated: actionsUpdated, actionsNotUpdated: manualUpdates});
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
	
	function updateDeploymentProcessTemplate(octopusRoot, process, template, sender, updated, updateManually, noUpdate)
	{
		console.log("Updating deployment process template");
		var actionIdsUpdated = [];
		var manualUpdates = [];
		
		for (var i = 0; i < process.Steps.length; i++){
			for (var actionIndex = 0; actionIndex < process.Steps[i].Actions.length; actionIndex++){
				if (process.Steps[i].Actions[actionIndex].Properties["Octopus.Action.Template.Id"] == template.Id){
					var action = process.Steps[i].Actions[actionIndex];
					console.log("Found template in deployment process: " + action.Name);

					if (action.Properties["Octopus.Action.Template.Version"] == template.Version){
						console.log("The " + action.Name + " is already up to date skipping.");
						continue;
					}

					if (_.some(template.Parameters, function(p){
						return isNewParameterWithNoDefaultValue(p, action); }))
					{
						console.log("Template action requires new parameter that has no default value.");
						manualUpdates.push(action.Id);
						continue;
					}

					var previous = _.clone(action.Properties);

					action.Properties = _.clone(template.Properties);
					action.SensitiveProperties = _.clone(template.SensitiveProperties);

					// I wish there was a way to know which Action properties came from the project's step action as opposed to the
					// step template's action. Some rule so as not to need to individually list them here.
					_.each(["Octopus.Action.TargetRoles", "Octopus.Action.MaxParallelism", "Octopus.Action.RunOnServer"], function(key){
						if(_.has(previous, key)){
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
		}
		
		if(actionIdsUpdated.length > 0){
			updated(process, actionIdsUpdated, manualUpdates);
		} else if (manualUpdates.length > 0){
			updateManually(process, manualUpdates);
		} else {
			noUpdate(process);
		}
	}
	
	function setup()
	{
		chrome.runtime.onMessage.addListener(requestUpdateAllTemplateUsage);
	}

	return {
		setup: setup,
		updateDeploymentProcessTemplate: updateDeploymentProcessTemplate
	}
})();
