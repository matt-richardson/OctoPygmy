pygmy3_0.cloneStepHandler = (function() {

	function handlePutResponse(status, putResponse, sendResponse, stepId, deploymentProcessId)
	{
		console.debug("Received put reponse");
		console.debug(putResponse);

		var result = JSON.parse(putResponse);
		var response;
		if (status == 200 ) {
			response = { message: 'clone-step-response', properties: { status: 'success', stepId: stepId, deploymentProcessId: deploymentProcessId }};
		}
		else {
			response = { message: 'clone-step-response', properties: { status: 'failure', errorMessage: result.ErrorMessage, errors: result.Errors }}
		}
		console.log('sending clone-step-response: ' + JSON.stringify(response));
		sendResponse(response);
	}

	function stepNameExists(steps, name) {
		return steps.filter(function(step) {
			return step.Name == name
		}).length > 0;
	}

	function handleGetResponse(response, sendResponse, stepId, deploymentProcessId, url, putJsonRequest)
	{
		var step = response.Steps.filter(function(step) { return step.Id == stepId })[0];
		var newStep = JSON.parse(JSON.stringify(step));
		newStep.Id = "";

		var suffix = " - clone";
		var counter = 0;
		while (stepNameExists(response.Steps, newStep.Name + suffix)) {
			suffix = " - clone (" + ++counter + ")";
		}
		newStep.Name = newStep.Name + suffix

		for(i = 0; i < newStep.Actions.length; i++) {
			newStep.Actions[i].Id = "";
			newStep.Actions[i].Name = newStep.Actions[i].Name + suffix
		}
		response.Steps.push(newStep);

		putJsonRequest(url, response, function (status, response) { handlePutResponse(status, response, sendResponse, stepId, deploymentProcessId); })
	}

	function handleCloneStepRequest(request, sendResponse, octopusRoot, getJsonResponse, handleGetResponse, putJsonRequest) {
		var stepId = request.properties.stepId;
		var deploymentProcessId = request.properties.deploymentProcessId;
		console.log("Cloning step with id '" + stepId + "', deploymentProcessId '" + deploymentProcessId + "'");

		var url = octopusRoot + "/api/deploymentprocesses/" + deploymentProcessId;

		var handler = function (response) { handleGetResponse(response, sendResponse, stepId, deploymentProcessId, url, putJsonRequest); };
		getJsonResponse(url, handler);
	}

	function cloneStep(request, sender, sendResponse, cloneStepHandler)	{
		if (request.message == 'clone-step')
		{
			var octopusRoot = sender.tab.url.substring(0,sender.tab.url.indexOf('/app'));
			cloneStepHandler = cloneStepHandler || handleCloneStepRequest; //allow tests to override
			cloneStepHandler(request, sendResponse, octopusRoot, getJsonResponse, handleGetResponse, putJsonRequest)

			return true; // see https://developer.chrome.com/extensions/runtime#event-onMessageExternal
		}
	}

	function putJsonRequest(url, body, handlePutResponse) {
		nanoajax.ajax({url: url, method: "PUT", body: JSON.stringify(body)}, handlePutResponse);
	}

	function getJsonResponse(url, handler) {
		nanoajax.ajax(url, function(status, response){
			console.debug("Received " + status + " response from " + url);
			console.debug(response);
			var result = JSON.parse(response);
			handler(result);
		});
	}

	function setup()
	{
		chrome.runtime.onMessage.addListener(cloneStep);
	}

	return {
		setup: setup,
		handleCloneStepRequest: handleCloneStepRequest,
		cloneStep: cloneStep,
		handlePutResponse: handlePutResponse,
		handleGetResponse: handleGetResponse
	}
})();
