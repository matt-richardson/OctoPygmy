# Browser Testing Bluefin

> **NOTE**: Browser testing will aggravate you. Just...breathe.
>
> Then again, maybe I'm the only one.

## Current setup

1. Commit or pull request is made
1. AppVeyor starts the build process
1. A build defined PowerShell script runs
1. Starting Azure VMs for multiple versions of Octopus Deploy
1. Starting Jasmine tests in this folder
1. Using Selenium to connect to SauceLabs to run on Windows 10
1. Uploading Jasmine test results to AppVeyor build
    - Test status (passed/failed) in the *Tests* section
    - SauceLabs URLs for the tests in the *Messages* section
1. Stopping the Azure VMs

[AppVeyor Build](https://ci.appveyor.com/project/BluefinOctopusDeploy/chrome-extension)

## Naming
Name the browser test spec files in the following manner: `feature`.spec.js. Feature should be the same name as the source file that implements the feature.

## How many tests?
The fewer the better, counterintuitive right? Just use the browser tests to make sure all the parts are connecting correctly. Rely on the unit tests to verify specific logic.

## Ensuring your tests run properly
> **Pay Attention**: If you don't follow these points your tests may fail and then not report anything at the end. Giving very little to go on.

### Making sure the setup completed correctly
At the begging of each *it* test you **must** have the following:

`if(tests.failuresOccured()) { done(); return; } // Required because jasmine runs 'it' even if 'beforeEach' fails. Argh.`

The code comment says it all. This is in the rare case the VM is running slow and the login page doesn't show up in time or just fails. If you don't do that line above then the reporting of test failures will not happen because a Selenium exception will occur later on. 

### Check for elements before using them
If you need to `findElement` you will most likely need to first check `isElementPresent`. You can see an example of this in the `dashboard-collapser.spec.js`. I've tried to just use `findElement` with a `thenCatch` but it didn't work.

## Things that still need to be done
- Resetting of database after tests are complete. I think this can be done by executing an Octopus script console task via REST api to restore the original database. For the moment none of the tests actually change data.

## Don't be afraid to make improvements or correct things.
None of us know it all. If you know more about Jasmine, node, Selenium npm, Sauce Labs, etc... and can see an improvement then suggest it.