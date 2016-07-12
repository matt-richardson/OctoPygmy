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
console.log("Testing against version " + octopusVersion + " at " + octopusUrl);

describe('Dashboard collapser', function() {
    var driver = null;
    
    beforeEach(function(done) {
        driver = tests.setupDriver(username, accessKey, process.env.ExtensionDownloadUrl, octopusUrl, octopusPassword, testIdFilename, octopusVersion, bluefinVersion, done);
    });

    afterEach(function(done) {
        tests.setTestStatus(driver, done);
    });

    it('should show only the group selected', function(done) {
        driver.isElementPresent(By.css("select#project-chooser"))
            .then(tests.failIfFalse(done, "Project chooser could not be found."));
        var dropdown = driver.findElement(By.css("select#project-chooser"));
        dropdown.click();
        dropdown.sendKeys("Clever Mature Limit")
        dropdown.click();
        driver.findElement(By.css("[octopygmy-id='zoctopygmy-agreeableregularholiday-grouping']"))
            .isDisplayed()
            .then(tests.failIfTrue(done, "Project chooser did not hide other project groupings"))
            .then(done);
    });
});
