cd /home/$USER_NAME
mkdir actions-runner && cd actions-runner

aws s3 cp ${s3_location_runner_distribution} actions-runner.tar.gz
tar xzf ./actions-runner.tar.gz
rm -rf actions-runner.tar.gz

${arm_patch}

os_id=$(awk -F= '/^ID/{print $2}' /etc/os-release)
if [[ "$os_id" =~ ^ubuntu.* ]]; then
    ./bin/installdependencies.sh
fi