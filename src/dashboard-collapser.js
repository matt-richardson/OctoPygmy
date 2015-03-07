var dashboardCollapser = {
	chooserId: "project-chooser",
	projectGroupIds: [],

	groupingId: function(groupName) {
		return groupName.toLowerCase().replace(/[^a-z0-9]/g,'') + "-grouping";
	},

	createChooser: function ()
	{
		var chooser = document.createElement("select");
		chooser.id = this.chooserId;
		chooser.onchange = this.showOnlygroup;
		chooser.className = "grouping-chooser";
		
		var item = document.createElement("option");
		item.value = commonpygmy.allItemsValue;
		item.innerHTML = "~ All ~";

		chooser.appendChild(item);

		return chooser;
	},

	addGroupToChooser: function(node)
	{
		var projectHeader = node.getElementsByTagName("H3")[0];
		var groupName = projectHeader.innerText;

		node.id = this.groupingId(groupName);
		var item = document.createElement("option");
		item.value = node.id;
		item.innerHTML = groupName;
		
		var chooser = document.getElementById(this.chooserId);
		chooser.appendChild(item);

		this.projectGroupIds.push(node.id);

		console.debug('Project group added: ' + groupName);
	},

	showOnlygroup: function(event) {
		var groupingId = event.target.value;
		commonpygmy.showItems(dashboardCollapser.projectGroupIds, groupingId,
			'block', 'none');
	},

	nodeInsertion: function(event)
	{
		// Catch Angular messing with the DOM.
		var node = event.target;
		if (node.nodeType != 1) return;

		if (node.parentNode.tagName == 'FASTBOARD')
		{
			dashboardCollapser.addGroupToChooser(node);
		}
		
		if (node.tagName == 'H1' && node.innerText == 'Dashboard') {
			console.log('Setting up dashboard filter');
			var filterInput = dashboardCollapser.createChooser();
			commonpygmy.addFilterInput(filterInput, node.parentNode);
		}
	}

}