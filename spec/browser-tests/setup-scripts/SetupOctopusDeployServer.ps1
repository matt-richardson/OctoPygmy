param(
    [Parameter(Mandatory=$true)]
    $licenseFilePath
)

$ErrorActionPreference = "STOP"

iwr https://chocolatey.org/install.ps1 -UseBasicParsing | iex

Import-Module C:\ProgramData\chocolatey\helpers\chocolateyProfile.psm1
Import-Module C:\ProgramData\chocolatey\helpers\chocolateyInstaller.psm1

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

Install-ChocolateyPackage `
    -PackageName 'OctopusDeploy.Tentacle' `
    -FileType 'msi' `
    -SilentArgs @('INSTALLLOCATION="C:\Program Files\Octopus Deploy\Tentacle"','/quiet') `
    -UseOnlyPackageSilentArguments `
    -Url 'https://download.octopusdeploy.com/octopus/Octopus.Tentacle.3.4.0.msi' `
    -Url64Bit 'https://download.octopusdeploy.com/octopus/Octopus.Tentacle.3.4.0-x64.msi' `
    -Checksum64 '4339B29B3B0A5BFA9EFB8AE7696724B2231AA45BC5EA89721D6BD2E56AF34EB0' `
    -ChecksumType64 'SHA256' `

Install-ChocolateyPackage `
    -PackageName 'OctopusDeploy' `
    -FileType 'msi' `
    -SilentArgs @('INSTALLLOCATION="C:\Program Files\Octopus Deploy\Octopus-3.4.9"','/quiet') `
    -UseOnlyPackageSilentArguments `
    -Url 'https://download.octopusdeploy.com/octopus/Octopus.3.4.9.msi' `
    -Url64bit 'https://download.octopusdeploy.com/octopus/Octopus.3.4.9-x64.msi' `
    -Checksum '891D2FC16D7AE8CDD0F4B02587EF9498BA689D6C09BF516906795EE77135C444' `
    -ChecksumType 'SHA256' `
    -Checksum64 'F90C94F07B7C85084FDC67F2AB7DC142615D97175098446063728EE4B2509FF6' `
    -ChecksumType64 'SHA256'

# Clear out registry settings to allow for multiple installations.
# NOTE: This is hacky, your registry will not reflect what is actually installed. The uninstaller won't work for both installations.
$installedProductKey = (Get-ChildItem HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Installer\UserData\S-1-5-18\Products -Recurse -Include InstallProperties | Where { $_.GetValue("DisplayName") -eq "Octopus Deploy Server" } | Select -ExpandProperty Name | Split-Path) -replace "HKEY_LOCAL_MACHINE","HKLM:"
$installGuid = $installedProductKey | Split-Path -Leaf

Remove-Item HKLM:\SOFTWARE\Octopus -Recurse -Force
Remove-Item -Path $installedProductKey -Recurse -Force
Remove-Item -Path HKLM:\Software\Classes\Installer\Products\$installGuid -Recurse -Force
Remove-Item -Path HKLM:\Software\Classes\Installer\Features\$installGuid -Recurse -Force

Get-ChildItem HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Installer\UserData\S-1-5-18\Components | Where { $_.GetValue($_.Property) -like "*Octopus*" } | Remove-Item -Recurse
Get-Item HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Installer\Folders `
    | Select -ExpandProperty Property `
    | Where { $_ -like "*Octopus*" } `
    | %{ Remove-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Installer\Folders -Name $_ }
Get-ChildItem HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall | Where { $_.GetValue("DisplayName") -eq "Octopus Deploy Server" } | Remove-Item -Recurse -Force

Install-ChocolateyPackage `
    -PackageName 'OctopusDeploy' `
    -FileType 'msi' `
    -SilentArgs @('INSTALLLOCATION="C:\Program Files\Octopus Deploy\Octopus-3.3.0"','/quiet') `
    -UseOnlyPackageSilentArguments `
    -Url 'https://download.octopusdeploy.com/octopus/Octopus.3.3.0.msi' `
    -Url64bit 'https://download.octopusdeploy.com/octopus/Octopus.3.3.0-x64.msi' `
    -Checksum64 '516435AFDA219286C104403E2FFFE2858C4DC4C2B2A2DB8F22A11BFD4A0CB5B7' `
    -ChecksumType64 'SHA256'

Write-Host "Configure Octopus Deploy Server instances"
$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
$bytes  = $utf8NoBOM.GetBytes((GC $licenseFilePath))
$licenseBase64 = [System.Convert]::ToBase64String($bytes)

$instances = @(@{
    server = "C:\Program Files\Octopus Deploy\Octopus-3.4.9\Octopus.Server.exe";
    name = "OctopusServer34";
    connectionString = "Server=.\SQLExpress;Database=Octopus34;Trusted_Connection=True;";
    serverPort = 8034;
    commsListenPort = 18034;
    username = "JoeAdministrator";
    password = "Password 123.";
},@{
    server = "C:\Program Files\Octopus Deploy\Octopus-3.3.0\Octopus.Server.exe";
    name = "OctopusServer33";
    connectionString = "Server=.\SQLExpress;Database=Octopus33;Trusted_Connection=True;";
    serverPort = 8033;
    commsListenPort = 18033;
    username = "JoeAdministrator";
    password = "Password 123.";
})

$instances | %{
    $instance = $_
    Write-Host "== Configuring $($instance.name) instance. " -BackgroundColor DarkCyan
    & $instance.server create-instance --console --instance $instance.name --config "C:\$($instance.name)\OctopusServer.config"
    & $instance.server configure --console --instance $instance.name `
        --home "C:\$($instance.name)" `
        --storageConnectionString $instance.connectionString `
        --upgradeCheck False `
        --upgradeCheckWithStatistics False `
        --webAuthenticationMode UsernamePassword `
        --webForceSSL False `
        --webListenPrefixes http://localhost:$($instance.serverPort) `
        --commsListenPort $instance.commsListenPort
    & $instance.server database --console --instance $instance.name --create --grant="NT AUTHORITY\SYSTEM"
    & $instance.server service --console --instance $instance.name --stop
    & $instance.server admin --console --instance $instance.name --username $instance.username --password $instance.password
    & $instance.server license --console --instance $instance.name --licenseBase64 $licenseBase64
    & $instance.server service --console --instance $instance.name --install --reconfigure --start
}

Write-Host "Done"