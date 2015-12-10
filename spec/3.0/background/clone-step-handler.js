describe("clone-step-handler", function() {

	describe("cloneStep", function () {

		it("calls handleCloneStepRequest when its a 'clone-step' message", function() {
			function fakeCloneStepHandler (request, sendResponse, octopusRoot, getJsonResponse, handleGetResponse, putJsonRequest) {
				expect(request).toEqual(theRequest);
				expect(sendResponse).toEqual(theSendResponse);
				expect(octopusRoot).toEqual('http://baseUrl');
				expect(getJsonResponse).not.toBe(null);
				expect(handleGetResponse).not.toBe(null);
				expect(putJsonRequest).not.toBe(null);
			}
			pygmy3_0.cloneStepHandler.cloneStepHandler = fakeCloneStepHandler;

			var theRequest = { 'message': 'clone-step' };
			var theSender = { 'tab': { 'url': 'http://baseUrl/app#/'}}
			var theSendResponse= {};

			pygmy3_0.cloneStepHandler.cloneStep(theRequest, theSender, theSendResponse, fakeCloneStepHandler);
		});

		it("returns true when its a 'clone-step' message", function() {
			var theRequest = { 'message': 'clone-step' };
			var theSender = { 'tab': { 'url': 'http://baseUrl/app#/'}}
			var theSendResponse= {};

			var result = pygmy3_0.cloneStepHandler.cloneStep(theRequest, theSender, theSendResponse, function() {});
			expect(result).toBe(true);
		});

		it("does nothing when its not a 'clone-step' message", function() {
			var called = false;

			var theRequest = { 'message': 'other-message-type' };
			var theSender = { 'tab': { 'url': 'http://baseUrl/app#/'}}
			var theSendResponse= {};

			pygmy3_0.cloneStepHandler.cloneStep(theRequest, theSender, theSendResponse, function() { called = true });
			expect(called).toBe(false);
		});
	});

	describe("handleCloneStepRequest", function () {
		it("extracts parameters, requests json, then calls handleGetResponse function", function() {
			var request = { "properties": { "stepId" : "123", "deploymentProcessId" : "456"}}
			var octopusRoot = "http://baseUrl";
			var sendResponse = "sendResponse";
			var expectedUrl = "http://baseUrl/api/deploymentprocesses/456";
			function fakeGetJsonResponse(url, responseFunc) {
				expect(url).toEqual(expectedUrl);
				responseFunc("response");
			}
			function fakeHandleGetResponse(response, sendResponse, stepId, deploymentProcessId, url, putJsonRequest) {
				expect(response).toEqual("response");
				expect(sendResponse).toEqual("sendResponse");
				expect(stepId).toEqual("123");
				expect(deploymentProcessId).toEqual("456");
				expect(url).toEqual(expectedUrl);
				expect(putJsonRequest).toEqual(fakePutJsonRequest);
			 }
			 function fakePutJsonRequest() { }

			pygmy3_0.cloneStepHandler.handleCloneStepRequest(request, sendResponse, octopusRoot, fakeGetJsonResponse, fakeHandleGetResponse, fakePutJsonRequest);
		});
	});

	describe("handleGetResponse", function () {
		it("adds new step, and calls put handler", function() {
			var response = {
				'Steps': [
					{
						'Id': '123',
						'Name': 'Step 1',
						'Actions': [ { 'Id': '111',  'Name': 'Action 1' } ]
					},
					{
						'Id': '124',
						'Name': 'Step 2',
						'Actions': [ { 'Id': '222', 'Name': 'Action 2' } ]
					}
				]
			};
			var sendResponse = "";
			var stepId = "123";
			var deploymentProcessId = "456";
			var theUrl = "http://octopus.example.org"
			function fakePutJsonRequestHandler(url, putResponse, putJsonRequestHandler) {
				expect(url).toEqual(theUrl);
				expect(putResponse.Steps.length).toEqual(3);
				expect(putResponse.Steps[2].Id).toEqual("");
				expect(putResponse.Steps[2].Name).toEqual("Step 1 - clone");
				expect(putResponse.Steps[2].Actions[0].Id).toEqual("");
				expect(putResponse.Steps[2].Actions[0].Name).toEqual("Action 1 - clone");
			}
			pygmy3_0.cloneStepHandler.handleGetResponse(response, sendResponse, stepId, deploymentProcessId, theUrl, fakePutJsonRequestHandler);
		});

		it("handles naming clash", function () {
			var response = {
				'Steps': [
					{
						'Id': '123',
						'Name': 'Step 1',
						'Actions': [ { 'Id': '111',  'Name': 'Action 1' } ]
					},
					{
						'Id': '124',
						'Name': 'Step 1 - clone',
						'Actions': [ { 'Id': '222', 'Name': 'Action 1 - clone' } ]
					}
				]
			};
			var sendResponse = "";
			var stepId = "123";
			var deploymentProcessId = "456";
			var theUrl = "http://octopus.example.org"
			function fakePutJsonRequestHandler(url, putResponse, putJsonRequestHandler) {
				expect(url).toEqual(theUrl);
				expect(putResponse.Steps.length).toEqual(3);
				expect(putResponse.Steps[2].Id).toEqual("");
				expect(putResponse.Steps[2].Name).toEqual("Step 1 - clone (1)");
				expect(putResponse.Steps[2].Actions[0].Id).toEqual("");
				expect(putResponse.Steps[2].Actions[0].Name).toEqual("Action 1 - clone (1)");
			}
			pygmy3_0.cloneStepHandler.handleGetResponse(response, sendResponse, stepId, deploymentProcessId, theUrl, fakePutJsonRequestHandler);
		});
	});

	describe("handlePutResponse", function () {
		it("sends a 'success' message if put was successful", function() {
			var status = 200;
			var putResponse = "{}";
			var actualResponse = "";
			var stepId = "123";
			var deploymentProcessId = "123";

			function sendResponse(response) { actualResponse = response; }

			pygmy3_0.cloneStepHandler.handlePutResponse(status, putResponse, sendResponse, stepId, deploymentProcessId);

			expect(actualResponse.message).toEqual('clone-step-response');
			expect(actualResponse.properties.status).toEqual('success');
			expect(actualResponse.properties.stepId).toEqual(stepId);
			expect(actualResponse.properties.deploymentProcessId).toEqual(deploymentProcessId);
		});

		it("sends a 'failure' message if put was unsuccessful", function() {
			var status = 500;
			var putResponse = '{"ErrorMessage": "an error occurred", "Errors" : [ "error1", "error2" ] }';
			var actualResponse = "";
			var stepId = "123";
			var deploymentProcessId = "123";

			function sendResponse(response) { actualResponse = response; }

			pygmy3_0.cloneStepHandler.handlePutResponse(status, putResponse, sendResponse, stepId, deploymentProcessId);

			expect(actualResponse.message).toEqual('clone-step-response');
			expect(actualResponse.properties.status).toEqual('failure');
			expect(actualResponse.properties.stepId).toEqual(undefined);
			expect(actualResponse.properties.deploymentProcessId).toEqual(undefined);
			expect(actualResponse.properties.errorMessage).toEqual('an error occurred');
			expect(actualResponse.properties.errors).toEqual(["error1", "error2"])
		});
	});

});
