var dashboardCollapser = {
	chooserId: "project-chooser",
	allGroupsValue: "~all~",
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
		item.value = this.allGroupsValue;
		item.innerHTML = "~ All ~";

		chooser.appendChild(item);

		return chooser;
	},


	addProjectChooserToDashboard: function(node)
	{
		console.debug("Adding project chooser");

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
		console.debug("Showing only " + groupingId);
		
		for(var id of dashboardCollapser.projectGroupIds) {
			var grouping = document.getElementById(id);

			if (id == groupingId || groupingId == dashboardCollapser.allGroupsValue) {
				grouping.style.display = "block";
			} else {
				grouping.style.display = "none"
			}
		}
	}
}

function nodeInsertion(event)
{
	// Catch Angular messing with the DOM.
	var node = event.target;
	if (node.nodeType != 1) return;

	if (node.parentNode.tagName == 'FASTBOARD')
	{
		dashboardCollapser.addGroupToChooser(node);
	}

	if (node.tagName == 'H1' && node.innerText == 'Dashboard') {
		dashboardCollapser.addProjectChooserToDashboard(node);
	}

	environmentCollapser.nodeInsertion(event);
}

function startDashboardCollapser()
{
	if (window.location.pathname != '/app' || document.title.indexOf("Octopus Deploy") < 0) return; // Only run for the dashboard

	console.debug("Adding dom listener.")
	var body = document.getElementById("body");
	body.addEventListener("DOMNodeInserted", nodeInsertion);
}

startDashboardCollapser();