pygmy3_0.dashboardFilter = (function () {
    var inputId = "project-filter"
    var projects = []

    function createFilterInput() {
        var input = document.createElement("input");
        input.id = this.inputId;
        input.type = "text";
        input.className = "project-chooser";
        input.oninput = filterFor;
        input.onblur = doneWithFilter;
        input.placeholder = "Search...";

        return input;
    }

    function projectId(projectName) {
        return projectName.toLowerCase().replace(/[^a-z0-9]/g,'') + "-project";
    }

    function addGroupToCache(node) {
        var groupNode = node;
        var groupProjects = groupNode.getElementsByTagName("TR");

        //Start at 1, since the first row is the header of the group
        for(var i = 1; i < groupProjects.length; i++)
        {
            var projectNode = groupProjects[i];
            var projectName = "";

            //In Octopus 3.3.x, the try will work.
            //However, as of 3.7.x, the class 'project-name' seems to be gone
            try {
                projectName = projectNode.getElementsByClassName("project-name")[0].innerText;
            } catch(e) {
                projectName = projectNode.querySelectorAll(".media-body a")[0].innerText;
            }

            var pygmyId = projectId(projectName);

            commonpygmy.setNodePygmyId(projectNode, pygmyId);

            var project = {};
            project.pygmyId = pygmyId;
            project.parentId = commonpygmy.groupingId(groupNode.getElementsByTagName("TH")[0].innerText);

            projects.push(project);
        }
    }

    function filterFor(event) {
        var projectIdsToShow = [];
        var parentIdsToShow = [];
        var filterText = event.srcElement.value.trim().toLowerCase().replace(/[^a-z0-9]/g,'');

        for(var i = 0; i < projects.length; i++)
        {
            var projectId = projects[i].pygmyId;
            var parentId = projects[i].parentId;

            if (projectId.indexOf(filterText) >= 0)
            {
                projectIdsToShow.push(projectId);

                if( !_.contains(parentIdsToShow, parentId) ) {
                    parentIdsToShow.push(parentId);
                }
            }
        }

        var allParentIds = _.map(projects, function(project){
            return project.parentId;
        });

        var allProjectIds = _.map(projects, function(project){
            return project.pygmyId;
        });

        commonpygmy.showItems(allProjectIds, projectIdsToShow, 'table-row', 'none');
        commonpygmy.showItems(allParentIds, parentIdsToShow, 'block', 'none');
    }

    function doneWithFilter(event) {
        var filterMetric = event.srcElement.value == '' ? "all" : "specific"
        chrome.runtime.sendMessage({ name: "used-project-name-filter", properties: { "filter": filterMetric  } });
    }

    function nodeInsertion(nodes) {
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node.nodeType != 1) return; // Not an element just ignore.

            if (node.parentNode && node.parentNode.tagName == 'FASTBOARD')
            {
                console.debug("Found an inserted project grouping");
                addGroupToCache(node);
            }

            if (node.tagName == "UL" && node.innerText.trim() == 'Dashboard') {
                console.info('Setting up project filter');
                var filterInput = createFilterInput();
                commonpygmy.addFilterInput(filterInput, node.parentNode);
            }
        }
    }

    function ensureFilterInputExists()
    {
        if (document.getElementById(this.inputId) == null)
        {
            console.debug("Adding the dashboard filter. Due to hard refresh of page");
            var breadcrumb = commonpygmy.getPageBreadcrumb("Dashboard");
            var filterInput = createFilterInput();
            commonpygmy.addFilterInput(filterInput, breadcrumb.parentNode);
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