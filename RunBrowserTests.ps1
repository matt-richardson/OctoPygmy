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
$securePassword = ConvertTo-SecureString $Password -AsPlainText -Force;
$credentials = New-Object System.Management.Automation.PSCredential($Username, $securePassword);
Write-Host "Logging into Azure..."
Add-AzureRmAccount -ServicePrincipal -Tenant $TenantId -Credential $credentials | Out-Null

Write-Host "Selecting Azure subscription..."
Get-AzureRmSubscription -SubscriptionName $SubscriptionName | Select-AzureRmSubscription | Out-Null

Write-Host "Starting test VM..."
#$vm = Start-AzureRMVM -ResourceGroupName $VMResourceGroupName -Name $VMName | Out-Null
#$ip = Get-AzureRmPublicIpAddress -ResourceGroupName $VMResourceGroupName -Name $VMName
#$url = "http://" + $ip.IpAddress

Write-Host "Uploading packed extension for use in browser testing..."
Set-AzureRmCurrentStorageAccount -StorageAccountName $StorageAccountName -ResourceGroupName $StorageResourceGroupName | Out-Null
$blob = Set-AzureStorageBlobContent -File $ExtensionFilename -Container $StorageContainerName -Force

Write-Host "Uploaded extension located at:"
Write-Host $blob.ICloudBlob.uri.AbsoluteUri

Write-Host "Running browser tests..."
& node.exe BrowserTests.js $SauceLabsUsername $SauceLabsAccessKey "http://40.79.39.241"

Write-Host "Stopping test VM..."
#Stop-AzureRMVM -ResourceGroupName $VMResourceGroupName -Name $VMName -Force | Out-Null

Write-Host "Done"
#>