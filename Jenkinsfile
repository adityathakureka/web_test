pipeline {
    agent any

    environment {
        SSH_KEY_PATH = 'C:/ProgramData/Jenkins/ssh_key/testing_key.pem'
        EC2_USER = 'ec2-user'
        EC2_HOST = '13.233.151.39'
        REMOTE_DEPLOY_DIR = '/var/www/html'
        WORKSPACE_DIR = "${WORKSPACE}"
    }

    stages {
        stage('Clone Repository') {
            steps {
                script {
                    echo 'Fetching latest code from GitHub...'
                    bat """
                        IF EXIST "${WORKSPACE_DIR}\\.git" (
                            cd /d "${WORKSPACE_DIR}"  
                            git fetch --all  
                            git reset --hard origin/main  
                            git clean -fd  
                            git checkout main  
                            git pull origin main --force 
                        ) ELSE (
                            rmdir /s /q "${WORKSPACE_DIR}"  
                            git clone -b main "https://github.com/adityathakureka/web_test" "${WORKSPACE_DIR}" 
                        )
                    """
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    echo 'Installing project dependencies...'
                    bat """
                        cd /d "${WORKSPACE_DIR}"
                        npm install --legacy-peer-deps
                    """
                }
            }
        }

        stage('Build React App') {
            steps {
                script {
                    echo 'Building React application...'
                    bat """
                        cd /d "${WORKSPACE_DIR}"
                        rd /s /q build
                        npm run build
                    """
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                script {
                    echo 'Deploying application to EC2...'
                    bat """
                        powershell -Command "& {
                            ssh -o StrictHostKeyChecking=no -i '${SSH_KEY_PATH}' ${EC2_USER}@${EC2_HOST} \"
                                sudo mkdir -p ${REMOTE_DEPLOY_DIR};
                                sudo chown -R ${EC2_USER}:${EC2_USER} ${REMOTE_DEPLOY_DIR};
                                sudo chmod -R 775 ${REMOTE_DEPLOY_DIR};
                                sudo rm -rf ${REMOTE_DEPLOY_DIR}/*;
                            \"
                        }"

                        powershell -Command "& {
                            scp -o StrictHostKeyChecking=no -i '${SSH_KEY_PATH}' -r '${WORKSPACE_DIR}/build/*' ${EC2_USER}@${EC2_HOST}:${REMOTE_DEPLOY_DIR}/
                        }"

                        powershell -Command "& {
                            ssh -o StrictHostKeyChecking=no -i '${SSH_KEY_PATH}' ${EC2_USER}@${EC2_HOST} \"
                                if id nginx >/dev/null 2>&1; then 
                                    sudo chown -R nginx:nginx ${REMOTE_DEPLOY_DIR}/; 
                                else 
                                    echo 'Nginx user not found, skipping chown'; 
                                fi

                                if systemctl list-units --type=service | grep nginx; then 
                                    sudo systemctl restart nginx; 
                                elif command -v pm2 >/dev/null 2>&1; then 
                                    pm2 restart all; 
                                else 
                                    echo 'No recognized web service found!'; 
                                fi
                            \"
                        }"
                    """
                }
            }
        }

        stage('Check Server IP') {
            steps {
                script {
                    echo 'Checking deployed server IP...'
                    bat """
                        ssh -o StrictHostKeyChecking=no -i "${SSH_KEY_PATH}" ${EC2_USER}@${EC2_HOST} "ls -la ${REMOTE_DEPLOY_DIR}"
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deployment successful!'
        }
        failure {
            echo '❌ Deployment Failed! Check logs for errors.'
        }
    }
}
