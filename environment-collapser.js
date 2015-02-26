var environmentCollapser = {
	chooserId: "envrionment-chooser",
	allGroupsValue: "~all~",
	environmentGroupIds: [],

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
		item.value = this.allGroupsValue;
		item.innerHTML = "~ All ~";

		chooser.appendChild(item);

		return chooser;
	},

	addChooser: function(node)
	{
		console.debug("Adding environment chooser");

		var chooser = this.createChooser();
		var existingChooser = document.getElementById(chooser.id);

		if (existingChooser) {
			console.debug("Chooser already added, skipping...");
			return;
		}

		node.parentNode.appendChild(chooser);
	},

	addGroupToChooser: function(node)
	{
		var groupName = node.innerText;
		var groupNode = node.parentNode.parentNode.parentNode; // Ernest P. Worrell goes 'Ewwwwwwww'

		groupNode.id = environmentCollapser.groupingId(groupName);
		var item = document.createElement("option");
		item.value = groupNode.id;
		item.innerHTML = groupName;
		
		var chooser = document.getElementById(environmentCollapser.chooserId);
		chooser.appendChild(item);

		environmentCollapser.environmentGroupIds.push(groupNode.id);

		console.debug('Environment group added: ' + groupName);
	},

	showOnlygroup: function(event) {
		var groupingId = event.target.value;
		console.debug("Showing only " + groupingId);
		
		for(var id of environmentCollapser.environmentGroupIds) {
			var grouping = document.getElementById(id);

			if (id == groupingId || groupingId == environmentCollapser.allGroupsValue) {
				grouping.style.display = "block";
			} else {
				grouping.style.display = "none"
			}
		}
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
			environmentCollapser.addChooser(node);
		}
	}
}