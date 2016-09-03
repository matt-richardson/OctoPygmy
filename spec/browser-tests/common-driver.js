var webdriver = require('selenium-webdriver');
var By = webdriver.By;
var SauceLabs = require("saucelabs");
var fs = require("fs");
var until = webdriver.until;

module.exports = {
    failIfTrue: function(done, failMessage) {
        return function(result) {
            if(result) done(failMessage);
        }
    },

    failIfFalse: function(done, failMessage) {
        return function(result) { 
            if(!result) done(failMessage);
        }
    },
    
    failed: function(done, failMessage) {
        return function(reason) {
            done(reason + "::" + failMessage);
        }
    },

    failuresOccured: function() {
        return jasmine.getEnv().currentSpec.results_.failedCount > 0;
    },

    saucelabs: {},

    setTestStatus: function(driver, done) {
        var spec = jasmine.getEnv().currentSpec;
        driver.controlFlow().reset(); // Discontinue any further driver actions that may have been defined.
        this.updateJob(driver, {passed: spec.results_.totalCount == spec.results_.passedCount})()
            .then(driver.quit())
            .then(function() { console.log("Setting test status"); })
            .then(done);
    },
    
    updateJob: function(driver, options) {
        return function() {
            return new Promise(function(resolve, reject) {
                this.saucelabs.updateJob(driver.sessionID, options, resolve);
            });
        };
    },

    updateDriverSessionId: function(driver) {
        return function(session) {
            driver.sessionID = session.id_;
        }
    },

    setupDriver: function(sauceUsername, sauceKey, extensionUrl, octopusUrl, octopusPassword, testIdFilename, octopusVersion, bluefinVersion, done) {
        saucelabs = new SauceLabs({
            username: sauceUsername,
            password: sauceKey
        });

        var result = new webdriver.Builder().
            withCapabilities({
                'name': 'Spec run in node',
                'build': bluefinVersion + "-" + octopusVersion,
                'browserName': 'chrome',
                'platform': 'Windows 10',
                'version': '43.0',
                'username': sauceUsername,
                'accessKey': sauceKey,
                'prerun': {
                  'executable': 'https://gist.githubusercontent.com/davidroberts63/b7c01e7aa945cde9064aca04e947288a/raw/GetExtension.bat',
                  'args': [ extensionUrl ]
                },
                "chromeOptions": {
                    "args": [ 
                        "--load-extension=C:\\bluefin-extension",
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
            usingServer("http://" + sauceUsername + ":" + sauceKey +
              "@ondemand.saucelabs.com:80/wd/hub").
            build();

        var spec = jasmine.getEnv().currentSpec;
        result.getSession()
        .then(this.updateDriverSessionId(result))
        .then(this.updateJob(result, {name: spec.suite.description + ' ' + spec.description}))
        .then(this.outputTestIdentifier(testIdFilename, result, spec.suite.description + " " + spec.description))
        .then(this.closeOptionsTab(result))
        .then(this.login(result, octopusUrl, octopusPassword, done))
        .then(done);

        return result;
    },

    outputTestIdentifier: function(filename, driver, name) {
        return function() {
            return new Promise(function(resolve, reject) {
                fs.appendFile(filename, driver.sessionID + "~" + name + "\n", "utf8", resolve);
            });
        }
    },

    closeOptionsTab: function(driver) {
        return function() {
            return driver.getAllWindowHandles().then(function(handles) {
                driver.switchTo().window(handles[1]);
                driver.findElement(By.id("analytics")).click();
                driver.findElement(By.id("save")).click();
                driver.close();
                driver.switchTo().window(handles[0]);
                driver.navigate().refresh();
            });
        }
    },

    login: function(driver, url, password, done) {
        var tests = this;
        return function() {
            driver.get(url);
            driver.wait(until.elementLocated(By.id("inputUsername")), 3000, "Didn't get the login page.").thenCatch(done);
            driver.findElement(By.id("inputUsername")).sendKeys("AdministratorJoe");
            driver.findElement(By.id("inputPassword")).sendKeys(password);
            driver.findElement(By.css("button.btn.btn-success[type='submit']")).click();
            return driver.sleep(3000).then();
        }
    }
};