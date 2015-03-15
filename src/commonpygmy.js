var commonpygmy = {
	allItemsValue: '~all~',
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
			var item = commonpygmy.theDocument.querySelector('#' + id);
			
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
}