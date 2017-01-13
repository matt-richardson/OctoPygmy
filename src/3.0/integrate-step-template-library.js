pygmy3_0.integrateStepTemplateLibrary = (function() {
	
	var libraryNodeId = 'library-templates';
	var theDocument = window.document;
	var unauthorizedNodeHtml = '<div class="alert alert-error">\
<button type="button" class="close" data-dismiss="alert">&times;</button>\
<strong>Problem!</strong> It seems you are not authorized to import templates.\
</div>';
	var errorNodeHtml = '<div class="alert alert-error">\
<button type="button" class="close" data-dismiss="alert">&times;</button>\
<strong>Problem!</strong> There was a problem processing the library templates.\
</div>';
	var successNodeHtml = '<div class="alert alert-success">\
<button type="button" class="close" data-dismiss="alert">&times;</button>\
<strong>Success!</strong> The template has been imported.<div>Refresh the page to see it.</div>\
</div>';
	var templateHtml = '<li class="octo-list-group-item">' +
			'<div>' +
			'<h4 class="octo-list-group-item-heading">' +
			'<button type="button" class="btn btn-lg btn-success template-import" style="padding-left: 9px; padding-right: 9px;"><span class="glyphicon glyphicon-download-alt" style="font-size: 14pt;"></span></button>' +
			' <span class="template-name"></span></h4>' +
			'<markdown text="st.Description || \'_No description provided._\'" class="description"><p></p></markdown>' +
			'</div>' +
			'</li>';
	var existingTemplateNames = [];
	var libraryList = {};

	function isStepTemplatesView(node)
	{
		return node.tagName == 'DIV' 
			&& node.classList.contains('ng-scope')
			&& node.querySelector("div h3")
			&& node.querySelector("div h3").innerText == 'Step templates'
	}

	function addTemplateLibraryElements(node) {
		var existingTemplates = node.querySelector('div.col-lg-12');
		existingTemplates.classList.remove('col-lg-12');
		existingTemplates.classList.remove('col-md-12');
		existingTemplates.classList.remove('col-sm-12');
		existingTemplates.classList.add('col-lg-7');
		existingTemplates.classList.add('col-md-7');
		existingTemplates.classList.add('col-sm-7');

		var viewRow = existingTemplates.parentNode;
		var libraryNodeHtml = '<div id="' + libraryNodeId + '" class="col-lg-5 col-md-5 col-sm-5" style="padding-left: 0;margin-left: 0;">\
<h3>Library</h3>\
<ul id="' + libraryNodeId + '-list' + '" class="list" style="padding-left: 0;margin: 0;">\
</ul>\
</div>';

		viewRow.appendChild(generateNodeFromHtml(libraryNodeHtml));
		libraryList = new List(libraryNodeId, { item: templateHtml })
	}

	function getLibraryTemplates()
	{
		chrome.runtime.sendMessage("get-library-templates");
	}

	function receiveMessage(message, sender)
	{
		if(message.templateImportUnauthorized) {
			libraryNode = theDocument.querySelector('#' + libraryNodeId)
			libraryNode.insertBefore(generateNodeFromHtml(unauthorizedNodeHtml), libraryNode.childNodes[1])
		} else if (message.templateImportFailed) {
			libraryNode = theDocument.querySelector('#' + libraryNodeId)
			libraryNode.insertBefore(generateNodeFromHtml(errorNodeHtml), libraryNode.childNodes[1])
		} else if (message.templateImportSuccessful) {
			libraryNode = theDocument.querySelector('#' + libraryNodeId)
			libraryNode.insertBefore(generateNodeFromHtml(successNodeHtml), libraryNode.childNodes[1])
		} else if (message.existingTemplateNames) {
			console.debug('Received existing template names')
			console.debug(message.existingTemplateNames)
			existingTemplateNames = message.existingTemplateNames
			getLibraryTemplates()
		} else {
			addTemplateToListing(message)
		}
	}

	function addTemplateToListing(template)
	{
		console.debug('Adding template to library listing');

		preexisting = existingTemplateNames.indexOf(template.Name) >= 0
		if (!preexisting) {
			libraryList.add({'template-name': template.Name, 'description': template.Description})
			libraryList.sort('template-name')
			for(i = 0; i < libraryList.items.length; i++) {
				if(libraryList.items[i].values()['template-name'] == template.Name) {
					libraryList.items[i].elm.getElementsByClassName('template-import')[0].onclick = function() { chrome.runtime.sendMessage({templateName: template.DownloadUrl}) }
				}
			}
		}
	}

	function generateNodeFromHtml(rawHtml)
	{
		var stub = document.createElement('div');
		stub.innerHTML = rawHtml;
		return stub.childNodes[0];
	}

	function getExistingTemplatesNames(done)
	{
		console.debug(chrome)
		chrome.tabs.getCurrent(function(tab) {
			octopusRoot = tab.url.substring(0, tab.url.indexOf('/app'))
			nanoajax.ajax(octopusRoot + '/api/actiontemplates', function(status, response) {
				templates = JSON.parse(response)
				names = []

				for(template in templates.Items) {
					names.append(template.Name)
				}

				console.debug("Retrieved existing template names:")
				console.debug(names)
				this.existingTemplateNames = names
				done()
			})
		})
	}

	function nodeInsertion(nodes) {
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node.nodeType != 1) return; // Not an element just ignore.
			
			if (isStepTemplatesView(node)) {
				console.info('Setting up step templates library listing');
				addTemplateLibraryElements(node);

				// The real problem I think here is that I'm adding a listener upon each node insertion.
				// Look into putting this somewhere else, maybe in the initial startup of octopygmy.
				chrome.runtime.onMessage.removeListener(receiveMessage)
				chrome.runtime.onMessage.addListener(receiveMessage)

				chrome.runtime.sendMessage('get-existing-template-names')
			}
		}
	}

	// Copy and pasted from dashboard collapser. Refactor to common method?
	function observe(content) {
		if (commonpygmy.isNewerVersionThan(octopusVersion, "3.6.999")) {
			return;
		}
		var observer = new MutationObserver(function(records) { 
			for (var i = 0; i < records.length; i++) {
				nodeInsertion(records[i].addedNodes);
			}
		});
		observer.observe(content, { childList: true, subtree: true, attributes: false, characterData: false});
	}

	return {
		observe: observe
	};
})();