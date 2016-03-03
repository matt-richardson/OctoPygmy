pygmy3_0.templateLoader = (function() {

	function receiveMessage(request, sender, sendResponse, urlRetriever, getJsonResponseHandler)	{
		if (request.message == 'get-template')
		{
			console.log("Loading template 'templates/" + request.properties.templateName + "'");
			
			var urlRetriever = urlRetriever || chrome.extension.getURL
			var url = urlRetriever('templates/' + request.properties.templateName);
			console.log("Extension relative url is '" + url + "'");

			getJsonResponseHandler = getJsonResponseHandler || getJsonResponse

			getJsonResponseHandler(url, function(status, response){
				console.log("Loaded content from url '" + url + "' with status '" + status + "' and response '" + response + "'");
				var msg;
				if (status == 200) {
					msg = { 
						message: 'get-template-response',
						properties: { 
							status: 'success',
							templateName: request.properties.templateName, 
							template: response.replace(/(\r\n|\n|\r)/gm,"")
						}
					};
				} else {
					msg = { 
						message: 'get-template-response',
						properties: {
							status: 'failure',
							templateName: request.properties.templateName, 
							errorMessage: "Failed to load template - status code " + status
						}
					};
				}
				console.log("Sending response message");
            	sendResponse(msg);
			});

			return true; // see https://developer.chrome.com/extensions/runtime#event-onMessageExternal
		}
	}

	function getJsonResponse(url, handler) {
		nanoajax.ajax(url, function(status, response){
			console.debug("Received " + status + " response from " + url);
			console.debug(response);
			handler(status, response);
		});
	}

	function setup() {
		chrome.runtime.onMessage.addListener(receiveMessage);
	}

	return {
		setup: setup,
		receiveMessage: receiveMessage
	}
})();
