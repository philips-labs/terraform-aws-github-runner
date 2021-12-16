# Action runners deployment windows example

This module shows how to create GitHub action runners using an Windows Runners. Lambda release will be downloaded from GitHub.

## Usages

Steps for the full setup, such as creating a GitHub app can be found in the root module's [README](../../README.md). First, download the Lambda releases from GitHub. Alternatively you can build the lambdas locally with Node or Docker, for which there is a build script available at `<root>/.ci/build.sh`. In the `main.tf` you can remove the location of the lambda zip files, the default location will work in this case.

> Ensure you have set the version in `lambdas-download/main.tf` for running the example. The version needs to be set to a GitHub release version, see <https://github.com/philips-labs/terraform-aws-github-runner/releases>


```pwsh
cd lambdas-download
terraform init
terraform apply
cd ..
```

Before running Terraform, ensure the GitHub app is configured.

```bash
terraform init
terraform apply
```

_**Note**_: It can take upwards of ten minutes for a runner to start processing jobs, and about as long for logs to start showing up. It's recommend that scale the runners via a warm-up job and then keep them idled.
