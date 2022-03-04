#!/bin/bash -x
exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

${pre_install}

# Install AWS CLI
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    awscli \
    jq \
    curl \
    wget \
    git \
    uidmap \
    build-essential \
    unzip

USER_NAME=${runner_run_as}
useradd -m -s /bin/bash "$USER_NAME"
USER_ID=$(id -ru "$USER_NAME")

# uncomment following line to be able to debug and login as the user via ssm
# echo -e "test1234\ntest1234" | passwd $USER_NAME

# install and configure cloudwatch logging agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i -E ./amazon-cloudwatch-agent.deb
amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c ssm:${ssm_key_cloudwatch_agent_config}

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y docker-ce docker-ce-cli containerd.io docker-ce-rootless-extras

{
  echo
  echo "export XDG_RUNTIME_DIR=/run/user/$USER_ID"
  echo "export DOCKER_HOST=unix:///run/user/$USER_ID/docker.sock"
  echo "export PATH=/home/$USER_NAME/bin:$PATH"
  echo
} >> "/home/$USER_NAME/.profile"

systemctl stop docker
systemctl disable docker

# Run docker service by default
loginctl enable-linger "$USER_NAME"
su -l "$USER_NAME" -c "systemctl --user enable docker"

${install_runner}

# config runner for rootless docker
{
  echo
  echo "XDG_RUNTIME_DIR=/run/user/$USER_ID"
  echo "DOCKER_HOST=unix:///run/user/$USER_ID/docker.sock"
  echo "PATH=/home/$USER_NAME/bin:$PATH"
  echo
} >> /opt/actions-runner/.env

${post_install}

trap "{ echo 'failed to change directory'; exit 255; }" SIGINT SIGTERM ERR EXIT
pushd /opt/actions-runner || exit

${start_runner}

popd || exit
