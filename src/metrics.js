var options = { 
	analytics: false,
	hasSetOptions: '0.0', // Which version have the options been set for. Just major.minor
};
chrome.storage.sync.get(options, function(result) 
{ 
	options = result;
	setupMetrics();
	displayOptionsPageIfNeeded();
});

function setupMetrics()
{
	var version = chrome.runtime.getManifest().version;

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
	{
		if (request == 'reload-options') {
			chrome.storage.sync.get(options, function(result) { options = result; });
			return;
		}

		if (options.analytics) {
			console.debug("Message received: " + request.name);

			request.properties.version = version;
			mixpanel.track(request.name, request.properties);
		}
	});

	console.log("OnMessage listener added for OctoPygmy");
}

function displayOptionsPageIfNeeded()
{
	var optionsVersion = chrome.runtime.getManifest().version.substring(0, chrome.runtime.getManifest().version.lastIndexOf('.'));
	if (options.hasSetOptions != optionsVersion) {
		console.debug("This version's options have not been set yet. " + options.hasSetOptions + " Ext: " + optionsVersion);

		chrome.tabs.create(
		{
			url: 'chrome-extension://' + chrome.runtime.id + '/options.html'
		});
	}
}