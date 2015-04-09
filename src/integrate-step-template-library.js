var integrateStepTemplateLibrary = {
	
	libraryNodeId: 'library-templates',
	theDocument: window.document,
	errorNodeHtml: '<div class="alert alert-error">\
<button type="button" class="close" data-dismiss="alert">&times;</button>\
<strong>Problem!</strong> It seems you are not authorized to import templates.\
</div>',
	successNodeHtml: '<div class="alert alert-success">\
<button type="button" class="close" data-dismiss="alert">&times;</button>\
<strong>Success!</strong> The template has been imported.\
</div>',
	templateHtml: '<li class="octo-list-group-item">' +
			'<div>' +
			'<h4 class="octo-list-group-item-heading">' +
			'<button type="button" class="btn-small btn-success"><i class="icon-arrow-down icon-white"></i></button>' +
			' <span class="template-name"></span></h4>' +
			'<markdown text="st.Description || \'_No description provided._\'" class="description"><p></p></markdown>' +
			'</div>' +
			'</li>',
	existingTemplateNames: [],
	libraryList: {},

	isStepTemplatesView: function(node)
	{
		return node.tagName == 'DIV' 
			&& node.classList.contains('ng-scope') 
			&& node.classList.contains('container-fluid')
			&& node.querySelector("div.span12 h3").innerText == 'Step templates'
	},

	addTemplateLibraryElements: function(node)
	{
		existingTemplates = node.querySelector('div.span12');
		existingTemplates.classList.remove('span12')
		existingTemplates.classList.add('span7')

		viewRow = existingTemplates.parentNode;
		libraryNodeHtml = '<div id="' + this.libraryNodeId + '" class="span5">\
<h3>Library</h3>\
<ul id="' + this.libraryNodeId + '-list' + '" class="list">\
</ul>\
</div>';

		viewRow.appendChild(this.generateNodeFromHtml(libraryNodeHtml));
		this.libraryList = new List(this.libraryNodeId, { item: this.templateHtml })
	},

	getLibraryTemplates: function()
	{
		chrome.runtime.sendMessage("get-library-templates");
	},

	receiveMessage: function(message, sender)
	{
		if(message.templateImportUnauthorized) {
			libraryNode = this.theDocument.querySelector('#' + this.libraryNodeId)
			libraryNode.insertBefore(this.generateNodeFromHtml(this.errorNodeHtml), libraryNode.childNodes[1])
		} else if (message.templateImportSuccessful) {
			libraryNode = this.theDocument.querySelector('#' + this.libraryNodeId)
			libraryNode.insertBefore(this.generateNodeFromHtml(this.successNodeHtml), libraryNode.childNodes[1])
		} else if (message.existingTemplateNames) {
			console.debug('Received existing template names')
			console.debug(message.existingTemplateNames)
			this.existingTemplateNames = message.existingTemplateNames
			this.getLibraryTemplates()
		} else {
			this.addTemplateToListing(message)
		}
	},

	addTemplateToListing: function(template)
	{
		console.debug('Adding template to library listing');

		preexisting = this.existingTemplateNames.indexOf(template.Name) >= 0
		//library = this.theDocument.querySelector('#' + this.libraryNodeId + '-list');
		/*
		stub = document.createElement('div');
		
		if (preexisting) {
			stub.innerHTML = existingTemplateHtml.replace('@@TEMPLATENAME@@', template.Name)
				.replace('@@DESCRIPTION@@', template.Description);
		} else {
			stub.innerHTML = templateHtml.replace('@@TEMPLATENAME@@', template.Name)
				.replace('@@DESCRIPTION@@', template.Description);
			stub.querySelector('button').onclick = function() { chrome.runtime.sendMessage({ templateName: template.DownloadUrl }); };
		}
		*/
		if (!preexisting) {
			this.libraryList.add({'template-name': template.Name, 'description': template.Description})
			this.libraryList.sort('template-name')
		}
	},

	generateNodeFromHtml: function(rawHtml)
	{
		stub = document.createElement('div');
		stub.innerHTML = rawHtml;
		return stub.childNodes[0];
	},

	getExistingTemplatesNames: function(done)
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
	},

	nodeInsertion: function(event)
	{
		node = event.target;
		if (node.nodeType != 1) 
			return;
		
		if (this.isStepTemplatesView(node)) {
			console.log('Setting up step templates library listing');
			this.addTemplateLibraryElements(node);

			chrome.runtime.onMessage.addListener(this.receiveMessage.bind(this))

			chrome.runtime.sendMessage('get-existing-template-names')
		}
	}
};