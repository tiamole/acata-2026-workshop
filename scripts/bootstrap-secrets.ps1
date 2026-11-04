param([Parameter(Mandatory=$true)][string]$NodePath)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'windows-credential.ps1')
$projectPath=Split-Path $PSScriptRoot
$stored=[AcataCredentialStore]::Load($AcataCredentialTarget)
if($stored) {
    $secretValues=$stored | ConvertFrom-Json
} else {
    $secretValues=[ordered]@{}
    $rng=[Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        foreach($key in @('ADMIN_TOKEN','ANALYTICS_SALT','RESEARCH_SALT','RATE_LIMIT_SALT')) {
            $bytes=New-Object byte[] 32
            $rng.GetBytes($bytes)
            $secretValues[$key]=([BitConverter]::ToString($bytes)).Replace('-','').ToLowerInvariant()
        }
    } finally { $rng.Dispose() }
    $stored=$secretValues | ConvertTo-Json -Compress
    [AcataCredentialStore]::Save($AcataCredentialTarget,$stored)
}
$json=$secretValues | ConvertTo-Json -Compress
$cliPath=Join-Path $projectPath 'node_modules/wrangler/bin/wrangler.js'
$configPath=Join-Path $projectPath 'backend/wrangler.jsonc'
$startInfo=[Diagnostics.ProcessStartInfo]::new()
$startInfo.FileName=(Resolve-Path -LiteralPath $NodePath).Path
$startInfo.Arguments='"'+$cliPath+'" secret bulk --config "'+$configPath+'"'
$startInfo.WorkingDirectory=$projectPath
$startInfo.UseShellExecute=$false
$startInfo.CreateNoWindow=$true
$startInfo.RedirectStandardInput=$true
$startInfo.RedirectStandardOutput=$true
$startInfo.RedirectStandardError=$true
$process=[Diagnostics.Process]::new()
$process.StartInfo=$startInfo
$null=$process.Start()
$outputTask=$process.StandardOutput.ReadToEndAsync()
$errorTask=$process.StandardError.ReadToEndAsync()
$process.StandardInput.Write($json)
$process.StandardInput.Close()
$process.WaitForExit()
$safeOutput=$outputTask.Result
$safeError=$errorTask.Result
if($process.ExitCode -ne 0){throw 'Cloudflare secret upload failed. The generated secrets remain protected in Windows Credential Manager; rerunning this script reuses them.'}
Write-Output 'Four service secrets configured in Cloudflare and retained securely in Windows Credential Manager. No secret values are written to source files or console output.'
$json=$null; $stored=$null; $secretValues=$null
$process.Dispose()
