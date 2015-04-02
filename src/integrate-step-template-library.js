var integrateStepTemplateLibrary = {
	
	libraryNodeId: 'library-templates',
	theDocument: window.document,

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
</div>';

		viewRow.appendChild(this.generateNodeFromHtml(libraryNodeHtml));

		this.getLibraryTemplates();
	},

	getLibraryTemplates: function()
	{
		chrome.runtime.sendMessage("get-library-templates");
	},

	receiveMessage: function(message, sender)
	{
		this.addTemplateToListing(message)
	},

	addTemplateToListing: function(template)
	{
		console.debug('Adding template to library listing');
		
		templateHtml = '<a class="octo-list-group-item">' +
			'<div>' +
			'<h4 class="octo-list-group-item-heading">' +
			'<button type="button" class="btn-small btn-success"><i class="icon-arrow-down icon-white"></i></button>' +
			' @@TEMPLATENAME@@</h4>' +
			'<markdown text="st.Description || \'_No description provided._\'" class=""><p>@@DESCRIPTION@@</p></markdown>' +
			'</div>' +
			'</a>'

		library = this.theDocument.querySelector('#' + this.libraryNodeId);
		stub = document.createElement('div');
		stub.innerHTML = templateHtml.replace('@@TEMPLATENAME@@', template.Name)
			.replace('@@DESCRIPTION@@', template.Description);
		stub.querySelector('button').onclick = function() { chrome.runtime.sendMessage({ templateName: template.Name }); };
		library.appendChild(stub.childNodes[0]);
	},

	generateNodeFromHtml: function(rawHtml)
	{
		stub = document.createElement('div');
		stub.innerHTML = rawHtml;
		return stub.childNodes[0];
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
		}
	}
};