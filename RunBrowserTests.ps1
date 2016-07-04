param(
    $Username,
    $Password,
    $TenantId,
    $SubscriptionName,
    $VMName,
    $VMResourceGroupName,
    $StorageResourceGroupName,
    $StorageAccountName,
    $StorageContainerName,
    $ExtensionFilename,
    $SauceLabsUsername,
    $SauceLabsAccessKey
)

$testsPassed = $true

# Disable-AzureDataCollection stil prompts user. So just set the property manually.
mkdir "$ENV:AppData\Windows Azure Powershell" -Force | Out-Null
"{'enableAzureDataCollection': false}" | Out-File -FilePath "$ENV:AppData\Windows Azure Powershell\AzureDataCollectionProfile.json"

Write-Host "Prepping credentials for Azure login..."
$securePassword = ConvertTo-SecureString $Password -AsPlainText -Force;
$credentials = New-Object System.Management.Automation.PSCredential($Username, $securePassword);
Write-Host "Logging into Azure..."
Add-AzureRmAccount -ServicePrincipal -Tenant $TenantId -Credential $credentials | Out-Null

Write-Host "Selecting Azure subscription..."
Get-AzureRmSubscription -SubscriptionName $SubscriptionName | Select-AzureRmSubscription | Out-Null

Write-Host "Starting test VM..."
$vm = Start-AzureRMVM -ResourceGroupName $VMResourceGroupName -Name $VMName | Out-Null
$ip = Get-AzureRmPublicIpAddress -ResourceGroupName $VMResourceGroupName -Name $VMName
$url = "http://" + $ip.IpAddress
$ENV:OctopusUrl = $url

Write-Host "Uploading packed extension for use in browser testing..."
Add-Type -A 'System.IO.Compression.FileSystem'
[IO.Compression.ZipFile]::CreateFromDirectory((Resolve-Path(".\src")).Path, (Resolve-Path(".\")).Path + "\bluefin.zip")
Set-AzureRmCurrentStorageAccount -StorageAccountName $StorageAccountName -ResourceGroupName $StorageResourceGroupName | Out-Null
$blob = Set-AzureStorageBlobContent -File ".\bluefin.zip" -Container $StorageContainerName -Force

Write-Host "Uploaded extension located at:"
Write-Host $blob.ICloudBlob.uri.AbsoluteUri
$ENV:ExtensionDownloadUrl = $blob.ICloudBlob.uri.AbsoluteUri

$failed = 0
$max = 60
do
{
    try
    {
        Write-Host "Waiting for Octopus Deploy ($url/api) to be ready ($failed of $max tries)..."
        Invoke-RestMethod -Uri "$url/api" -Method GET -TimeoutSec 10
        break
    } catch { $failed++ }
} while($failed -lt $max)

if($failed -ge $max)
{
    throw "Unable to connect to Octopus Deploy API. Requests timeed out."
    exit 1
}

Write-Host "Running browser tests..."
$ENV:TestIdFilename = "results\browser-test-ids.txt"
mkdir .\results\browser-tests -force | Out-Null
& .\node_modules\.bin\jasmine-node --captureExceptions --verbose spec/browser-tests --junitreport --output results\browser-tests
if ($LastExitCode -ne 0)
{
    $testsPassed = $false
}

if ($ENV:APPVEYOR -eq "true")
{
    Write-Host "Uploading browser test results..."
    $client = New-Object 'System.Net.WebClient'
    dir .\results\browser-tests\*.xml | %{ $client.UploadFile("https://ci.appveyor.com/api/testresults/junit/$($env:APPVEYOR_JOB_ID)", $_) }

    Write-Host "Adding test identifiers to build messages..."
    Add-AppveyorMessage -Message "Browser test result urls"
    $testIds = GC $ENV:TestIdFilename
    $testIds | %{ 
        $id = $_.Split("~")[0]
        $name = $_.Split("~")[1]
        Add-AppveyorMessage -Message "$name = https://saucelabs.com/beta/tests/$id/commands"
    }
}

Write-Host "Stopping test VM..."
Stop-AzureRMVM -ResourceGroupName $VMResourceGroupName -Name $VMName -Force | Out-Null

Write-Host "Done running"
return if($testsPassed -eq 0) { 0 } else { 1 }