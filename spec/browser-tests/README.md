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

## Running tests locally
Run the `RunBrowserTestsLocally.ps1` powershell script, be sure you've run `npm install`. You will also need a copy of the chrome driver in your PATH. You can download it from [Google](https://sites.google.com/a/chromium.org/chromedriver/). The latest one should be okay. Just be sure you put the `chromedriver.exe` (that's all there is) somewhere in your PATH. You can just put it in the folder you execute the script from as well. Just don't commit it. When running that script you will need to provide the `-octopusUrl`. Typically it'll be `http://localhost` but you may need to specify the port in that url if you changed that.

## Loading test data into the Octopus Deploy server.
**Be careful** this part destroys data. Make sure you are connecting to a test server and database. The `Load-Octopus.ps1` powershell script in `browser-tests\setup-scripts` will load the test data that the browser tests rely on.

Example call of load script:
```
& .\Load-Octopus.ps1 `
   -OctopusRootUrl "http://localhost:8034/"`
   -SqlServerInstance "SQLExpress"`
   -DatabaseName "Octopus34"`
   -ServiceName "OctopusDeploy: OctopusServer34"`
   -OctopusAdminUsername "JoeAdministrator"`
   -OctopusAdminPassword "Password 123."`
   -GeneratedDataFilePath ".\gendata.json"`
   -DatabaseBackupFilePath "C:\Backups\Octopus34Loaded.bak"`
   -TentacleInstallPath "C:\Program Files\Octopus Deploy\Tentacle"`
   -ExportPath "C:\Backups\OctopusExport34"`
   -MigratorPath "C:\Program Files\Octopus Deploy\Octopus-3.4.9\Octopus.Migrator.exe"`
   -InstanceName "OctopusServer34"
```

The first thing the script does is restore a database backup as specified in the `-DatabaseBackupFilePath` parameter. If that file does not exist it will create the folder (if needed) and then make a backup of the database to that location. So be sure SQL Server has access to the path you specify. It does this so you can re-load the data multiple times without duplicating anything. 

> **NOTE** The load script assumes you are using a local instance of SQL Server Express. If not you will need to change the connection string created within the script. This will change later to become more flexible.
>
> If you are connecting to a remote SQL Server then the backup will be on the remote server, not your local machine.

Once the initial database has been restored the test data is loaded in one of two ways.
- Pull Envrionment, Target and Project names from `browser-tests\setup-scripts\gendata.json` and use the Octopus Deploy REST api to create the items appropriately. If this is done then an export of the data is made using the Octopus.Migrator export command line after all the items have been created.
- Import a prior Octopus.Migrator export.

The JSON export of the data will be put in the path specified by the `-ExportPath` parameter. As in the first way, if that export does not already exist the data is loaded via REST API calls and then an export is made to that location. If that location does exist then it just imports that. You can use this to add data to try out tests. But other people/builds will use the REST API path initially.

The second way is primarily to allow for quick resets of data after the tests that change data.

You need to have a Tentacle installed. The `-TentacleInstallPath` is used so that the load script can get the thumbprint of the tentacle for use in created valid targets.

### The SetupOctopusDeployServer.ps1 script
This is intended to be used for testing **multiple** versions of Octopus Deploy on one machine. Be **very** carful with this. Only run it on a VM or other test machine as it messes with the registry and has the potential to mess things up.

Having said that.

It installs [Chocolatey](https://chocolatey.org/). Using chocolatey it installs the following:
- SQL Server 2014 Express
- Octopus Deploy Tentacle 3.4.0
- Octopus Deploy Server 3.4.0
- Messes with the registry to make MsiExec think Octopus Deploy is not installed.
- Octopus Deploy Server 3.4.9

Each version of the Octopus Deploy server is installed to its own folder so they can run side by side. They use a separate database each but connect to the same Tentacle. The port number for each install of Octopus Deploy Server is different according to the version number. For example `http://localhost:8034` will bring up the 3.4.9 server web app.

> If you make changes you will need to use the same changes (port, instance,...) in the load script and tests.

You will need to provide a license file for use. Specify the path to it with the `-licenseFilePath` parameter to the script.

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

## Typical Errors in the AppVeyor build
> ConvertTo-SecureString : Cannot bind argument to parameter 'String' because it is null.
>
> This is because certain secure information needed to start the VMs is not currently available for pull requests from other repositories.

## Don't be afraid to make improvements or correct things.
None of us know it all. If you know more about Jasmine, node, Selenium npm, Sauce Labs, etc... and can see an improvement then suggest it.
