pygmy3_0.cloneStepHandler = (function() {

	function cloneStep(request, sender, sendResponse)
	{
		if (request.message == 'clone-step')
		{
			var stepId = request.properties.stepId;
			var deploymentProcessId = request.properties.deploymentProcessId;
			console.log("Cloning step with id '" + stepId + "', deploymentProcessId '" + deploymentProcessId + "'");
			var octopusRoot = sender.tab.url.substring(0,sender.url.indexOf('/app'));

			var url = octopusRoot + "/api/deploymentprocesses/" + deploymentProcessId;
			getJsonResponse(url, function(response) {
				var step = response.Steps.filter(function(step) { return step.Id == stepId })[0];
				var newStep = JSON.parse(JSON.stringify(step));
				newStep.Id = "";
				newStep.Name = newStep.Name + " - clone"
				for(i = 0; i < newStep.Actions.length; i++) {
					newStep.Actions[i].Id = "";
					newStep.Actions[i].Name = newStep.Actions[i].Name + " - clone"
				}
				response.Steps.push(newStep);

				nanoajax.ajax({url: url, method: "PUT", body: JSON.stringify(response)}, function(status, response){
					console.debug("Received update reponse:" + url);
					console.debug(response);

					var result = JSON.parse(response);
					debugger;
					//handle(result);
				});
			});


		}
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

	function setup()
	{
		chrome.runtime.onMessage.addListener(cloneStep);
	}

	return {
		setup: setup,
	}
})();
