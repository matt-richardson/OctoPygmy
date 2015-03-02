var commonpygmy = {

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
		console.log("Showing: " + idsToShow);
		
		for(var id of allIds)
		{
			var item = document.getElementById(id);
			if (idsToShow.indexOf(id) >= 0)
			{
				console.debug("Showing " + id);
				item.style.display = showStyle;
			} 
			else 
			{
				console.debug("Hiding " + id);
				item.style.display = hideStyle;
			}
		}
	},
}