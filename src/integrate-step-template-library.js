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
		
		libraryNode = document.createElement("div");
		libraryNode.id = this.libraryNodeId;
		libraryNode.classList.add('span5');
		libraryTitle = document.createElement('h3');
		libraryTitle.innerText = 'Library';
		libraryNode.appendChild(libraryTitle);

		viewRow.appendChild(libraryNode);

		this.getLibraryTemplates();
	},

	getLibraryTemplates: function()
	{
		chrome.runtime.sendMessage("get-library-templates", this.addTemplatesToListing.bind(this));
	},

	addTemplatesToListing: function(templates)
	{
		console.debug('Adding templates to library listing');
		
		var templateHtml = '<a class="octo-list-group-item">' +
			'<div>' +
			'<h4 class="octo-list-group-item-heading">' +
			'<button type="button" class="btn-small btn-success"><i class="icon-arrow-down icon-white"></i></button>' +
			' @@TEMPLATENAME@@</h4>' +
			'<markdown text="st.Description || \'_No description provided._\'" class=""><p></p></markdown>' +
			'</div>' +
			'</a>'

		library = this.theDocument.querySelector('#' + this.libraryNodeId);
		templates.map(function(item) {
			var stub = document.createElement('div');
			stub.innerHTML = templateHtml.replace('@@TEMPLATENAME@@', item.name);
			library.appendChild(stub.childNodes[0]);
			return;
		});
	},

	nodeInsertion: function(event)
	{
		var node = event.target;
		if (node.nodeType != 1) 
			return;
		
		if (this.isStepTemplatesView(node)) {
			console.log('Setting up step templates library listing');
			this.addTemplateLibraryElements(node);
		}
	}
};