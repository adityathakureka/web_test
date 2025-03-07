pipeline {
    agent any

    environment {
        REPO_URL = "https://github.com/adityathakureka/web_test"
        REPO_BRANCH = "main"
        WORKSPACE_DIR = "C:\\ProgramData\\Jenkins\\.jenkins\\workspace\\web_test_deploy"
        EC2_USER = "ec2-user"
        EC2_HOST = "13.232.173.152"
        SSH_CREDENTIAL_ID = "ec2-user"
    }

    stages {
        stage('Clone or Pull Latest Code') {
            steps {
                script {
                    echo 'Fetching the latest code from GitHub...'
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

                        echo "Checking latest commit:"
                        git log -1
                    """
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    echo 'Installing dependencies...'
                    bat """
                        cd /d "${WORKSPACE_DIR}"
                        npm install
                    """
                }
            }
        }

        stage('Build React App') {
            steps {
                script {
                    echo 'Building the React application...'
                    bat """
                        cd /d "${WORKSPACE_DIR}"
                        rd /s /q build
                        npm run build

                        echo "Checking contents of build directory..."
                        dir "${WORKSPACE_DIR}\\build"
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
                            echo "Fixing SSH key permissions..."
                            icacls "%SSH_KEY%" /inheritance:r
                            icacls "%SSH_KEY%" /grant:r "User:F"

                            echo "Ensuring remote directory exists..."
                            ssh -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "sudo mkdir -p /var/www/html/ && sudo rm -rf /var/www/html/*"

                            echo "Transferring build files to EC2..."
                            scp -i "%SSH_KEY%" -r "${WORKSPACE_DIR}\\build\\*" %EC2_USER%@%EC2_HOST%:/var/www/html/

                            echo "Verifying files on EC2..."
                            ssh -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "ls -lah /var/www/html/"

                            echo "Restarting the web server..."
                            ssh -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "sudo systemctl restart nginx || sudo systemctl restart apache2 || pm2 restart all"
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
