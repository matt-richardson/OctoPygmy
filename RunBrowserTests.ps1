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

. .\Common.ps1
LoginToAzure $Username $Password $TenantId $SubscriptionName

Write-Host "Starting test VM..."
Start-AzureRMVM -ResourceGroupName $VMResourceGroupName -Name $VMName | Out-Null
$ip = Get-AzureRmPublicIpAddress -ResourceGroupName $VMResourceGroupName -Name $VMName
$octopusUrl = "http://" + $ip.IpAddress

try
{
    Write-Host "Getting extension verison number"
    $manifest = ConvertFrom-Json (GC .\src\manifest.json -raw)
    $bluefinVersion = $manifest.version

    $failed = 0
    $max = 15
    $octopusVersion = "0"
    do
    {
        try
        {
            Write-Host "Waiting for Octopus Deploy ($octopusUrl/api) to be ready ($failed of $max tries) $(Get-Date -format t)..."
            $response = Invoke-RestMethod -Uri "$octopusUrl/api" -Method GET -TimeoutSec 60
            Write-Host "Got a response at $(Get-Date -format t)"
            $response | Format-List *
            $octopusVersion = $response.Version
            break
        } catch 
        {
            Write-Host "    Failed: $($_.Exception.Message)"; 
            $failed++
            if ($_.Exception.Message.Contains("503"))
            {
                Start-Sleep -Seconds 55
            }
        }
    } while($failed -lt $max)

    if($failed -ge $max)
    {
        throw "Unable to connect to Octopus Deploy API. Requests timed out."
        exit 1
    }

    Write-Host "Running browser tests..."
    $resultsPath = "results\browser-tests-$octopusVersion"
    mkdir .\$resultsPath -force | Out-Null
    & .\node_modules\.bin\jasmine-node --captureExceptions --verbose spec/browser-tests --junitreport --output $resultsPath --config TestIdFilename ".\$resultsPath\test-ids.txt" --config OctopusUrl "$octopusUrl" --config OctopusVersion "$octopusVersion" --config BluefinVersion "$bluefinVersion"

    if ($LastExitCode -ne 0)
    {
        throw "Tests failed"
    }

    if ($ENV:APPVEYOR -eq "true")
    {
        Write-Host "Uploading browser test results..."
        $client = New-Object System.Net.WebClient
        dir .\$resultsPath\*.xml | %{ Write-Host "Uploading $_ to AppVeyor"; $client.UploadFile("https://ci.appveyor.com/api/testresults/junit/$($env:APPVEYOR_JOB_ID)", $_) }

        Write-Host "Adding test identifiers to build messages..."
        Add-AppveyorMessage -Message "Browser test result urls"
        $testIds = GC .\$resultsPath\test-ids.txt
        $testIds | %{ 
            $id = $_.Split("~")[0]
            $name = $_.Split("~")[1]
            Add-AppveyorMessage -Message "$name = https://saucelabs.com/beta/tests/$id/commands"
        }
    }
} catch {
    Write-Host "ERROR"
    $_ | Write-Error
    throw
} finally {
    Write-Host "Stopping test VM..."
    if((Test-Path ENV:LeaveVirtualMachineRunning)) {
        Write-Host "Leaving virtual machine running for manuall testing..."
    } else {
        Stop-AzureRMVM -ResourceGroupName $VMResourceGroupName -Name $VMName -Force | Out-Null
    }
}