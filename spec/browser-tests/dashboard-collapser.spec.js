var webdriver = require('selenium-webdriver');
var By = webdriver.By;
var SauceLabs = require("saucelabs");
var fs = require("fs");
var username = process.env.SauceLabUsername;
var accessKey = process.env.SauceLabAccessKey;
var octopusUrl = process.env.OctopusUrl;
var octopusPassword = process.env.OctopusPassword;
var testIdFilename = process.env.TestIdFilename;
var saucelabs = new SauceLabs({
      username: username,
      password: accessKey
    });

jasmine.getEnv().defaultTimeoutInterval = 100000;

describe('Dashboard collapser', function() {
    var driver = null;
    
    beforeEach(function(done) {
        driver = new webdriver.Builder().
            withCapabilities({
                'name': 'Spec run in node',
                'build': '1.51.15',
                'browserName': 'chrome',
                'platform': 'Windows 10',
                'version': '43.0',
                'username': username,
                'accessKey': accessKey,
                'prerun': {
                  'executable': 'https://gist.githubusercontent.com/davidroberts63/b7c01e7aa945cde9064aca04e947288a/raw/GetExtension.bat',
                  'args': [ process.env.ExtensionDownloadUrl ]
                },
                "chromeOptions": {
                    "args": [ 
                        "--load-extension=C:\\bluefin-extension\\src",
                        "start-maximized",
                        "disable-webgl",
                        "blacklist-webgl",
                        "blacklist-accelerated-compositing",
                        "disable-accelerated-2d-canvas",
                        "disable-accelerated-compositing",
                        "disable-accelerated-layers",
                        "disable-accelerated-plugins",
                        "disable-accelerated-video",
                        "disable-accelerated-video-decode",
                        "disable-gpu",
                        "disable-infobars",
                        "test-type"
                    ]
                    },
            }).
            usingServer("http://" + username + ":" + accessKey +
              "@ondemand.saucelabs.com:80/wd/hub").
            build();

        var spec = jasmine.getEnv().currentSpec;
        driver.getSession().then(function(sessionid) {
            driver.sessionID = sessionid.id_;
        })
        .then(updateJob({name: spec.suite.description + ' ' + spec.description}))
        .then(closeOptionsTab)
        .then(login)
        .then(done);
    });

    afterEach(function(done) {
        var spec = jasmine.getEnv().currentSpec;
        updateJob({passed: spec.results_.totalCount == spec.results_.passedCount})()
            .then(driver.quit())
            .then(outputTestIdentifier(driver.sessionID, spec.suite.description + " " + spec.description))
            .then(done);
    });
    
    function outputTestIdentifier(id, name) {
        return function() {
            return new Promise(function(resolve, reject) {
                fs.appendFile(testIdFilename, id + "~" + name + "\n", "utf8", resolve);
            });
        }
    }

    function updateJob(options) {
        return function() {
            return new Promise(function(resolve, reject) {
                saucelabs.updateJob(driver.sessionID, options, resolve);
            });
        };
    }

    function closeOptionsTab() {
        return driver.getAllWindowHandles().then(function(handles) {
            driver.switchTo().window(handles[1]);
            driver.close();
            driver.switchTo().window(handles[0]);
        });
    }

    function login() {
        driver.get(octopusUrl);
        driver.sleep(1000);
        driver.findElement(By.id("inputUsername")).sendKeys("AdministratorJoe");
        driver.findElement(By.id("inputPassword")).sendKeys(octopusPassword);
        driver.findElement(By.css("button.btn.btn-success[type='submit']")).click();
        return driver.sleep(3000).then();
    }
    
    it('should be shown', function (done) {
        driver.sleep(1000);
        driver.findElement(By.css("select#project-chooser"))
            .then(function() { done(); }, function(err) { done(err); });
    });

    it('should just work', function(done) {
        done();
    })
});
