## install the runner

$s3_location="${S3_LOCATION_RUNNER_DISTRIBUTION}"

if ( $null -eq $env:RUNNER_TARBALL_URL -and $null -eq $s3_location ) {
  Write-Output "Neither RUNNER_TARBALL_URL or s3_location are set"
  return
}

$file_name="actions-runner.zip"

Write-Host "Creating actions-runner directory for the GH Action installtion"
New-Item -ItemType Directory -Path C:\actions-runner ; Set-Location C:\actions-runner

if ( $null -ne $env:RUNNER_TARBALL_URL ) {
  Write-Output "Downloading the GH Action runner from $RUNNER_TARBALL_URL to $file_name"  
  Invoke-WebRequest -Uri $env:RUNNER_TARBALL_URL -OutFile $file_name
} else  {
  Write-Host  "Retrieving TOKEN from AWS API"
  $token=Invoke-RestMethod -Method PUT -Uri "http://169.254.169.254/latest/api/token" -Headers @{"X-aws-ec2-metadata-token-ttl-seconds" = "180"}
    
  $metadata=Invoke-RestMethod -Uri "http://169.254.169.254/latest/dynamic/instance-identity/document" -Headers @{"X-aws-ec2-metadata-token" = $token}

  $Region = $metadata.region
  Write-Host  "Reteieved REGION from AWS API ($Region)"

  Write-Output "Downloading the GH Action runner from s3 bucket $s3_location"
  aws s3 cp "$s3_location" "$file_name" --region "$region"  
}

Write-Host "Un-zip action runner"
Expand-Archive -Path $file_name -DestinationPath .

Write-Host "Delete zip file"
Remove-Item $file_name

