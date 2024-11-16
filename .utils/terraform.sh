#source "$(dirname "${BASH_SOURCE[0]}")/find.sh"
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/find.sh"

generateDummyLambdaZip() {
  lambdaDirs=($(findLambdaFunctions --format plain))
  echo ${lambdaDirs[@]}
  echo ----
  for lambdaDir in "${lambdaDirs[@]}"; do
    echo Generating dummy zip for $lambdaDir/$(basename $lambdaDir).zip
    touch "$lambdaDir/$(basename $lambdaDir).zip"
  done
}

tfLintModules() {
  examples=($( findAllTerraformDirs --ignores modules --hide-root --format plain))
  ignore_commands=""
  # example
  # tflint --ignore-module terraform-aws-modules/vpc/aws --ignore-module terraform-aws-modules/security-group/aws
  # otuput of find
#   ./examples/arm64
# ./examples/arm64/lambdas-download
# ./examples/base
# ./examples/default
# ./examples/ephemeral
# ./examples/lambdas-download
# ./examples/multi-runner
# ./examples/permissions-boundary
# ./examples/permissions-boundary/setup
# ./examples/prebuilt
# ./examples/termination-watcher
# ./examples/ubuntu
# ./examples/windows
# ./examples/windows/lambdas-download
  echo hi
  # for the ignore we need to strip ./ at the beginning
  for example in "${examples[@]}"; do
    ignore_commands="$ignore_commands --ignore-module=$example"
  done
  # run tflint
  echo tflint --recursive $ignore_commands --config "$(pwd)/.tflint.hcl"
}
