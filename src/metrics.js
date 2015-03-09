var options = { 
	analytics: false
};
chrome.storage.sync.get(options, function(result) { options = result; });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	if (request == 'reload-options') {
		chrome.storage.sync.get(options, function(result) { options = result; });
	}

	if (options.analytics) {
		console.debug("Message received: " + request.name);
		mixpanel.track(request.name, request.properties);
	}
});

console.log("OnMessage listener added for OctoPygmy");
