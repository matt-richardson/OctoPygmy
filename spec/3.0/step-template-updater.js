describe("step-template-updater", function() {
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

  describe("version check", function() {

    //mock out theMutationObserver as it doesn't exist in the jasmine/phantom version
    //used on the travis build servers
    function MutationObserver(callback) {
    };

    it("should not show for version 3.12.0", function() {
      var content = document.createElement('div');
      var called = false;
      var oldValue = window.chrome;
      window.chrome = { runtime : { onMessage : { addListener: function() { called = true; } }  }}
      pygmy3_0.stepTemplateUpdater.observe(content, "3.12.0");
      window.chrome = oldValue;
      expect(called).toBe(false);
    });

    it("should show for version 3.11.1", function() {
      var content = document.createElement('div');
      var called = false;
      var oldValue = window.chrome;
      window.chrome = { runtime : { onMessage : { addListener: function() { called = true; } }  }}
      pygmy3_0.stepTemplateUpdater.observe(content, "3.11.1");
      window.chrome = oldValue;
      expect(called).toBe(true);
    });
  });
});