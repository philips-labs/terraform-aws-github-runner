#!/bin/bash -x
exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

${pre_install}

# Install AWS CLI
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y \
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

# configure systemd for running service in users accounts
cat >/etc/systemd/user@UID.service <<-EOF

[Unit]
Description=User Manager for UID %i
After=user-runtime-dir@%i.service
Wants=user-runtime-dir@%i.service

[Service]
LimitNOFILE=infinity
LimitNPROC=infinity
User=%i
PAMName=systemd-user
Type=notify

[Install]
WantedBy=default.target

EOF

systemctl daemon-reload
systemctl enable user@UID.service
systemctl start user@UID.service

curl -fsSL https://get.docker.com/rootless >>/opt/rootless.sh && chmod 755 /opt/rootless.sh
su -l "$USER_NAME" -c /opt/rootless.sh

{
  echo
  echo "export XDG_RUNTIME_DIR=/run/user/$USER_ID"
  echo "export DOCKER_HOST=unix:///run/user/$USER_ID/docker.sock"
  echo "export PATH=/home/$USER_NAME/bin:$PATH"
  echo
} >> "/home/$USER_NAME/.profile"

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

cd /opt/actions-runner

${start_runner}
