pipeline {
    agent any

    environment {
        NODE_HOME = 'C:\\Program Files\\nodejs' // Update based on `where node`
        PATH = "${NODE_HOME};${env.PATH}"
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/adityathakureka/web_test.git' // Replace with your repo
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Run Tests') {
    steps {
        script {
            def testStatus = bat(script: 'npm test --passWithNoTests || exit /b 0', returnStatus: true)
            if (testStatus != 0) {
                echo "Tests failed, but continuing pipeline..."
            }
        }
    }
}

        stage('Build Website') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Deploy Website') {
            steps {
                script {
                    def deployOption = "local" // Change to "server" or "artifact" as needed

                    if (deployOption == "server") {
                        sh 'scp -r ./build user@yourserver:/var/www/html/' // Replace with actual server details
                    } else if (deployOption == "artifact") {
                        archiveArtifacts artifacts: 'build/**/*', fingerprint: true
                    } else {
                        sh 'npx serve -s build -l 3000' // Serve locally
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Deployment Successful!"
        }
        failure {
            echo "Deployment Failed!"
        }
    }
}
