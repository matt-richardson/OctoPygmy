pygmy3_0.cloneStep = (function() {
    var cloneStepMetaDataAdded = false;

    function receiveMessage(message) {
        // Handle the message from the background script here
    }

    function isProcessEditDropdown(node) {
        return (node.tagName == 'SCRIPT' && node.id == 'processEditDropdown');
    }

    function cloneStep() {
        var menuItem = this;
        var stepId = this.parentElement.attributes["data-step-id"].value;
        var deploymentProcessId = this.parentElement.attributes["data-deployment-process-id"].value;
        console.debug("sending clone-step message for " + stepId);
        chrome.runtime.sendMessage({ message: 'clone-step', properties: { stepId: stepId, deploymentProcessId: deploymentProcessId }});
    }

    function addCloneStepMenuItem() {
        console.debug("Adding clone menu item to dropdown menu")
        var menu = document.querySelector("ul.dropdown-menu[role='menu']");

        var newMenuItem = document.createElement('li')
        newMenuItem.className = 'divider';
        menu.appendChild(newMenuItem);

        newMenuItem = document.createElement('li')
        newMenuItem.innerHTML = '<a tabindex="-1">Clone</a>'
        newMenuItem.onclick = cloneStep;
        menu.appendChild(newMenuItem);
    }

    function addCloneStepMetaData() {
        console.debug("Adding step id to dropdown template")
        var template = document.getElementById('processEditDropdown');
        template.text = template.text.replace(
          '<ul class="dropdown-menu" role="menu">',
          '<ul class="dropdown-menu" role="menu" data-step-id="{{step.Id}}" data-deployment-process-id="{{project.DeploymentProcessId}}">');
    }

    function nodeMutated(node) {
        if (!cloneStepMetaDataAdded && node.querySelector("#processEditDropdown")) {
            console.debug("Loading Blue fin feature 'clone step'");
            addCloneStepMetaData();
            cloneStepMetaDataAdded = true;
        }

        var nodes = node.querySelectorAll("DIV.menu-button A[external-dropdown]");
        for(i = 0; i < nodes.length; i++ ) {
            if (nodes[i].attributes['external-dropdown'].value == "{id: 'processEditDropdown', scope: { step: step, action: step.Actions[0] } }") {
              nodes[i].onclick = addCloneStepMenuItem;
            }
        }
    }

    function nodesMutated(nodes) {
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node.nodeType != 1) return; // Not an element just ignore.
            nodeMutated(node);
        }
    }

    function observe(content) {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type == 'childList') {
                    nodesMutated(mutation.addedNodes);
                }
                else {
                    console.error("Unexpected node mutation type '" + mutation.type + "'")
                }
            });
        });
        observer.observe(content, { childList: true, subtree: true, attributes: false, characterData: false});

        // Only use this if you have a background script that will process messages and respond to this content script.
        chrome.runtime.onMessage.addListener(receiveMessage);
    }

    return {
        // This is the only function that is required of all features. It's what is used in pygmy.js upon startup.
        observe: observe
    };
})();