pipeline {
    agent any

    environment {
        REPO_URL = "https://github.com/adityathakureka/web_test"
        REPO_BRANCH = "main"
        WORKSPACE_DIR = "C:\\ProgramData\\Jenkins\\.jenkins\\workspace\\web_test_deploy"
        EC2_USER = "ec2-user"
        EC2_HOST = "13.233.151.39"
        SSH_CREDENTIAL_ID = "ec2-user"
        REMOTE_DEPLOY_DIR = "/var/www/html"
        GIT_PATH = "C:\\Users\\1000684\\AppData\\Local\\Programs\\Git\\cmd\\git.exe"
    }

    stages {
        stage('Clone Repository') {
            steps {
                script {
                    echo 'Fetching latest code from GitHub...'
                    bat """
                        IF EXIST "${WORKSPACE_DIR}\\.git" (
                            cd /d "${WORKSPACE_DIR}"
                            "${GIT_PATH}" fetch --all
                            "${GIT_PATH}" reset --hard origin/${REPO_BRANCH}
                            "${GIT_PATH}" clean -fd
                            "${GIT_PATH}" checkout ${REPO_BRANCH}
                            "${GIT_PATH}" pull origin ${REPO_BRANCH} --force
                        ) ELSE (
                            rmdir /s /q "${WORKSPACE_DIR}"
                            "${GIT_PATH}" clone -b ${REPO_BRANCH} "${REPO_URL}" "${WORKSPACE_DIR}"
                        )
                        "${GIT_PATH}" log -1
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
                            icacls "%SSH_KEY%" /inheritance:r
                            icacls "%SSH_KEY%" /grant:r "%USERNAME%:F"

                            ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "sudo mkdir -p ${REMOTE_DEPLOY_DIR} && sudo rm -rf ${REMOTE_DEPLOY_DIR}/*"
                            scp -o StrictHostKeyChecking=no -i "%SSH_KEY%" -r "${WORKSPACE_DIR}\\build\\*" %EC2_USER%@%EC2_HOST%:${REMOTE_DEPLOY_DIR}/
                            ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "ls -lah ${REMOTE_DEPLOY_DIR}/"

                            ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "sudo systemctl restart nginx || sudo systemctl restart apache2 || pm2 restart all || echo 'No recognized web service found!'"
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deployment Successful!'
        }
        failure {
            echo '❌ Deployment Failed! Check logs for errors.'
        }
    }
}
