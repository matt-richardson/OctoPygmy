describe("clone-step", function() {
  var originalConsoleDebug;
  var originalConsoleLog;

  beforeEach(function () {
    originalConsoleDebug = console.debug;
    originalConsoleLog = console.log;
    console.debug = function() {};
    console.log = function() {};
  });

  afterEach(function() {
    console.debug = originalConsoleDebug;
    console.log = originalConsoleLog
  });

  describe("receiveMessage", function() {
    var span;

    beforeEach(function () {
      span = document.createElement('span');
      span.id = 'bluefin-clonestep-refreshbutton';
      var attrib = document.createAttribute("status");
      attrib.value = 'notset';
      span.setAttributeNode(attrib);
      attrib = document.createAttribute("message");
      attrib.value = 'notset';
      span.setAttributeNode(attrib);
      document.body.appendChild(span);
    });

    afterEach(function() {
      span = document.getElementById('bluefin-clonestep-refreshbutton');
      if (span) {
        if (span.remove)
          span.remove();
        else
          span.parentNode.removeChild(span);
      }
    });

    it("calls the refresh handler, and sets message to blank if status is successful", function() {
      var called = false;
      span.onClick = function() { called = true; };

      var response = { 'message': 'clone-step-response',  'properties': { 'status': 'success' } };

      pygmy3_0.cloneStep.receiveMessage(response);
      span = document.querySelector("#bluefin-clonestep-refreshbutton")
      expect(called).toBe(true);
      expect(span.attributes['message'].value).toBe('');
      expect(span.attributes['status'].value).toBe('success');
    });

    it("calls the refresh handler, and sets message if status is not successful", function() {
      
      var called = false;
      span.onClick = function() { called = true; };

      var response = { 'message': 'clone-step-response',  'properties': { 'status': 'failure', 'errorMessage': 'the error message', 'errors': [ "error1", "error2" ] } };

      pygmy3_0.cloneStep.receiveMessage(response);
      expect(called).toBe(true);
      span = document.querySelector("#bluefin-clonestep-refreshbutton")
      expect(span.attributes['message'].value).toBe('Failed to clone the step. the error message error1 error2');
      expect(span.attributes['status'].value).toBe('failure');
    });
  });
  
  describe("cloneStep", function() {
    it("extracts the appropriate attributes, and calls the send message handler", function() {
      var actualMessage;
      var sendMessage = function (message) {
        actualMessage = message;
      }
      var receiveMessage = function() { }

      var attributes = {};
      attributes['data-step-id'] = {'value': '123'};
      attributes['data-deployment-process-id'] = { 'value': '456' };
      var scope = { 'parentElement': { 'attributes' : attributes }};

      pygmy3_0.cloneStep.cloneStep.apply(scope, [{}, sendMessage, receiveMessage]);
      expect(actualMessage.message).toBe('clone-step');
      expect(actualMessage.properties.stepId).toBe('123');
      expect(actualMessage.properties.deploymentProcessId).toBe('456');
    });      
  });

  describe("addCloneStepMenuItem", function() {
    it("adds a separator and a new menu item to the drop down", function() {
      var ul = document.createElement('ul');
      ul.className = 'dropdown-menu'
      var attrib = document.createAttribute('role');
      attrib.value = 'menu';
      ul.setAttributeNode(attrib);
      var li = document.createElement('li');
      ul.appendChild(li);
      li.innerHTML = '<a tabindex="-1">Existing menu item</a>'
      document.body.appendChild(ul);
      
      pygmy3_0.cloneStep.addCloneStepMenuItem();
      
      ul = document.querySelector("ul.dropdown-menu[role='menu']");
      expect(ul.children.length).toEqual(3);
      expect(ul.children[1].className).toEqual('divider');
      expect(ul.children[2].innerHTML).toEqual('<a tabindex="-1">Clone</a>');

      if (ul.remove) 
        ul.remove();
      else
        ul.parentNode.removeChild(ul);
    });
  });

  describe("addCloneStepMetaData", function() {
    it("adds the metadata attributes to the template", function() {
      var script = document.createElement('script');
      script.id = 'processEditDropdown';
      script.type="text/html"
      script.text = '<ul class="dropdown-menu" role="menu">';
      document.body.appendChild(script);
      pygmy3_0.cloneStep.addCloneStepMetaData();
      script = document.getElementById('processEditDropdown');

      expect(script.text).toEqual('<ul class="dropdown-menu" role="menu" data-step-id="{{step.Id}}" data-deployment-process-id="{{project.DeploymentProcessId}}">');
    });      
  });

  describe("addCloneStepRefreshHandler", function() {
    it("adds a handler and script", function() {
      pygmy3_0.cloneStep.addCloneStepRefreshHandler();
      var handler = document.querySelector('#bluefin-clonestep-refreshbutton')
      expect(handler).not.toBe(null);
      expect(handler.attributes.getNamedItem('status')).not.toBe(null);
      expect(handler.attributes.getNamedItem('status').value).toEqual("");
      expect(handler.attributes.getNamedItem('message')).not.toBe(null);
      expect(handler.attributes.getNamedItem('message').value).toEqual("");

      var script = document.querySelector('#bluefin-clonestep-refreshhandler');
      expect(script).not.toBe(null);
      expect(script.type).toEqual("text/javascript");
      expect(script.text).toEqual("var button = document.querySelector('#bluefin-clonestep-refreshbutton'); button.onClick = button.onclick = function() { if (this.attributes['status'].value == 'success') { angular.element(\"#processEditDropdown\").injector().get(\"$route\").reload();} else { angular.element(\"#processEditDropdown\").injector().get(\"octoDialog\").messageBox('Clone Step Failed', this.attributes['message'].value, [{label: 'ok'}]);} }");
    });

    it("doesn't add the handler twice", function() {
      pygmy3_0.cloneStep.addCloneStepRefreshHandler();
      pygmy3_0.cloneStep.addCloneStepRefreshHandler();
      expect(document.querySelectorAll('#bluefin-clonestep-refreshbutton').length).toEqual(1);
    });
  });

  describe("addCloneStepMenuItems", function() {
    it("adds the onclick handler to all child drop downs", function() {
      var div = document.createElement('div');
      div.className = 'menu-button';
      var link = document.createElement("a");
      link.id = 'link1';
      var attrib = document.createAttribute("external-dropdown");
      attrib.value = "{id: 'processEditDropdown', scope: { step: step, action: step.Actions[0] } }";
      link.setAttributeNode(attrib);
      div.appendChild(link);
      document.body.appendChild(div);

      pygmy3_0.cloneStep.addCloneStepMenuItems(document);

      link = document.getElementById('link1');
      expect(link.onclick.toString()).toContain('function addCloneStepMenuItem()');
    });      
  });
});