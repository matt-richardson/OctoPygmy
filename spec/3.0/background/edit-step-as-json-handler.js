describe("edit-step-as-json-handler", function() {
	var originalConsoleDebug;
	var originalConsoleLog;

	beforeEach(function () {
		originalConsoleDebug = console.debug;
		originalConsoleLog = console.log;
		console.debug = function() {};
		console.log = function() {};
	});

	afterEach(function() {
		console.debug = originalConsoleDebug;
		console.log = originalConsoleLog
	});

	describe("editStepAsJson", function() {
		it ("calls handleEditStepAsJsonRequest if its a 'edit-step-as-json' message", function() {
			function fakeEditStepAsJsonHandler (request, sendResponse, octopusRoot, getJsonResponse, handleEditStepGetResponse) {
				expect(request).toEqual(theRequest);
				expect(sendResponse).toEqual(theSendResponse);
				expect(octopusRoot).toEqual('http://baseUrl');
				expect(getJsonResponse).not.toBe(null);
				expect(handleEditStepGetResponse).not.toBe(null);
			}
			function fakeEditedStepAsJsonHandler (request, sendResponse, octopusRoot, getJsonResponse, handleEditedStepGetResponse) {
				throw 'this should not have been called';
			}

			var theRequest = { 'message': 'edit-step-as-json' };
			var theSender = { 'tab': { 'url': 'http://baseUrl/app#/'}}
			var theSendResponse= {};

			pygmy3_0.editStepAsJsonHandler.editStepAsJson(theRequest, theSender, theSendResponse, fakeEditStepAsJsonHandler, fakeEditedStepAsJsonHandler);
		});

		it ("returns true if its a 'edit-step-as-json' message", function() {
			var theRequest = { 'message': 'edit-step-as-json' };
			var theSender = { 'tab': { 'url': 'http://baseUrl/app#/'}}
			var theSendResponse= {};

			var result = pygmy3_0.editStepAsJsonHandler.editStepAsJson(theRequest, theSender, theSendResponse, function () {}, function () {});
			expect(result).toBe(true);
		});

		it ("calls handleEditStepAsJsonRequest if its a 'edited-step-as-json' message", function() {
			function fakeEditStepAsJsonHandler (request, sendResponse, octopusRoot, getJsonResponse, handleEditStepGetResponse) {
				throw 'this should not have been called';
			}
			function fakeEditedStepAsJsonHandler (request, sendResponse, octopusRoot, getJsonResponse, handleEditedStepGetResponse) {
				expect(request).toEqual(theRequest);
				expect(sendResponse).toEqual(theSendResponse);
				expect(octopusRoot).toEqual('http://baseUrl');
				expect(getJsonResponse).not.toBe(null);
				expect(handleEditedStepGetResponse).not.toBe(null);
			}

			var theRequest = { 'message': 'edited-step-as-json' };
			var theSender = { 'tab': { 'url': 'http://baseUrl/app#/'}}
			var theSendResponse= {};

			pygmy3_0.editStepAsJsonHandler.editStepAsJson(theRequest, theSender, theSendResponse, fakeEditStepAsJsonHandler, fakeEditedStepAsJsonHandler);
		});

		it ("returns true if its a 'edited-step-as-json' message", function() {
			var theRequest = { 'message': 'edited-step-as-json' };
			var theSender = { 'tab': { 'url': 'http://baseUrl/app#/'}}
			var theSendResponse= {};

			var result = pygmy3_0.editStepAsJsonHandler.editStepAsJson(theRequest, theSender, theSendResponse, function () {}, function () {});
			expect(result).toBe(true);
		});

		it ("does nothing if its not a 'edit-step-as-json' or 'edited-step-as-json' message", function() {
			var theRequest = { 'message': 'some-different-message' };
			var theSender = { 'tab': { 'url': 'http://baseUrl/app#/'}}
			var theSendResponse= {};

			var called = false;
			var result = pygmy3_0.editStepAsJsonHandler.editStepAsJson(theRequest, theSender, theSendResponse, function () { called = true }, function () { called = true });
			expect(called).toBe(false);
		});
	});

	describe("handleEditedStepAsJsonRequest", function() {
		it ("parses json and then requests deployment process", function () {
			function fakeGetJsonResponse (url, handler) {
				expect(url).toBe("http://baseUrl/api/deploymentprocesses/1234");
				handler("theResponse");
			};

			function fakeHandleEditedStepGetResponse(response, sendResponse, stepId, deploymentProcessId, json, url) {
				expect(response).toBe("theResponse");
				expect(sendResponse).toBe(theSendResponse);
				expect(stepId).toBe(5678);
				expect(deploymentProcessId).toBe(1234);
				expect(json).toBe(theJson);
				expect(url).toBe("http://baseUrl/api/deploymentprocesses/1234");
			};

			var theJson = '{ "Id": 5678 }';
			var theRequest = { 'message': 'edited-step-as-json', 'properties': { 'json': theJson, 'deploymentProcessId': 1234 } };
			var theSendResponse= {};
			var octopusRoot = "http://baseUrl";
			pygmy3_0.editStepAsJsonHandler.handleEditedStepAsJsonRequest(theRequest, theSendResponse, octopusRoot, fakeGetJsonResponse, fakeHandleEditedStepGetResponse);
		});

		it ("sends a failure message if its invalid json", function () {
			function fakeGetJsonResponse (url, handler) {
				throw 'this should not be called';
			};

			function fakeHandleEditedStepGetResponse(response, sendResponse, stepId, deploymentProcessId, json, url) {
				throw 'this should not be called';
			};

			var theJson = '{ "Id": 1234, "AnotherField": " }';
			var theRequest = { 'message': 'edited-step-as-json', 'properties': { 'json': theJson, 'deploymentProcessId': 1234 } };
			var theSendResponse= function() { 
				expect(response).not.toBe(null);
				expect(response.message).toBe('edited-step-as-json-response');
				expect(response.properties.status).toBe('failure');
				expect(response.properties.stepId).toEqual(undefined);
				expect(response.properties.deploymentProcessId).toEqual(undefined);
				expect(response.properties.errorMessage).toEqual('Failed to parse json');
				expect(response.properties.errors).toEqual(["SyntaxError: Unexpected end of input"])
				called = true;
			};
			var octopusRoot = "http://baseUrl";
			pygmy3_0.editStepAsJsonHandler.handleEditedStepAsJsonRequest(theRequest, theSendResponse, octopusRoot, fakeGetJsonResponse, fakeHandleEditedStepGetResponse);
			expect(called).toBe(true);
		});
	});

	describe("handleEditStepAsJsonRequest", function() {
		it ("requests appropriate deployment process", function () {
			function fakeGetJsonResponse (url, handler) {
				expect(url).toBe("http://baseUrl/api/deploymentprocesses/1234");
				handler("theResponse");
			};

			function fakeHandleEditStepGetResponse(response, sendResponse, stepId, deploymentProcessId) {
				expect(response).toBe("theResponse");
				expect(sendResponse).toBe(theSendResponse);
				expect(stepId).toBe(5678);
				expect(deploymentProcessId).toBe(1234);
			};

			var theJson = '{ "Id": 5678 }';
			var theRequest = { 'message': 'edit-step-as-json', 'properties': { 'stepId': 5678, 'deploymentProcessId': 1234 } };
			var theSendResponse= {};
			var octopusRoot = "http://baseUrl";
			pygmy3_0.editStepAsJsonHandler.handleEditStepAsJsonRequest(theRequest, theSendResponse, octopusRoot, fakeGetJsonResponse, fakeHandleEditStepGetResponse);
		});
	});

	describe("handleEditedStepGetResponse", function() {
		it ("updates the deployment process, and submits back", function () {
			var theResponse = { Steps: [ { 'Id': 1234, 'AnotherField': 'OldValue' }] };
			var theSendResponse = {};
			var theStepId = 1234;
			var theDeploymentProcessId = 5678;
			var theJson = '{ "Id": 1234, "AnotherField": "NewValue" }';
			var theUrl = "http://baseUrl/api/deploymentprocesses/1234";

			var called = false;
			var fakePutJsonRequest = function(url, body, handlePutResponse) {
				expect(url).toBe(theUrl);
				called = true;
				expect(body.Steps[0].Id).toBe(1234);
				expect(body.Steps[0].AnotherField).toBe('NewValue');
				expect(handlePutResponse).not.toBe(null);
			}
			pygmy3_0.editStepAsJsonHandler.handleEditedStepGetResponse(theResponse, theSendResponse, theStepId, theDeploymentProcessId, theJson, theUrl, fakePutJsonRequest)
			expect(called).toBe(true);
		});
	});

	describe("handlePutResponse", function() {
		it ("sends a 'edited-step-as-json-response' success message if save succeeded", function () {
			var theStatus = 200;
			var thePutResponse = "{}";
			var called = false;
			var theSendResponse = function(response) {
				expect(response).not.toBe(null);
				expect(response.message).toBe('edited-step-as-json-response');
				expect(response.properties.status).toBe('success');
				expect(response.properties.stepId).toBe(theStepId);
				expect(response.properties.deploymentProcessId).toBe(theDeploymentProcessId);
				called = true;
			};

			var theStepId = 1234;
			var theDeploymentProcessId = 5678;
			pygmy3_0.editStepAsJsonHandler.handlePutResponse(theStatus, thePutResponse, theSendResponse, theStepId, theDeploymentProcessId);
			expect(called).toBe(true);
		});

		it ("sends a 'edited-step-as-json-response' failure message if save failed", function () {
			var theStatus = 500;
			var thePutResponse = '{"ErrorMessage": "an error occurred", "Errors" : [ "error1", "error2" ] }';
			var called = false;
			var theSendResponse = function(response) {
				expect(response).not.toBe(null);
				expect(response.message).toBe('edited-step-as-json-response');
				expect(response.properties.status).toBe('failure');
				expect(response.properties.stepId).toEqual(undefined);
				expect(response.properties.deploymentProcessId).toEqual(undefined);
				expect(response.properties.errorMessage).toEqual('an error occurred');
				expect(response.properties.errors).toEqual(["error1", "error2"])
				called = true;
			};

			var theStepId = 1234;
			var theDeploymentProcessId = 5678;
			pygmy3_0.editStepAsJsonHandler.handlePutResponse(theStatus, thePutResponse, theSendResponse, theStepId, theDeploymentProcessId);
			expect(called).toBe(true);
		});
	});

	describe("handleEditStepGetResponse", function() {
		it ("sends a 'edit-step-as-json-response' message with the selected json", function () {
			var theStatus = 200;
			var theResponse = { Steps: [ { 'Id': 1234 }] };
			var called = false;
			var theSendResponse = function(response) {
				expect(response).not.toBe(null);
				expect(response.message).toBe('edit-step-as-json-response');
				expect(response.properties.status).toBe('success');
				expect(response.properties.deploymentProcessId).toBe(theDeploymentProcessId);
				called = true;
			};

			var theStepId = 1234;
			var theDeploymentProcessId = 5678;
			pygmy3_0.editStepAsJsonHandler.handleEditStepGetResponse(theResponse, theSendResponse, theStepId, theDeploymentProcessId);
			expect(called).toBe(true);
		});
	});
})