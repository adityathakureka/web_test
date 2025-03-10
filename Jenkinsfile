pipeline {
    agent any
    environment {
        REPO_URL = "https://github.com/adityathakureka/web_test"
        REPO_BRANCH = "main"
        WORKSPACE_DIR = "C:\\ProgramData\\Jenkins\\.jenkins\\workspace\\web_test_deploy"
        EC2_USER = "ec2-user"
        // Update to the correct IP address from the logs
        EC2_HOST = "13.233.151.39"
        SSH_CREDENTIAL_ID = "ec2-user"
        REMOTE_DEPLOY_DIR = "/var/www/html"
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
                            git reset --hard origin/${REPO_BRANCH}
                            git clean -fd
                            git checkout ${REPO_BRANCH}
                            git pull origin ${REPO_BRANCH} --force
                        ) ELSE (
                            rmdir /s /q "${WORKSPACE_DIR}"
                            git clone -b ${REPO_BRANCH} "${REPO_URL}" "${WORKSPACE_DIR}"
                        )
                        git log -1
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
                        echo "REACT_APP_BUILD_TIME=%DATE%_%TIME%" > build\\build-info.txt
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
                            icacls "%SSH_KEY%" /inheritance:r
                            icacls "%SSH_KEY%" /grant:r "User:F"
                            REM Clear target directory with proper permissions
                            ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "sudo mkdir -p ${REMOTE_DEPLOY_DIR} && sudo rm -rf ${REMOTE_DEPLOY_DIR}/*"
                            REM Deploy files
                            scp -o StrictHostKeyChecking=no -i "%SSH_KEY%" -r "${WORKSPACE_DIR}\\build\\*" %EC2_USER%@%EC2_HOST%:${REMOTE_DEPLOY_DIR}/
                            REM Fix permissions on files
                            ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "sudo chown -R nginx:nginx ${REMOTE_DEPLOY_DIR} || sudo chown -R apache:apache ${REMOTE_DEPLOY_DIR} || sudo chown -R www-data:www-data ${REMOTE_DEPLOY_DIR}"
                            REM Create simple cache-busting mechanism
                            ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "echo '# Cache busting timestamp: %DATE%_%TIME%' | sudo tee -a ${REMOTE_DEPLOY_DIR}/index.html > /dev/null"
                            REM Verify deployment
                            ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "ls -lah ${REMOTE_DEPLOY_DIR}/"
                            REM Restart web services with verification
                            ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "sudo systemctl restart nginx && echo 'Nginx restarted successfully' || sudo systemctl restart apache2 && echo 'Apache restarted successfully' || pm2 restart all && echo 'PM2 restarted successfully' || echo 'No recognized web service found!'"
                            REM Verify service status
                            ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "sudo systemctl status nginx || sudo systemctl status apache2 || pm2 status"
                            REM Check website accessibility
                            ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "curl -I http://localhost || curl -I http://127.0.0.1"
                        """
                    }
                }
            }
        }
        stage('Verify Deployment') {
            steps {
                script {
                    echo 'Verifying deployment...'
                    withCredentials([sshUserPrivateKey(credentialsId: SSH_CREDENTIAL_ID, keyFileVariable: 'SSH_KEY')]) {
                        bat """
                            ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "cat ${REMOTE_DEPLOY_DIR}/build-info.txt || echo 'Build info not found'"
                            ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "grep -r 'Cache busting' ${REMOTE_DEPLOY_DIR} || echo 'Cache busting marker not found'"
                        """
                    }
                }
            }
        }
    }
    post {
        success {
            echo '✅ Deployment Successful! Please hard refresh your browser (Ctrl+F5 or Cmd+Shift+R) to see changes.'
        }
        failure {
            echo '❌ Deployment Failed! Check logs for errors.'
        }
    }
}
