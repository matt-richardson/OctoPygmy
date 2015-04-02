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

function getLibraryTemplatesList(done)
{
	console.debug("Getting library template listing");
	var templatesUrl = 'https://api.github.com/repos/OctopusDeploy/Library/contents/step-templates'

	nanoajax.ajax(templatesUrl, function(status, response){
		var templates = JSON.parse(response);
		
		templates = templates.map(function(template, index, all){
			return {
				name: template.name.slice(0,-5),
				downloadUrl: template.download_url,
			};
		});

		console.debug('Received ' + templates.length + ' templates from Github');
		done(templates);
	});
}

function getLibraryTemplateContent(name, octopusRoot, done)
{
	console.debug('Getting content of library template: ' + name);
	var downloadUrl = 'https://raw.githubusercontent.com/OctopusDeploy/Library/master/step-templates/'

	nanoajax.ajax(downloadUrl + name + '.json', function(status, response){
		console.debug('Received library template:' + name)
		console.debug(response)
		importLibraryTemplate(response, octopusRoot, done);
	})
}

function sendLibraryTemplate(downloadUrl, tabId, done)
{
	console.debug('Sending library template ' + downloadUrl)
	nanoajax.ajax(downloadUrl, function(status, response){
		var template = JSON.parse(response)

		chrome.tabs.sendMessage(tabId, template)
		done()
	})
}

function importLibraryTemplate(templateContent, octopusRoot, done)
{
	console.debug('Importing library template content')
	nanoajax.ajax({url: octopusRoot + '/api/actiontemplates',
		method: 'POST',
		body: templateContent
	}, function(status, response){
		console.debug('Response importing library template')
		console.debug(response)
		done()
	})
}

function setupMetrics()
{
	var version = chrome.runtime.getManifest().version;

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
	{
		console.debug('Message received: ')
		console.debug(request)

		if (request == 'reload-options') {
			chrome.storage.sync.get(options, function(result) { options = result; });
			return;
		}

		if (request == 'get-library-templates') {
			getLibraryTemplatesList(function(templates){
				for(var i = 0; i < templates.length; i++){
					sendLibraryTemplate(templates[i].downloadUrl, sender.tab.id)
				}
			})
			return;
		}

		if (request.templateName) {
			octopusRoot = sender.url.substring(0,sender.url.indexOf('/app'))
			getLibraryTemplateContent(request.templateName, octopusRoot);
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