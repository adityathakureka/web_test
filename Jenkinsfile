pipeline {
    agent any

    environment {
        REPO_URL = 'https://github.com/adityathakureka/web_test.git'
        REPO_BRANCH = 'main'
        WORKSPACE_DIR = 'C:\\Jenkins\\workspace\\web_test'
        BUILD_DIR = "${WORKSPACE_DIR}\\build"
        EC2_USER = 'ec2-user'
        EC2_HOST = '65.0.122.131'
        REMOTE_DIR = '/usr/share/nginx/html'
    }

    stages {
        stage('Clone or Pull Latest Code') {
            steps {
                script {
                    echo 'Fetching the latest code from GitHub...'
                    bat """
                        IF EXIST "${WORKSPACE_DIR}" (
                            cd /d "${WORKSPACE_DIR}" 
                            && git reset --hard
                            && git pull origin ${REPO_BRANCH}
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
                        && call npm ci
                    """
                }
            }
        }

        stage('Build React App') {
            steps {
                script {
                    echo 'Building React app...'
                    bat """
                        cd /d "${WORKSPACE_DIR}"
                        && call npm run build
                    """
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                script {
                    echo 'Deploying to EC2...'
                    withCredentials([sshUserPrivateKey(credentialsId: 'ec2-user', keyFileVariable: 'SSH_KEY')]) {
                        bat """
                            ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" ${EC2_USER}@${EC2_HOST} "sudo rm -rf ${REMOTE_DIR}/*"
                            scp -o StrictHostKeyChecking=no -i "%SSH_KEY%" -r ${BUILD_DIR}/* ${EC2_USER}@${EC2_HOST}:${REMOTE_DIR}
                            ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" ${EC2_USER}@${EC2_HOST} "sudo systemctl restart nginx"
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
