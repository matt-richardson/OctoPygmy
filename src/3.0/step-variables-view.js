pygmy3_0.stepVariablesViewer = (function() {

	function isActionTemplateDetails(node)
	{
		// action-template="actionTemplate"
			// p class="gray"
			// div.ng-scope
		// ng-repeat="parameter in actionTemplate.Parameters"
		return node.tagName == "DIV" && node.getAttribute("ng-if") == "actionTemplate";
		// node.querySelector("div[action-template=\"actionTemplate\"]");
	}

	function getTemplatParametersNode(node)
	{
		return node.querySelector("div[ng-repeat=\"parameter in actionTemplate.Parameters\"] div.controls");
	}
	
	function generateTestTable()
	{
		var raw = "<table width='100%' style='font-size: 9pt'>" +
			"<thead><tr style='background: #f4f4f4;'>" +
				"<td style='padding: 8px; border-right: 1px solid silver'>Value</td>" +
				"<td style='padding: 8px; border-right: 1px solid silver'>Scope</td>" +
			"</tr></thead>" +
			"<tbody>" +
			"<tr style='height: 28px; line-height: 20px'><td>A value</td><td>Scope,Scope2</td></tr>" +
			"<tr style='background: #f4f4f4;'><td style='padding:4px'>A value</td><td>Scope,Scope2</td></tr>" +
			"</tbody>" +
			"</table>";
		/*
		var raw = "<div id='stepVariablesInUse'>" +
				"<div class='slick-header-columns'>" +
					"<div class='slick-header-column col-sm-4'><span class='slick-column-name'>Name</span></div>" +
					"<div class='slick-header-column col-sm-4'><span class='slick-column-name'>Value</span></div>" +
					"<div class='slick-header-column col-sm-4'><span class='slick-column-name'>Scope</span></div>" +
				"</div>" +
				"<div class='slick-viewport'>" +
					"<div class='slick-row even'>" +
						"<div class='slick-cell'>A name</div>" +
						"<div class='slick-cell'>The value</div>" +
						"<div class='slick-cell'>Scope,Scope2</div>" +
					"</div>" +
				"</div>" +
			"</div>";
		*/
		
		return commonpygmy.generateNodeFromHtml(raw);
	}
	
	function nodeInsertion(nodes)
	{
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node.nodeType != 1) return; // Not an element just ignore.
			
			if (isActionTemplateDetails(node))
			{
				console.debug("Found step action template details section...");
				console.debug(node);
				
				getTemplatParametersNode(node).appendChild(generateTestTable());
				//node.firstElementChild.insertBefore(generateTestTable(), node.firstElementChild.firstElementChild.nextSibling);
			}
		}
	}

	function observe(content)
	{
		var observer = new MutationObserver(function(records) { 
			for (var i = 0; i < records.length; i++) {
				nodeInsertion(records[i].addedNodes);
			}
		});
		observer.observe(content, { childList: true, subtree: true, attributes: false, characterData: false});
	}

	return {
		observe: observe
	};
})();