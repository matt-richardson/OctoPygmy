param(
    [Parameter(Mandatory=$true)]
    $octopusUrl,
    $octopusVersion = "local"
)

$ENV:OctopusPassword = "Password 123." # This is only used for testing. And on a install that has no real data. So there.

Write-Host "Running browser tests..."
$resultsPath = "results\browser-tests-local"
mkdir .\$resultsPath -force | Out-Null

$jasmineNode = ".\node_modules\.bin\jasmine-node"
if((Test-Path $jasmineNode -PathType Leaf) -eq $false)
{
    Write-Error "Jasmine Node not found. Remember to run 'npm install'."
    return
}
cp .\src C:\bluefin-extension -Recurse -Force
& $jasmineNode --captureExceptions --verbose spec/browser-tests --junitreport --output $resultsPath --config TestIdFilename ".\$resultsPath\test-ids.txt" --config OctopusUrl "$octopusUrl" --config OctopusVersion $octopusVersion --config BluefinVersion "current"
