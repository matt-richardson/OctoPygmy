var webdriver = require('selenium-webdriver');
var By = webdriver.By;
var until = webdriver.until;
var username = process.env.SauceLabUsername;
var accessKey = process.env.SauceLabAccessKey;
var octopusUrl = process.env.OctopusUrl;
var octopusPassword = process.env.OctopusPassword;
var octopusVersion = process.env.OctopusVersion;
var bluefinVersion = process.env.BluefinVersion;
var testIdFilename = process.env.TestIdFilename;
var tests = require("./common-driver.js");

jasmine.getEnv().defaultTimeoutInterval = 100000;

describe('Target filter', function() {
    var driver = null;

    beforeEach(function(done) {
        driver = tests.setupDriver(username, accessKey, process.env.ExtensionDownloadUrl, octopusUrl, octopusPassword, testIdFilename, octopusVersion, bluefinVersion, done);
    });

    afterEach(function(done) {
        tests.setTestStatus(driver, done);
    });

    it('should only show targets with matching tag', function(done) {
        driver.findElement(By.css("a[href='#/environments']")).click();
        driver.wait(until.elementIsNotVisible(driver.findElement(By.css("span.spin-static"))), 1000)
            .then(tests.failIfFalse(done, "Environments didn't load in time"));
        driver.isElementPresent(By.css("input.grouping-chooser"))
            .then(tests.failIfFalse(done, "Target filter could not be found"));
        driver.findElement(By.css("input.grouping-chooser"))
            .sendKeys("app-internal");
        driver.isElementPresent(By.css("[octopygmy-id='zoctopygmy-database-internal-grouping']"))
            .then(tests.failIfFalse(done, "Target filter did not mark targets with bluefin id."));
        driver.findElement(By.css("[octopygmy-id='zoctopygmy-database-internal-grouping']"))
            .isDisplayed()
            .then(tests.failIfTrue(done, "Target filter did not hide targets with non-matching tag"))
            .then(done);
    });
});