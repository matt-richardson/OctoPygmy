var commonpygmy = {
	allItemsValue: '~all~',
	pygmyIdAttributeName: 'octopygmy-id',
	theDocument: window.document,
	location: function() { return window.location; },
	document: function() { return window.document; },

	addFilterInput: function(inputNode, parentNode)
	{
		console.debug("Adding filter input");

		var existingInput = document.getElementById(inputNode.id);

		if (existingInput)
		{
			console.debug("Filter input (" + inputNode.id + ") already exists, skipping...");
			return;
		}

		parentNode.appendChild(inputNode);
	},

	showItems: function(allIds, idsToShow, showStyle, hideStyle)
	{
		var showAll = idsToShow == commonpygmy.allItemsValue || idsToShow == ''

		for(var i = 0; i < allIds.length; i++)
		{
			var id = allIds[i];
			var items = commonpygmy.theDocument.querySelectorAll('[' + commonpygmy.pygmyIdAttributeName + '=' + id + ']');
			for(var index = 0; index < items.length; index++) {
				var item = items[index];
				if (showAll || idsToShow.indexOf(id) >= 0)
				{
					item.style.display = showStyle;
				} 
				else 
				{
					item.style.display = hideStyle;
				}
			}
		}
	},

	setNodePygmyId: function(node, pygmyId)
	{
		node.setAttribute(commonpygmy.pygmyIdAttributeName, pygmyId);
	}
}