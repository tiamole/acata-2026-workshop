# Run on the Windows account used to deploy this workshop. No token is printed.
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'windows-credential.ps1')
$stored=[AcataCredentialStore]::Load($AcataCredentialTarget)
if(-not $stored){throw 'The workshop credential is not available in this Windows account. Use the account that deployed the service.'}
$secrets=$stored | ConvertFrom-Json
if(-not $secrets.ADMIN_TOKEN){throw 'The administrator credential is missing.'}
Set-Clipboard -Value $secrets.ADMIN_TOKEN
Write-Output 'Administrator token copied. Paste it into the facilitator dashboard sign-in. Keep it private; you can also save it in your own password manager.'
$stored=$null; $secrets=$null
