var webdriver = require('selenium-webdriver');
var By = webdriver.By;
var until = webdriver.until;
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
            usingServer("http://" + username + ":" + accessKey +
              "@ondemand.saucelabs.com:80/wd/hub").
            build();

        var spec = jasmine.getEnv().currentSpec;
        driver.getSession().then(function(sessionid) {
            driver.sessionID = sessionid.id_;
        })
        .then(updateJob({name: spec.suite.description + ' ' + spec.description}))
        .then(outputTestIdentifier(driver.sessionID, spec.suite.description + " " + spec.description))
        .then(closeOptionsTab)
        .then(login)
        .then(done);
    });

    afterEach(function(done) {
        var spec = jasmine.getEnv().currentSpec;
        updateJob({passed: spec.results_.totalCount == spec.results_.passedCount})()
            .then(driver.quit())
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

    it('should show only the group selected', function(done) {
        driver.isElementPresent(By.css("select#project-chooser"))
            .then(failIfFalse(done, "Project chooser could not be found."));
        var dropdown = driver.findElement(By.css("select#project-chooser"));
        dropdown.click();
        dropdown.sendKeys("Clever Mature Limit")
        dropdown.click();
        driver.findElement(By.css("[octopygmy-id='zoctopygmy-agreeableregularholiday-grouping']"))
            .isDisplayed()
            .then(failIfTrue(done, "Project chooser did not hide other project groupings"))
            .then(done);
    });

    it('should show only the environment selected', function(done) {
        driver.findElement(By.css("a[href='#/environments']")).click();
        driver.wait(until.elementIsNotVisible(driver.findElement(By.css("span.spin-static"))), 1000)
            .then(failIfFalse(done, "Environments didn't load in time"));
        driver.isElementPresent(By.css("select#envrionment-chooser"))
            .then(failIfFalse(done, "Environment chooser could not be found"));
        var dropdown = driver.findElement(By.css("select#envrionment-chooser"));
        dropdown.click();
        dropdown.sendKeys("QA");
        dropdown.click();
        driver.findElement(By.css("[octopygmy-id='zoctopygmy-development-grouping']"))
            .isDisplayed()
            .then(failIfTrue(done, "Environment chooser did not hide other environments"));
        driver.findElement(By.css("[octopygmy-id='zoctopygmy-qa-grouping']"))
            .isDisplayed()
            .then(failIfFalse(done, "Environment chooser should NOT have hidden the selected environment"))
            .then(done);
    });

    function failIfTrue(done, failMessage) {
        return function(result) {
            if(result) done(failMessage);
        }
    }

    function failIfFalse(done, failMessage) {
        return function(result) { 
            if(!result) done(failMessage);
        }
    }
});
