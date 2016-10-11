pygmy3_0.environmentFilter = (function () {
	var inputId = "rolename-filter"
	var machines = {}
	var machineIds = []

	function machineId(machineName) {
		return machineName.toLowerCase().replace(/[^a-z0-9]/g,'') + "-machine";
	}

	function createFilterInput() {
		var input = document.createElement("input");
		input.id = this.inputId;
		input.type = "text";
		input.className = "grouping-chooser";
		input.oninput = filterFor;
		input.onblur = doneWithFilter;

		return input;
	}

	function determineStatus(node)
	{
		if (node.src.indexOf("Server-Online") >= 0) {
			return "online";
		} else if (node.src.indexOf("Server-Disabled") >= 0) {
			return "disabled";
		} else if (node.src.indexOf("Server-Offline") >= 0) {
			return "offline";
		}
	}

	function add33TargetToCache(node) {
		var targets = node.getElementsByTagName("LI");
		targets.forEach(addTargetToCache);
	}
	
	function addTargetToCache(node) {
		var machineNode = node;
		var statusNode = machineNode.getElementsByTagName("IMG")[0];
		var machineNameNode = machineNode.getElementsByTagName('H5')[0];
		var rolesNodes = machineNode.getElementsByTagName('SPAN');

		var status = determineStatus(statusNode);
		var machineName = machineNameNode.innerText.toLowerCase();
		
		// Get roles of server
		var roles = [];
		for(var i = 0; i < rolesNodes.length; i++)
		{
			roles.push(rolesNodes[i].innerText.trim().toLowerCase());
		}

		pygmyId = machineId(machineName);
		commonpygmy.setNodePygmyId(machineNode, pygmyId);
		
		// The cache is machine/role/status -> [machineId, machineId, ...]
		machines[machineName] = [pygmyId]; // So we don't have to switch loading styles when finding machine ids later.
		machineIds.push(pygmyId);
		for(var i = 0; i < roles.length; i++)
		{
			if(machines[roles[i]] == null)
			{
				machines[roles[i]] = [];
			}

			machines[roles[i]].push(pygmyId);
		}

		if(machines[status] == null)
		{
			machines[status] = [];
		}
		machines[status].push(pygmyId);
		
	}

	function filterFor(event) {
		var machineIdsToShow = [];
		var filterText = event.srcElement.value.toLowerCase();
		for(var rolename in machines)
		{
			if (rolename.indexOf(filterText) >= 0)
			{
				for(var id of machines[rolename])
				{
					machineIdsToShow.push(id);
				}
			}
		}

		commonpygmy.showItems(machineIds, machineIdsToShow, 'inline-block', 'none');
	}

	function doneWithFilter(event) {
		var filterMetric = event.srcElement.value == '' ? "all" : "specific"
		chrome.runtime.sendMessage({ name: "used-role-name-filter", properties: { "filter": filterMetric  } });
	}


// var watchIt = function(mut) {if(mut.addedNodes.length > 0) {if(mut.addedNodes[0].tagName == "LI" && mut.addedNodes[0].classList.contains("dropdown-item-container")) {return;} else {console.debug("Nodes added at WatchIt");console.debug(mut.addedNodes);}}}

	function nodeInsertion(nodes) {
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node.nodeType != 1) return; // Not an element just ignore.
			
			if (node.tagName == "LI" && node.getAttribute("ng-repeat") == "machine in machines") {
				console.debug("Found inserted target machine");
				console.debug(node.innerText);
				addTargetToCache(node);
			}

			if (node.tagName == "UL" && node.className == "octo-tiles") {
				console.debug("Found 3.3 inserted target machine set");
				console.debug(node);
				add33TargetToCache(node);
			}
			
			// This is just like the dashboard collapser. Refactor to a common method?
			if (node.tagName == "UL" && node.innerText.trim() == "Environments") {
				console.info('Setting up environment filter');
				var filterInput = createFilterInput();
				commonpygmy.addFilterInput(filterInput, node.parentNode);
			}
		}
	}

	function observe(content) {
		var observer = new MutationObserver(function(records) { 
			for (var i = 0; i < records.length; i++) {
				nodeInsertion(records[i].addedNodes);
			}
		});
		observer.observe(content, { childList: true, subtree: true, attributes: false, characterData: false});
	}

	return {
		observe: observe
	}
})();