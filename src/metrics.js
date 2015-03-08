chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	console.debug("Message received: " + request.name);
	mixpanel.track(request.name, request.properties);
});

console.log("OnMessage listener added for OctoPygmy");