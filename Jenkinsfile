pipeline {
    agent any

    // Build parameters for customization (Bonus requirement)
    parameters {
        string(name: 'TAG', defaultValue: 'latest', description: 'Docker image tag')
        booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Skip tests (use with caution)')
    }

    environment {
        TAG = "${params.TAG}"
        COMPOSE_PROJECT_NAME = 'ecommerce'
        BUILD_SUCCESS = 'false'
        DEPLOY_SUCCESS = 'false'

        // Nexus endpoints (override in Jenkins job/env if needed)
        // IMPORTANT: if Jenkins runs in Docker, localhost points to the Jenkins container.
        // Use the Nexus container hostname on the shared Docker network.
        NEXUS_URL = "${env.NEXUS_URL ?: 'http://nexus:8081'}"
        NEXUS_DOCKER_REGISTRY = "${env.NEXUS_DOCKER_REGISTRY ?: 'localhost:8082'}"
    }

    // Trigger build automatically on Git changes
    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Fetching source code from repository...'
                checkout scm
            }
        }

        stage('Build Backend') {
            parallel {
                stage('Discovery Service') {
                    steps {
                        dir('Microservices/discovery') {
                            sh 'chmod +x mvnw && ./mvnw clean package -DskipTests'
                        }
                    }
                }
                stage('Gateway Service') {
                    steps {
                        dir('Microservices/gateway') {
                            sh 'chmod +x mvnw && ./mvnw clean package -DskipTests'
                        }
                    }
                }
                stage('User Service') {
                    steps {
                        dir('Microservices/user') {
                            sh 'chmod +x mvnw && ./mvnw clean package -DskipTests'
                        }
                    }
                }
                stage('Product Service') {
                    steps {
                        dir('Microservices/product') {
                            sh 'chmod +x mvnw && ./mvnw clean package -DskipTests'
                        }
                    }
                }
                stage('Media Service') {
                    steps {
                        dir('Microservices/media') {
                            sh 'chmod +x mvnw && ./mvnw clean package -DskipTests'
                        }
                    }
                }
                stage('Cart Service') {
                    steps {
                        dir('Microservices/cart') {
                            sh 'chmod +x mvnw && ./mvnw clean package -DskipTests'
                        }
                    }
                }
                stage('Order Service') {
                    steps {
                        dir('Microservices/order') {
                            sh 'chmod +x mvnw && ./mvnw clean package -DskipTests'
                        }
                    }
                }
            }
        }

        stage('Test Backend') {
            when {
                expression { !params.SKIP_TESTS }
            }
            parallel {
                stage('Test Discovery') {
                    steps {
                        dir('Microservices/discovery') {
                            sh './mvnw test'
                        }
                    }
                    post {
                        always {
                            junit testResults: 'Microservices/discovery/target/surefire-reports/*.xml', allowEmptyResults: true
                        }
                    }
                }
                stage('Test Gateway') {
                    steps {
                        dir('Microservices/gateway') {
                            sh './mvnw test'
                        }
                    }
                    post {
                        always {
                            junit testResults: 'Microservices/gateway/target/surefire-reports/*.xml', allowEmptyResults: true
                        }
                    }
                }
                stage('Test User') {
                    steps {
                        dir('Microservices/user') {
                            sh './mvnw test'
                        }
                    }
                    post {
                        always {
                            junit testResults: 'Microservices/user/target/surefire-reports/*.xml', allowEmptyResults: true
                        }
                    }
                }
                stage('Test Product') {
                    steps {
                        dir('Microservices/product') {
                            sh './mvnw test'
                        }
                    }
                    post {
                        always {
                            junit testResults: 'Microservices/product/target/surefire-reports/*.xml', allowEmptyResults: true
                        }
                    }
                }
                stage('Test Media') {
                    steps {
                        dir('Microservices/media') {
                            sh './mvnw test'
                        }
                    }
                    post {
                        always {
                            junit testResults: 'Microservices/media/target/surefire-reports/*.xml', allowEmptyResults: true
                        }
                    }
                }
                stage('Test Cart') {
                    steps {
                        dir('Microservices/cart') {
                            sh './mvnw test'
                        }
                    }
                    post {
                        always {
                            junit testResults: 'Microservices/cart/target/surefire-reports/*.xml', allowEmptyResults: true
                        }
                    }
                }
                stage('Test Order') {
                    steps {
                        dir('Microservices/order') {
                            sh './mvnw test'
                        }
                    }
                    post {
                        always {
                            junit testResults: 'Microservices/order/target/surefire-reports/*.xml', allowEmptyResults: true
                        }
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('Frontend-Application') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Test Frontend') {
            when {
                expression { !params.SKIP_TESTS }
            }
            steps {
                dir('Frontend-Application') {
                    sh 'npm test -- --no-watch'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building Docker images...'
                sh 'docker compose -p ecommerce build'
                script {
                    env.BUILD_SUCCESS = 'true'
                }
                slackSend channel: '#all-jenkins-test', tokenCredentialId: 'slack_token', botUser: true, color: 'good', message: "🔨 *BUILD SUCCESS*\n*Job:* ${env.JOB_NAME} #${BUILD_NUMBER}\n*Branch:* ${env.GIT_BRANCH ?: 'N/A'}\n*Commit:* ${env.GIT_COMMIT?.take(7) ?: 'N/A'}\n*Duration:* ${currentBuild.durationString.replace(' and counting', '')}\n<${env.BUILD_URL}|View Build>"
            }
        }

        stage('Deploy') {
            steps {
                echo 'Backing up current images for rollback...'
                sh '''
                    docker tag ecommerce-discovery:latest ecommerce-discovery:rollback || true
                    docker tag ecommerce-gateway:latest ecommerce-gateway:rollback || true
                    docker tag ecommerce-user:latest ecommerce-user:rollback || true
                    docker tag ecommerce-product:latest ecommerce-product:rollback || true
                    docker tag ecommerce-media:latest ecommerce-media:rollback || true
                    docker tag ecommerce-cart:latest ecommerce-cart:rollback || true
                    docker tag ecommerce-order:latest ecommerce-order:rollback || true
                    docker tag ecommerce-frontend:latest ecommerce-frontend:rollback || true
                '''
                echo 'Deploying application...'
                sh 'docker compose -p ecommerce down --remove-orphans || true'
                sh 'docker rm -f ecommerce-mongo ecommerce-discovery ecommerce-gateway ecommerce-user ecommerce-product ecommerce-media ecommerce-cart ecommerce-order ecommerce-frontend || true'
                sh 'docker network rm ecommerce_default || true'
                sh 'docker compose -p ecommerce up -d'
                sh 'sleep 30'
                script {
                    env.DEPLOY_SUCCESS = 'true'
                }
            }
            post {
                failure {
                    echo 'Deployment failed! Rolling back to previous version...'
                    sh '''
                        docker compose -p ecommerce down || true
                        docker tag ecommerce-discovery:rollback ecommerce-discovery:latest || true
                        docker tag ecommerce-gateway:rollback ecommerce-gateway:latest || true
                        docker tag ecommerce-user:rollback ecommerce-user:latest || true
                        docker tag ecommerce-product:rollback ecommerce-product:latest || true
                        docker tag ecommerce-media:rollback ecommerce-media:latest || true
                        docker tag ecommerce-cart:rollback ecommerce-cart:latest || true
                        docker tag ecommerce-order:rollback ecommerce-order:latest || true
                        docker tag ecommerce-frontend:rollback ecommerce-frontend:latest || true
                        docker compose -p ecommerce up -d || true
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                echo 'Verifying deployment...'
                sh 'docker ps --filter "name=ecommerce" --format "table {{.Names}}\t{{.Status}}"'
            }
        }

        stage('Nexus Connectivity Check') {
            steps {
                echo "Checking Nexus reachability at ${env.NEXUS_URL} ..."
                sh '''
                    set -e
                    if command -v curl >/dev/null 2>&1; then
                      curl -fsS "$NEXUS_URL/service/rest/v1/status" >/dev/null
                    else
                      wget -qO- "$NEXUS_URL/service/rest/v1/status" >/dev/null
                    fi
                '''
            }
        }

        stage('Publish Maven Artifacts to Nexus') {
            steps {
                echo 'Publishing Maven artifacts (deploy) to Nexus...'
                withCredentials([usernamePassword(credentialsId: 'nexus-maven-creds', usernameVariable: 'NEXUS_USERNAME', passwordVariable: 'NEXUS_PASSWORD')]) {
                    sh '''
                        set -e
                        export NEXUS_USERNAME="$NEXUS_USERNAME"
                        export NEXUS_PASSWORD="$NEXUS_PASSWORD"
                        export NEXUS_URL="$NEXUS_URL"

                        # Use the example settings template shipped with the repo
                        SETTINGS_FILE="$(pwd)/nexus/maven-settings.example.xml"

                        for svc in discovery gateway user product media cart order; do
                          echo "Deploying $svc..."
                          (cd Microservices/$svc && chmod +x mvnw && ./mvnw -s "$SETTINGS_FILE" -DskipTests -Dnexus.url="$NEXUS_URL" deploy)
                        done
                    '''
                }
            }
        }

        stage('Publish Docker Images to Nexus') {
            steps {
                echo 'Publishing Docker images to Nexus docker-hosted registry...'
                withCredentials([usernamePassword(credentialsId: 'nexus-docker-creds', usernameVariable: 'NEXUS_DOCKER_USERNAME', passwordVariable: 'NEXUS_DOCKER_PASSWORD')]) {
                    sh '''
                        set -e
                        # Docker may try HTTPS by default; explicitly use HTTP for the internal Nexus endpoint.
                        echo "$NEXUS_DOCKER_PASSWORD" | docker login "http://$NEXUS_DOCKER_REGISTRY" -u "$NEXUS_DOCKER_USERNAME" --password-stdin

                        IMAGES="ecommerce-discovery ecommerce-gateway ecommerce-user ecommerce-product ecommerce-media ecommerce-cart ecommerce-order ecommerce-frontend"

                        for img in $IMAGES; do
                          docker tag "$img:$TAG" "$NEXUS_DOCKER_REGISTRY/$img:$TAG"
                          docker push "$NEXUS_DOCKER_REGISTRY/$img:$TAG"
                        done
                    '''
                }
            }
        }

    }

    post {
        success {
            slackSend channel: '#all-jenkins-test', tokenCredentialId: 'slack_token', botUser: true, color: 'good', message: "🚀 *DEPLOY SUCCESS*\n*Job:* ${env.JOB_NAME} #${BUILD_NUMBER}\n*Branch:* ${env.GIT_BRANCH ?: 'N/A'}\n*Commit:* ${env.GIT_COMMIT?.take(7) ?: 'N/A'}\n*Duration:* ${currentBuild.durationString.replace(' and counting', '')}\n<${env.BUILD_URL}|View Build>"
        }
        failure {
            script {
                if (env.BUILD_SUCCESS == 'true') {
                    slackSend channel: '#all-jenkins-test', tokenCredentialId: 'slack_token', botUser: true, color: 'danger', message: "🚀 *DEPLOY FAILED*\n*Job:* ${env.JOB_NAME} #${BUILD_NUMBER}\n*Branch:* ${env.GIT_BRANCH ?: 'N/A'}\n*Commit:* ${env.GIT_COMMIT?.take(7) ?: 'N/A'}\n*Duration:* ${currentBuild.durationString.replace(' and counting', '')}\n*Failed Stage:* Deploy\n<${env.BUILD_URL}|View Build> | <${env.BUILD_URL}console|View Console>"
                } else {
                    slackSend channel: '#all-jenkins-test', tokenCredentialId: 'slack_token', botUser: true, color: 'danger', message: "🔨 *BUILD FAILED*\n*Job:* ${env.JOB_NAME} #${BUILD_NUMBER}\n*Branch:* ${env.GIT_BRANCH ?: 'N/A'}\n*Commit:* ${env.GIT_COMMIT?.take(7) ?: 'N/A'}\n*Duration:* ${currentBuild.durationString.replace(' and counting', '')}\n<${env.BUILD_URL}|View Build> | <${env.BUILD_URL}console|View Console>"
                }
            }
        }
        always {
            cleanWs(cleanWhenNotBuilt: false, deleteDirs: true, notFailBuild: true)
        }
    }
}
