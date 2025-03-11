pipeline {
    agent any

    environment {
        SSH_CREDENTIAL_ID = 'ec2-user'
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
                        IF EXIST "${WORKSPACE_DIR}\\\\.git" (
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
                    withCredentials([sshUserPrivateKey(credentialsId: SSH_CREDENTIAL_ID, keyFileVariable: 'SSH_KEY')]) {
                        bat """
                            takeown /F "%SSH_KEY%"
                            icacls "%SSH_KEY%" /inheritance:r /grant:r "%USERNAME%:F"
                            icacls "%SSH_KEY%" /grant:r "%USERNAME%:F"

                            ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "sudo mkdir -p ${REMOTE_DEPLOY_DIR} && sudo rm -rf ${REMOTE_DEPLOY_DIR}/*"

                            scp -o StrictHostKeyChecking=no -i "%SSH_KEY%" -r "${WORKSPACE_DIR}/build/*" %EC2_USER%@%EC2_HOST%:${REMOTE_DEPLOY_DIR}/

                            ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "if id nginx >/dev/null 2>&1; then sudo chown -R nginx:nginx ${REMOTE_DEPLOY_DIR}/; else echo 'Nginx user not found, skipping chown'; fi"

                            ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "sudo systemctl restart nginx || pm2 restart all || echo 'No recognized web service found!'"
                        """
                    }
                }
            }
        }

        stage('Check Server IP') {
            steps {
                script {
                    echo 'Checking deployed server IP...'
                    withCredentials([sshUserPrivateKey(credentialsId: SSH_CREDENTIAL_ID, keyFileVariable: 'SSH_KEY')]) {
                        bat """
                            ssh -o StrictHostKeyChecking=no -i "****" ec2-user@13.233.151.39 "sudo mkdir -p /var/www/html && sudo rm -rf /var/www/html/* && sudo chown -R ec2-user:ec2-user /var/www/html && sudo chmod -R 775 /var/www/html"
                        """
                    }
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
