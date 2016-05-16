describe("view-resultant-variable-list", function() {
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

  function removeElement(id) {
    var element = document.getElementById(id);
    if (element) {
      if (element.remove)
        element.remove();
      else
        element.parentNode.removeChild(element);
    }
  }

  describe("receiveMessage", function() {
    var showLink;
    beforeEach(function () {
      showLink = document.createElement('a');
      showLink.id = 'bluefin-viewresultantvariablelist-button';
      document.body.appendChild(showLink);
    });

    afterEach(function() {
      removeElement('bluefin-viewresultantvariablelist-handler');
      removeElement('bluefin-viewresultantvariablelist-button');
    });

    it("should do nothing if its not a 'get-template' message", function() {
      var message = { 'message': 'a-different-message' };
      pygmy3_0.viewResultantVariableList.receiveMessage(message);

      var script = document.getElementById('bluefin-viewresultantvariablelist-handler');
      expect(script).toBe(null);
    });

    it("should do nothing if its not the 'view-resultant-variable-list.html' template", function() {
      var message = { 'message': 'get-template-response', 'properties': { 'templateName' : 'a-different-template.html', 'template': '<div>hello</div>' }};
      pygmy3_0.viewResultantVariableList.receiveMessage(message);

      var script = document.getElementById('bluefin-viewresultantvariablelist-handler');
      expect(script).toBe(null);
    });

    it("should should add a new script element", function() {
      var template = '<div>hello</div>';
      var message = { 'message': 'get-template-response', 'properties': { 'templateName' : 'view-resultant-variable-list.html', 'template': template }};
      pygmy3_0.viewResultantVariableList.receiveMessage(message);

      var script = document.getElementById('bluefin-viewresultantvariablelist-handler');
      expect(script).not.toBe(null);
      expect(script.type).toBe('text/javascript');
      expect(script.text).not.toContain("template: '#{template}'");
      expect(script.text).toContain("template: '" + template + "',");
    });
  });

  describe("checkIfWeAreOnVariablesPage", function() {
    it("should add the link if we are on the variables page", function() {
      var called = false;
      var handler = function() { called = true; };
      var locationFn = function() { return "#/projects/my-fancy-project/variables" };

      pygmy3_0.viewResultantVariableList.checkIfWeAreOnVariablesPage(handler, locationFn);

      expect(called).toBe(true);
    });

    it("should not add the link if we are on the releases page", function() {
      var called = false;
      var handler = function() { called = true; }
      var locationFn = function() { return "#/projects/Projects-411/releases" };

      pygmy3_0.viewResultantVariableList.checkIfWeAreOnVariablesPage(handler, locationFn);

      expect(called).toBe(false);
    });
  });

  describe("addViewResultantVariableListButton", function() {
    var variablesHeading;
    beforeEach(function () {
      var s = '<div><div class="ng-hide"><a id="includeLink">Include variable sets from the Library</a></div><a id="chooseLink">Choose different library variable sets</a></div>';
      var div = document.createElement('div');
      div.innerHTML = s;
      div.id = 'div-for-testing-view-resultant-variable-list';
      document.body.appendChild(div);
    });

    afterEach(function() {
      removeElement('div-for-testing-view-resultant-variable-list');
    });

    it("should add a link", function() {
      var called = false;
      var sendMessageHandler = function(message, handler) {
        called = true;
        expect(handler).toBe(receiveMessageHandler);
      };
      var receiveMessageHandler = function() {};

      pygmy3_0.viewResultantVariableList.addViewResultantVariableListButton(sendMessageHandler, receiveMessageHandler);

      expect(document.getElementById('bluefin-viewresultantvariablelist-button')).not.toBe(null);
      expect(document.getElementById('bluefin-viewresultantvariablelist-button').innerText).toBe("Show resultant variable list");
    });

    it("should not add more than once", function() {
      var called = false;
      var sendMessageHandler = function(message, handler) {
        called = true;
        expect(handler).toBe(receiveMessageHandler);
      };
      var receiveMessageHandler = function() {};

      //6 links before we start
      //todo: some other tests are leaving links on the page - need to clean them up
      pygmy3_0.viewResultantVariableList.addViewResultantVariableListButton(sendMessageHandler, receiveMessageHandler);
      expect(document.querySelectorAll('a').length).toBe(7);
      pygmy3_0.viewResultantVariableList.addViewResultantVariableListButton(sendMessageHandler, receiveMessageHandler);
      expect(document.querySelectorAll('a').length).toBe(7);
    });

    it("should not add the link if both the existing 'choose' and 'include' links are not yet visible", function() {
      var called = false;
      var sendMessageHandler = function(message, handler) {
        called = true;
        expect(handler).toBe(receiveMessageHandler);
      };
      var receiveMessageHandler = function() {};

      document.getElementById('includeLink').parentNode.className = 'ng-hide';
      document.getElementById('chooseLink').className = 'ng-hide';

      pygmy3_0.viewResultantVariableList.addViewResultantVariableListButton(sendMessageHandler, receiveMessageHandler);
      expect(document.querySelectorAll('a').length).toBe(6);
    });

    it("should hide the link if there are no variable sets", function() {
      var called = false;
      var sendMessageHandler = function(message, handler) {
        called = true;
        expect(handler).toBe(receiveMessageHandler);
      };
      var receiveMessageHandler = function() {};

      document.getElementById('includeLink').parentNode.className = '';
      document.getElementById('chooseLink').className = 'ng-hide';
      pygmy3_0.viewResultantVariableList.addViewResultantVariableListButton(sendMessageHandler, receiveMessageHandler);
      expect(document.getElementById('bluefin-viewresultantvariablelist-button').parentNode.className).toContain('ng-hide');
    });

    it("should add the analytics handler", function() {
      var called = false;
      var sendMessageHandler = function(message, handler) {
        called = true;
        expect(handler).toBe(receiveMessageHandler);
      };
      var receiveMessageHandler = function() {};

      pygmy3_0.viewResultantVariableList.addViewResultantVariableListButton(sendMessageHandler, receiveMessageHandler);

      expect(document.getElementById('bluefin-viewresultantvariablelist-analytics-handler')).not.toBe(null);
      expect(typeof document.getElementById('bluefin-viewresultantvariablelist-analytics-handler').onclick).toBe('function');
    });
  });

  describe("angularShowModalDialog", function() {
    //unfortunately, I dont there there is a way of testing this, given the dependency on AngularJS & the Octopus AngularJS app
  });

})