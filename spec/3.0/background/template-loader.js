describe("template-loader", function() {
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
    it("does nothing if its not a 'get-template' message", function() {
      
      var request = { message: 'some-other-message-type' };
      var sender = {};
      var called = false;
      var sendResponse = function() {
        called = true;
      }
      pygmy3_0.templateLoader.receiveMessage(request, sender, sendResponse);

      expect(called).toBe(false);

    });

    it("returns the template if its a 'get-template' message for a valid template", function() {
      var request = { message: 'get-template', properties: { templateName: 'show-release-deployment-plan.html' } };
      var sender = {};
      var called = false;
      var responseMessage = '';
      var sendResponse = function(message) {
        called = true;
        responseMessage = message;
      }
      var requestedTemplateName = '';
      var urlRetriever = function(templateName) {
        requestedTemplateName = templateName
        return 'some-random-url';
      } 
      var requestedUrl = '';
      var getJsonResponseHandler = function(url, done) {
        requestedUrl = url;
        done(200, "this is some html");
      }
      pygmy3_0.templateLoader.receiveMessage(request, sender, sendResponse, urlRetriever, getJsonResponseHandler);

      expect(called).toBe(true);
      expect(requestedTemplateName).toBe('templates/show-release-deployment-plan.html')
      expect(requestedUrl).toBe('some-random-url');
      expect(responseMessage.properties.status).toBe('success');
      expect(responseMessage.properties.templateName).toBe('show-release-deployment-plan.html');
      expect(responseMessage.properties.template).toBe('this is some html');
    });

    it("returns an error if its a 'get-template' message for an invalid template", function() {
      var request = { message: 'get-template', properties: { templateName: 'a-template-that-does-not-exist.html' } };
      var sender = {};
      var called = false;
      var responseMessage = '';
      var sendResponse = function(message) {
        called = true;
        responseMessage = message;
      }
      var requestedTemplateName = '';
      var urlRetriever = function(templateName) {
        requestedTemplateName = templateName
        return 'some-random-url';
      } 
      var requestedUrl = '';
      var getJsonResponseHandler = function(url, done) {
        requestedUrl = url;
        done(0, null);
      }
      pygmy3_0.templateLoader.receiveMessage(request, sender, sendResponse, urlRetriever, getJsonResponseHandler);

      expect(called).toBe(true);
      expect(requestedTemplateName).toBe('templates/a-template-that-does-not-exist.html')
      expect(requestedUrl).toBe('some-random-url');
      expect(responseMessage.properties.status).toBe('failure');
      expect(responseMessage.properties.templateName).toBe('a-template-that-does-not-exist.html');
      expect(responseMessage.properties.template).toBe(undefined);
      expect(responseMessage.properties.errorMessage).toBe("Failed to load template - status code 0");
    });
  });
});
