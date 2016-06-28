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
Write-Host "Prepping credentials for Azure login..."
Disable-AzureDataCollection
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

#Write-Host "Uploading packed extension for use in browser testing..."
#Set-AzureRmCurrentStorageAccount -StorageAccountName $StorageAccountName -ResourceGroupName $StorageResourceGroupName | Out-Null
#$blob = Set-AzureStorageBlobContent -File $ExtensionFilename -Container $StorageContainerName -Force

#Write-Host "Uploaded extension located at:"
#Write-Host $blob.ICloudBlob.uri.AbsoluteUri

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
& node node_modules/jasmine-node/lib/jasmine-node/cli.js --captureExceptions --verbose spec/browser-tests

Write-Host "Stopping test VM..."
Stop-AzureRMVM -ResourceGroupName $VMResourceGroupName -Name $VMName -Force | Out-Null

Write-Host "Done running"
