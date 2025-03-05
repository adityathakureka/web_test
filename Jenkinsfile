pipeline {
    agent any

    environment {
        GIT_REPO = 'https://github.com/adityathakureka/web_test.git' // Your GitHub repo
        BRANCH = 'main' // Change if using a different branch
        EC2_IP = '13.235.87.19'  // Replace with your EC2 Public IP
        SSH_KEY = 'C:\\Users\\1000684\\Downloads\\testing_key.pem' // Full Windows path to your SSH key
        REACT_APP_DIR = 'C:\\Jenkins\\workspace\\web_test' // Jenkins workspace directory
    }

    stages {
        stage('Clone Repository') {
            steps {
                script {
                    echo 'Cloning React app from GitHub...'
                    bat """
                    rmdir /s /q "$REACT_APP_DIR" || echo 'No existing repo to delete'
                    git clone -b $BRANCH $GIT_REPO "$REACT_APP_DIR"
                    """
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    echo 'Installing npm dependencies...'
                    bat """
                    cd "$REACT_APP_DIR"
                    npm install
                    """
                }
            }
        }

        stage('Build React App') {
            steps {
                script {
                    echo 'Building React App...'
                    bat """
                    cd "$REACT_APP_DIR"
                    npm run build
                    """
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                script {
                    echo 'Deploying build to EC2...'
                    bat """
                    scp -i "$SSH_KEY" -r "$REACT_APP_DIR\\build\\*" ec2-user@$EC2_IP:/usr/share/nginx/html
                    ssh -i "$SSH_KEY" ec2-user@$EC2_IP "sudo systemctl restart nginx"
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deployment successful! Your React app is live on EC2.'
        }
        failure {
            echo '❌ Deployment failed! Check logs for errors.'
        }
    }
}
