function ForceDisableAzureDataCollection()
{
    # Disable-AzureDataCollection still prompts user. So just set the property manually.
    mkdir "$ENV:AppData\Windows Azure Powershell" -Force | Out-Null
    "{'enableAzureDataCollection': false}" | Out-File -FilePath "$ENV:AppData\Windows Azure Powershell\AzureDataCollectionProfile.json"
}

function LoginToAzure()
{
    param(
        $Username,
        $Password,
        $TenantId,
        $SubscriptionName
    )
    Write-Host "Prepping credentials for Azure login..."
    $securePassword = ConvertTo-SecureString $Password -AsPlainText -Force;
    $credentials = New-Object System.Management.Automation.PSCredential($Username, $securePassword);
    Write-Host "Logging into Azure..."
    Add-AzureRmAccount -ServicePrincipal -Tenant $TenantId -Credential $credentials | Out-Null

    Write-Host "Selecting Azure subscription..."
    Get-AzureRmSubscription -SubscriptionName $SubscriptionName | Select-AzureRmSubscription | Out-Null
}

function UploadExtension()
{
    param(
        $StorageResourceGroupName,
        $StorageAccountName,
        $StorageContainerName
    )

    Write-Host "Uploading packed extension for use in browser testing..."
    Add-Type -A 'System.IO.Compression.FileSystem' | Out-Null
    if(Test-Path .\bluefin.zip) { Remove-Item .\bluefin.zip | Out-Null }
    [IO.Compression.ZipFile]::CreateFromDirectory((Resolve-Path(".\src")).Path, (Resolve-Path(".\")).Path + "\bluefin.zip") | Out-Null
    Set-AzureRmCurrentStorageAccount -StorageAccountName $StorageAccountName -ResourceGroupName $StorageResourceGroupName | Out-Null
    $blob = Set-AzureStorageBlobContent -File ".\bluefin.zip" -Container $StorageContainerName -Force

    Write-Host "Uploaded extension located at:"
    Write-Host $blob.ICloudBlob.uri.AbsoluteUri
    return $blob.ICloudBlob.uri.AbsoluteUri
}