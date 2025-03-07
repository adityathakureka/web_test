pipeline {
    agent any

    environment {
        REPO_URL = "https://github.com/adityathakureka/web_test"
        REPO_BRANCH = "main"
        WORKSPACE_DIR = "C:\\ProgramData\\Jenkins\\.jenkins\\workspace\\web_test_deploy"
        EC2_USER = "ec2-user"
        EC2_HOST = "65.0.122.131"
        SSH_CREDENTIAL_ID = "ec2-user"
    }

    stages {
        stage('Clone or Pull Latest Code') {
            steps {
                script {
                    echo 'Fetching the latest code from GitHub...'
                    bat """
                        IF EXIST "${WORKSPACE_DIR}" (
                            cd /d "${WORKSPACE_DIR}"
                            git reset --hard
                            git pull origin ${REPO_BRANCH}
                        ) ELSE (
                            git clone -b ${REPO_BRANCH} "${REPO_URL}" "${WORKSPACE_DIR}"
                        )
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
                            echo "Fixing SSH key permissions..."
                            icacls "%SSH_KEY%" /inheritance:r
                            icacls "%SSH_KEY%" /grant:r "User:F"

                            echo "Ensuring remote directory exists..."
                            ssh -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "sudo mkdir -p /var/www/html/ && sudo chown ec2-user:ec2-user /var/www/html/"

                            echo "Transferring build files to EC2..."
                            scp -i "%SSH_KEY%" -r "${WORKSPACE_DIR}\\build\\*" %EC2_USER%@%EC2_HOST%:/var/www/html/
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
