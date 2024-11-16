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
