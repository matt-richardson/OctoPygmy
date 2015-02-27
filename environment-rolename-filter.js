var environmentRoleNameFilter = {
	inputId: "rolename-filter",
	machines: [],

	machineId: function(machineName) {
		return machineName.toLowerCase().replace(/[^a-z0-9]/g,'') + "-machine";
	},

	createFilterInput: function ()
	{
		var input = document.createElement("input");
		input.id = this.inputId;
		input.type = "text";
		input.className = "grouping-chooser";

		return input;
	},

	addFilterInput: function(node)
	{
		console.debug("Adding environment role name filter input");

		var input = this.createFilterInput();
		var existingInput = document.getElementById(input.id);

		if (existingInput) {
			console.debug("Filter input already added, skipping...");
			return;
		}

		node.parentNode.appendChild(input);
	},

	addMachineToCache: function(node)
	{
		console.debug("Adding machine to cache:");

		var machineNode = node.parentNode.parentNode.parentNode.parentNode.parentNode; // Ernest P. Worrell goes 'Ewwwwwwww'
		console.debug("Machine node:")
		console.debug(machineNode);

		var machineNameNode = node.parentNode.parentNode.getElementsByTagName('H5')[0];
		console.debug("Machine name:")
		console.debug(machineNameNode);

		var rolesNodes = node.parentNode.getElementsByTagName('SPAN');
		console.debug("Roles:")
		console.debug(rolesNodes);

		var machineName = machineNameNode.innerText;
		
		// Get roles of server
		var roles = [];
		for(var i = 0; i < rolesNodes.length; i++) {
			roles.push(rolesNodes[i].innerText.trim());
		}
		console.debug(roles);

		machineNode.id = environmentRoleNameFilter.machineId(machineName);
		
		var item = {};
		item.id = machineNode.id;
		item.name = machineName;
		item.roles = roles;
		
		environmentRoleNameFilter.machines.push(item);

		console.debug('Environment machine added: ' + machineName);
		console.debug(item);
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
		
		if (node.tagName == 'SPAN' && node.getAttribute("ng-repeat") == "role in machine.Roles")
		{
			node.addEventListener("DOMCharacterDataModified", function(e) {
				if(e.prevValue == "{{ role }} "
					&& e.path[1].parentNode.outerHTML.indexOf("{{ role }} ") < 0) // Need to wait until ALL roles have been Angulared.
				{
					environmentRoleNameFilter.addMachineToCache(e.path[1]);
				}
			});
		}

		if (node.tagName == 'H1' && node.innerText == 'Environments') {
			environmentRoleNameFilter.addFilterInput(node);
		}
	}
}