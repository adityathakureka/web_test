pipeline {
    agent any
    
    environment {
        EC2_IP = '13.235.87.19'  // Replace with your EC2 Public IP
        SSH_KEY = 'C:\\Users\\1000684\\Downloads\\testing_key.pem' // Use full Windows path
        GIT_REPO = 'https://github.com/adityathakureka/web_test.git'
        REPO_DIR = 'C:\\Jenkins\\workspace\\web_test'
    }
    
    stages {
        stage('Clone Repository') {
            steps {
                script {
                    echo 'Cloning React app from GitHub...'
                    bat """
                    rmdir /s /q "%REPO_DIR%" || echo 'No existing repo to delete'
                    git clone -b main %GIT_REPO% "%REPO_DIR%"
                    """
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    echo 'Installing dependencies...'
                    bat """
                    cd "%REPO_DIR%"
                    npm install
                    """
                }
            }
        }

        stage('Build React App') {
            steps {
                script {
                    echo 'Building React app...'
                    bat """
                    cd "%REPO_DIR%"
                    npm run build
                    """
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                script {
                    echo 'Deploying to EC2...'
                    bat """
                    scp -i "%SSH_KEY%" -r "%REPO_DIR%\\build\\*" ec2-user@%EC2_IP%:/usr/share/nginx/html
                    ssh -i "%SSH_KEY%" ec2-user@%EC2_IP% "sudo systemctl restart nginx"
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
            echo '❌ Deployment failed! Check logs for errors.'
        }
    }
}
