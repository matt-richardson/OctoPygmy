var commonpygmy = {
	allItemsValue: '~all~',
	pygmyIdAttributeName: 'octopygmy-id',
	theDocument: window.document,

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

		for(var id of allIds)
		{
			var item = commonpygmy.theDocument.querySelector('[' + commonpygmy.pygmyIdAttributeName + '=' + id + ']');
			
			if (showAll || idsToShow.indexOf(id) >= 0)
			{
				item.style.display = showStyle;
			} 
			else 
			{
				item.style.display = hideStyle;
			}
		}
	},

	setNodePygmyId: function(node, pygmyId)
	{
		node.setAttribute(commonpygmy.pygmyIdAttributeName, pygmyId);
	}
}