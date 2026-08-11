pipeline {
    agent any

    environment {
        // Default Docker Hub user - change this or override in Jenkins configuration
        DOCKER_HUB_USER = 'codesbyshahzaib'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Lint') {
            steps {
                echo 'Running ESLint in Node.js container...'
                sh 'docker run --rm -v /opt/devops/jenkins_data/workspace/${JOB_NAME}/app:/usr/src/app -w /usr/src/app node:18-alpine sh -c "npm install && npm run lint"'
            }
        }

        stage('Test') {
            steps {
                echo 'Running Jest unit tests in Node.js container...'
                sh 'docker run --rm -v /opt/devops/jenkins_data/workspace/${JOB_NAME}/app:/usr/src/app -w /usr/src/app node:18-alpine sh -c "npm run test"'
            }
        }

        stage('SonarQube Analysis') {
            environment {
                scannerHome = tool 'sonar-scanner'
            }
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=node-app -Dsonar.projectName='Node Application' -Dsonar.sources=app -Dsonar.host.url=http://sonarqube:9000/sonar"
                }
            }
        }

        stage('Build Image') {
            steps {
                echo 'Building Node.js Docker Image...'
                sh 'docker build -t ${DOCKER_HUB_USER}/node-app:${BUILD_NUMBER} -t ${DOCKER_HUB_USER}/node-app:latest ./app'
            }
        }

        stage('Push Image') {
            steps {
                echo 'Logging in and pushing image to DockerHub...'
                // Assumes 'dockerhub-creds' is configured as Username/Password credential in Jenkins
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin'
                    sh 'docker push ${DOCKER_USER}/node-app:${BUILD_NUMBER}'
                    sh 'docker push ${DOCKER_USER}/node-app:latest'
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application via Ansible local execution...'
                sh 'ansible-playbook ansible/deploy_app.yml --extra-vars "dockerhub_user=${DOCKER_HUB_USER} image_tag=${BUILD_NUMBER}"'
            }
        }
    }

    post {
        always {
            echo 'Cleaning up built images to save disk space...'
            sh 'docker rmi ${DOCKER_HUB_USER}/node-app:${BUILD_NUMBER} || true'
        }
        success {
            echo 'CI/CD Pipeline finished successfully!'
        }
        failure {
            echo 'CI/CD failed!'
        }
    }
}
