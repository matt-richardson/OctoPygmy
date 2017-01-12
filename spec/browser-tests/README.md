# Browser Testing Bluefin

> **NOTE**: Browser testing will aggravate you. Just...breathe.
>
> Then again, maybe I'm the only one.

## Running tests locally
Run the `RunBrowserTestsLocally.ps1` powershell script, be sure you've run `npm install`. You will also need a copy of the chrome driver in your PATH. You can download it from [Google](https://sites.google.com/a/chromium.org/chromedriver/). The latest one should be okay. Just be sure you put the `chromedriver.exe` (that's all there is) somewhere in your PATH. You can just put it in the folder you execute the script from as well. Just don't commit it. When running that script you will need to provide the `-octopusUrl`. Typically it'll be `http://localhost` but you may need to specify the port in that url if you changed that.

> Do you see this error when running the browser tests?
>
> `UnknownError: unknown error: cannot find Chrome binary`
>
> It means you need to install the Chrome browser. Yes this caught me off guard in a local VM once. Just so used to Chrome just being there.


## Loading test data into the Octopus Deploy server.
**Be careful** this part can destroy data. Make sure you are connecting to a test server and database. The `Load-Octopus.ps1` powershell script in `browser-tests\setup-scripts` will load the test data that the browser tests rely on.

Example call of load script (using the default values):
```
& .\Load-Octopus.ps1 `
    -OctopusRootUrl "http://localhost/" `
    -SqlServerInstance "SQLExpress" `
    -DatabaseName "Octopus" `
    -ServiceName "OctopusDeploy" `
    -OctopusAdminUsername "JoeAdministrator" `
    -OctopusAdminPassword "Password 123." `
    -GeneratedDataFilePath ".\gendata.json" `
    -DatabaseBackupFilePath "C:\Backups\OctopusInitial.bak" `
    -TentaclePath "C:\Program Files\Octopus Deploy\Tentacle\Tentacle.exe" `
    -ExportPath "C:\Backups\OctopusExport" `
    -MigratorPath "C:\Program Files\Octopus Deploy\Octopus\Octopus.Migrator.exe" `
    -InstanceName "OctopusServer
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
This will do a fresh install of SQL Server Express, Octopus Deploy server and Tentacle onto the machine. You typically want to use this on a virtual machine or the like. It installs [Chocolatey](https://chocolatey.org/) to install the other items.

> If you make changes to the installation you will need to use the same changes (port, instance,...) in the load script and tests.

You will need to provide a license file for use. Specify the path to it with the `-licenseFilePath` parameter to the script. You will also need to specify the `-version` of Octopus Deploy you want to install. See the Chocolatey packages for current versions available to install.

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
