var environmentRoleNameFilter = {
	inputId: "rolename-filter",
	machines: {},
	machineIds: [],

	machineId: function(machineName) {
		return machineName.toLowerCase().replace(/[^a-z0-9]/g,'') + "-machine";
	},

	createFilterInput: function ()
	{
		var input = document.createElement("input");
		input.id = this.inputId;
		input.type = "text";
		input.className = "grouping-chooser";
		input.oninput = environmentRoleNameFilter.filterFor;
		input.onblur = environmentRoleNameFilter.doneWithFilter;

		return input;
	},

	addMachineToCache: function(node)
	{
		var machineNode = node.parentNode.parentNode.parentNode.parentNode.parentNode; // Ernest P. Worrell goes 'Ewwwwwwww'
		var statusNode = machineNode.parentNode.parentNode.parentNode.getElementsByTagName('H5')[0];
		var machineNameNode = node.parentNode.parentNode.getElementsByTagName('H5')[0];
		var rolesNodes = node.parentNode.getElementsByTagName('SPAN');

		var status = statusNode.innerText.toLowerCase();
		var machineName = machineNameNode.innerText.toLowerCase();
		
		// Get roles of server
		var roles = [];
		for(var i = 0; i < rolesNodes.length; i++)
		{
			roles.push(rolesNodes[i].innerText.trim().toLowerCase());
		}

		pygmyId = environmentRoleNameFilter.machineId(machineName);
		commonpygmy.setNodePygmyId(machineNode, pygmyId);
		
		// The cache is machine/role/status -> [machineId, machineId, ...]
		environmentRoleNameFilter.machines[machineName] = [pygmyId]; // So we don't have to switch loading styles when finding machine ids later.
		environmentRoleNameFilter.machineIds.push(pygmyId);
		for(var i = 0; i < roles.length; i++)
		{
			if(environmentRoleNameFilter.machines[roles[i]] == null)
			{
				environmentRoleNameFilter.machines[roles[i]] = [];
			}

			environmentRoleNameFilter.machines[roles[i]].push(pygmyId);
		}

		if(environmentRoleNameFilter.machines[status] == null)
		{
			environmentRoleNameFilter.machines[status] = [];
		}
		environmentRoleNameFilter.machines[status].push(pygmyId);
		
	},

	filterFor: function(event) {
		var machineIdsToShow = [];
		var filterText = event.srcElement.value.toLowerCase();
		for(var rolename in environmentRoleNameFilter.machines)
		{
			if (rolename.indexOf(filterText) == 0)
			{
				for(var id of environmentRoleNameFilter.machines[rolename])
				{
					machineIdsToShow.push(id);
				}
			}
		}

		commonpygmy.showItems(environmentRoleNameFilter.machineIds, machineIdsToShow, 
			'inline-block', 'none');
	},

	doneWithFilter: function(event) {
		var filterMetric = event.srcElement.value == '' ? "all" : "specific"
		chrome.runtime.sendMessage({ name: "used-role-name-filter", properties: { "filter": filterMetric  } });
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
			console.info('Setting up environment role/name filter');
			
			var filterInput = environmentRoleNameFilter.createFilterInput();
			commonpygmy.addFilterInput(filterInput, node.parentNode);
		}
	}
}