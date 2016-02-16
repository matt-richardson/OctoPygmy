var environmentCollapser = {
	chooserId: "envrionment-chooser",
	environmentGroupIds: [],

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
		var groupName = node.innerText;
		var groupNode = node.parentNode.parentNode.parentNode; // Ernest P. Worrell goes 'Ewwwwwwww'

		pygmyId = commonpygmy.groupingId(groupName);
		commonpygmy.setNodePygmyId(groupNode, pygmyId);
		var item = document.createElement("option");
		item.value = pygmyId;
		item.innerHTML = groupName;
		
		var chooser = document.getElementById(environmentCollapser.chooserId);
		chooser.appendChild(item);

		environmentCollapser.environmentGroupIds.push(pygmyId);

		console.debug('Environment group added: ' + groupName);
	},

	showOnlygroup: function(event) {
		var groupingId = event.target.value;
		commonpygmy.showItems(environmentCollapser.environmentGroupIds, groupingId,
			'block', 'none');

		var groupingMetric = groupingId == commonpygmy.allItemsValue ? "all" : "specific"
		chrome.runtime.sendMessage({ name: "used-environment-collapser", properties: { "grouping": groupingMetric  } });
	},

	nodeInsertion: function(event)
	{
		// Catch Angular messing with the DOM.
		var node = event.target;
		if (node.nodeType != 1) 
			return;
		
		if (node.parentNode.tagName == 'DIV' && node.getAttribute("ng-repeat") == "environment in environments") {
			node.addEventListener("DOMCharacterDataModified", function(e) {
				if(e.prevValue == "{{ environment.Name }} ") {
					environmentCollapser.addGroupToChooser(e.path[1]);
				}
			});
		}

		if (node.tagName == 'H1' && node.innerText == 'Environments') {
			console.info('Setting up environment filter');
			var filterInput = environmentCollapser.createChooser();
			commonpygmy.addFilterInput(filterInput, node.parentNode);
		}
	}
}