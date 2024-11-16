function findAllTerraformDirs() {
  local ignores=""
  local hide_root=false
  local format="json"
  local args=("$@")

  # Parse arguments
  while [[ $# -gt 0 ]]; do
    case $1 in
      --ignores)
        shift
        while [[ $# -gt 0 && $1 != --* ]]; do
          ignores="$ignores -o -name '$1'"
          shift
        done
        ;;
      --hide-root)
        hide_root=true
        shift
        ;;
      --format)
        shift
        format=$1
        shift
        ;;
      *)
        shift
        ;;
    esac
  done


  find_command="find . -type d \( -name '.terraform*' -o -name 'deprecated*' $ignores \) -prune -o \
    -name '*.tf' \
    -not -path '*/.terraform/*' \
    -exec dirname {} \; | \
    sort | \
    uniq"


  if [ "$format" = "json" ]; then
    jq_filter='split("\n") | map(select(. != ""))'
    if [ "$hide_root" = true ]; then
      jq_filter='split("\n") | map(select(. != "" and . != "."))'
    fi
    find_command="$find_command | jq --raw-input --slurp '$jq_filter'"
  elif [ "$format" = "plain" ]; then
    if [ "$hide_root" = true ]; then
      find_command="$find_command | grep -v '^\\.$'"
    fi
  fi

  eval $find_command
}

findLambdaFunctions() {
  # lambdas are located in lambdas/functions
  # only the first level director should be resulted
  # output format plain or json, json is default, not other options needed

  local format="json"
  local args=("$@")
  while [[ $# -gt 0 ]]; do
    case $1 in
      --format)
        shift
        format=$1
        shift
        ;;
      *)
        shift
        ;;
    esac
  done

  find_command="find lambdas/functions -maxdepth 1 -type d | \
      sort | \
      uniq"

  if [ "$format" = "json" ]; then
    jq_filter='split("\n") | map(select(. != ""))'
    find_command="$find_command | jq --raw-input --slurp '$jq_filter'"
  fi

  eval $find_command
}
