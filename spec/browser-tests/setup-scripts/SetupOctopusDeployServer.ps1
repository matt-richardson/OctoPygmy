param(
    [Parameter(Mandatory=$true)]
    $licenseFilePath,
    [Parameter(Mandatory=$true)]
    $version
)

$workingDir = Split-Path $SCRIPT:MyInvocation.MyCommand.Path -Parent
CD $workingDir

try {

$ErrorActionPreference = "STOP"

if (Test-Path .\finished) { Remove-Item .\finished -Force }
if (Test-Path .\failed) { Remove-Item .\failed -Force }

if (!(Get-Command cinst -ErrorAction SilentlyContinue))
{
    iwr https://chocolatey.org/install.ps1 -UseBasicParsing | iex
}

#Write-Host "Loading chocolatey modules"
#Import-Module C:\ProgramData\chocolatey\helpers\chocolateyProfile.psm1
#Import-Module C:\ProgramData\chocolatey\helpers\chocolateyInstaller.psm1
<#
Install-ChocolateyPackage `
    -PackageName 'SQLServerExpress2014' `
    -FileType 'exe' `
    -SilentArgs "/IACCEPTSQLSERVERLICENSETERMS /Q /ACTION=install /INSTANCEID=SQLEXPRESS /INSTANCENAME=SQLEXPRESS /UPDATEENABLED=FALSE" `
    -Url 'https://download.microsoft.com/download/E/A/E/EAE6F7FC-767A-4038-A954-49B8B05D04EB/Express%2032BIT/SQLEXPR_x86_ENU.exe' `
    -Url64bit 'https://download.microsoft.com/download/E/A/E/EAE6F7FC-767A-4038-A954-49B8B05D04EB/Express%2064BIT/SQLEXPR_x64_ENU.exe' `
    -Checksum64 '8F712FAEFEE9CEF1D15494C9D6CF5AD3B45EC06D0B2C247F8384A221BAAADDA7' `
    -Checksumtype64 'SHA256' `
    -ValidExitCodes @(0,3010) `
    --allow-empty-checksums-secure
#>

cinst OctopusDeploy -version $version --yes --force
cinst OctopusDeploy.Tentacle -version $version --yes --force

Write-Host "Configure Octopus Deploy Server instance"

# Get license file bytes
$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
$bytes  = $utf8NoBOM.GetBytes((GC $licenseFilePath))
$licenseBase64 = [System.Convert]::ToBase64String($bytes)

$instance = @{
    name = "OctopusServer";
    server = "C:\Program Files\Octopus Deploy\Octopus\Octopus.Server.exe";
    connectionString = "Server=.;Database=Octopus;Trusted_Connection=True;";
    serverPort = 80;
    commsListenPort = 1800;
    username = "JoeAdministrator";
    password = "Password 123.";
    thumbprint = "";
}

Write-Host "== Configuring Octopus Deploy Server " -BackgroundColor DarkCyan
$ip = Get-NetIpAddress -PrefixOrigin "Dhcp" -AddressFamily "IPv4" | Select -ExpandProperty IpAddress

& $instance.server create-instance --console --instance $instance.name --config "C:\$($instance.name)\OctopusServer.config"
& $instance.server configure --console --instance $instance.name `
    --home "C:\$($instance.name)" `
    --storageConnectionString $instance.connectionString `
    --upgradeCheck False `
    --upgradeCheckWithStatistics False `
    --webAuthenticationMode UsernamePassword `
    --webListenPrefixes "http://localhost,http://$ip" `
    --webForceSSL False
& $instance.server database --console --instance $instance.name --create --grant="NT AUTHORITY\SYSTEM"
& $instance.server service --console --instance $instance.name --stop
& $instance.server admin --console --instance $instance.name --username $instance.username --password $instance.password
& $instance.server license --console --instance $instance.name --licenseBase64 $licenseBase64
& $instance.server service --console --instance $instance.name --install --reconfigure --start

Write-Host "  Get thumbprint for tentacle configuration later on"
$thumbprintResult = & $instance.server show-thumbprint --instance $instance.name
$instance.thumbprint = $thumbprintResult[-1] # Last line of command line output is the server thumbprint.

Write-Host "== Configuring the Tentacle"
$tentacle = "C:\Program Files\Octopus Deploy\Tentacle\Tentacle.exe" 
& $tentacle create-instance --console --instance "Tentacle" --config "C:\OctopusTentacle\Tentacle.config"
& $tentacle new-certificate --console --instance "Tentacle" --if-blank
& $tentacle configure --console --instance "Tentacle" --reset-trust
& $tentacle configure --console --instance "Tentacle" --home "C:\OctopusTentacle" --app "C:\OctopusTentacle\Applications" --port "10933" --noListen "False"
& $tentacle configure --console --instance "Tentacle" --trust $instance.thumbprint
& $tentacle service --console --instance "Tentacle" --install --start

Write-Host "Done"
"" | Out-File .\finished

} catch {
    $_ | Out-File .\failed
}