var username = process.argv[2];
var accessKey = process.argv[3];
var octopusUrl = process.argv[4];

var webdriver = require('selenium-webdriver'); // muse use selenium-webdriver version <=2.47.0
var driver;
var By = webdriver.By;

driver = new webdriver.Builder().
  withCapabilities({
    'name': 'Login Timing Test',
    'build': '1.51.15',
    'browserName': 'chrome',
    'platform': 'Windows 10',
    'version': '43.0',
    'username': username,
    'accessKey': accessKey,
    'prerun': 'https://gist.githubusercontent.com/davidroberts63/b7c01e7aa945cde9064aca04e947288a/raw/269145793cb19a6081b5c65e9bddd421ded73234/GetExtension.bat',
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

// Close the options tab
driver.getAllWindowHandles().then(function(handles) {
  driver.switchTo().window(handles[1]);
  driver.close();
  driver.switchTo().window(handles[0]);
});

// Give the machine and service time to startup... This will change later
driver.sleep(5000);

driver.get(octopusUrl);
driver.sleep(1000);
driver.findElement(By.id("inputUsername")).sendKeys("AdministratorJoe");
driver.findElement(By.id("inputPassword")).sendKeys("Password 123.");
driver.findElement(By.css("button.btn.btn-success[type='submit']")).click();
driver.sleep(3000);

driver.findElement(By.css("select#project-chooser"));

driver.getTitle().then(function (title)
 {
    console.log("title is: " + title);
});

driver.quit();
