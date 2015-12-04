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
					console.debug("Received put reponse:" + url);
					console.debug(response);

					var result = JSON.parse(response);
					var response;
					if (status == 200 ) {
						response = { message: 'clone-step-response', properties: { status: 'success', stepId: stepId, deploymentProcessId: deploymentProcessId }};
					}
					else {
						response = { message: 'clone-step-response', properties: { status: 'failure', errorMessage: result.ErrorMessage, errors: result.Errors }}
					}
					console.log('sending clone-step-response: ' + response);
					sendResponse(response);
				});
			});

			return true; // see https://developer.chrome.com/extensions/runtime#event-onMessageExternal
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
