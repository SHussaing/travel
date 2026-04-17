pipeline {
    agent any

    options {
        timestamps()
        ansiColor('xterm')
    }

    parameters {
        string(name: 'TAG', defaultValue: 'latest', description: 'Docker image tag')
        booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Skip tests (use with caution)')
        booleanParam(name: 'SKIP_SONAR', defaultValue: false, description: 'Skip SonarQube analysis')
        booleanParam(name: 'DEPLOY', defaultValue: true, description: 'Deploy using docker compose on this Jenkins agent')
        booleanParam(name: 'BUILD_IMAGES', defaultValue: true, description: 'Build Docker images using docker compose')
    }

    environment {
        TAG = "${params.TAG}"
        COMPOSE_PROJECT_NAME = 'travel'

        // Sonar is expected to be configured in Jenkins (Manage Jenkins -> Configure System)
        // using the name below. If you named it differently, update this value.
        SONARQUBE_SERVER = "${env.SONARQUBE_SERVER ?: 'sonarqube'}"

        // Keep the JWT secret consistent across services/gateway in compose
        JWT_SECRET = "${env.JWT_SECRET ?: 'mySecretKeyForJWTTokenGenerationThatIsAtLeast256BitsLong12345678901234567890'}"
        JWT_EXPIRATION = "${env.JWT_EXPIRATION ?: '86400000'}"
    }

    triggers {
        pollSCM('H/10 * * * *')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Test Microservices') {
            steps {
                script {
                    def services = ['discovery','gateway','auth','user','travel','payment','graph']
                    for (svc in services) {
                        dir("Microservices/${svc}") {
                            sh 'chmod +x mvnw'
                            if (params.SKIP_TESTS) {
                                sh './mvnw -q clean package -DskipTests'
                            } else {
                                sh './mvnw -q clean verify'
                            }
                        }
                    }
                }
            }
            post {
                always {
                    junit testResults: 'Microservices/**/target/surefire-reports/*.xml', allowEmptyResults: true
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('Frontend-Application') {
                    sh 'npm ci'
                    sh 'npm run build'
                    // Keep frontend tests optional until headless browser is configured in CI.
                    script {
                        if (!params.SKIP_TESTS) {
                            echo 'Frontend tests are currently skipped unless configured for headless CI.'
                        }
                    }
                }
            }
        }

        stage('Tooling Check') {
            steps {
                sh '''
                    set -e
                    echo "Node: $(node -v 2>/dev/null || true)"
                    echo "NPM:  $(npm -v 2>/dev/null || true)"
                    echo "Java: $(java -version 2>&1 | head -n 1 || true)"
                    echo "Docker: $(docker --version 2>/dev/null || true)"
                    echo "Compose: $(docker compose version 2>/dev/null || true)"

                    if ! command -v sonar-scanner >/dev/null 2>&1; then
                      echo "sonar-scanner not found; installing locally into workspace..."
                      SCANNER_VERSION=6.2.1.4610
                      curl -fsSL -o sonar-scanner.zip \
                        "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SCANNER_VERSION}-linux-x64.zip"
                      unzip -q sonar-scanner.zip
                      mv "sonar-scanner-${SCANNER_VERSION}-linux-x64" .sonar-scanner
                      rm -f sonar-scanner.zip
                      export PATH="$PWD/.sonar-scanner/bin:$PATH"
                      echo "Installed sonar-scanner: $(sonar-scanner --version | head -n 1)"
                    else
                      echo "sonar-scanner: $(sonar-scanner --version | head -n 1)"
                    fi
                '''
            }
        }

        stage('SonarQube (Repo scan)') {
            when {
                expression { !params.SKIP_SONAR }
            }
            steps {
                // Run once at repo root so sonar-project.properties is used (it references Microservices/*/target/classes)
                withSonarQubeEnv("${SONARQUBE_SERVER}") {
                    sh '''
                        set -e
                        if [ -d .sonar-scanner ]; then
                          export PATH="$PWD/.sonar-scanner/bin:$PATH"
                        fi
                        sonar-scanner
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            when {
                expression { return params.BUILD_IMAGES }
            }
            steps {
                sh '''
                    set -e
                    export TAG="${TAG}"
                    export JWT_SECRET="${JWT_SECRET}"
                    export JWT_EXPIRATION="${JWT_EXPIRATION}"
                    docker compose -p ${COMPOSE_PROJECT_NAME} build
                '''
            }
        }

        stage('Deploy (docker compose)') {
            when {
                expression { return params.DEPLOY }
            }
            steps {
                sh '''
                    set -e
                    export TAG="${TAG}"
                    export JWT_SECRET="${JWT_SECRET}"
                    export JWT_EXPIRATION="${JWT_EXPIRATION}"

                    docker compose -p ${COMPOSE_PROJECT_NAME} down --remove-orphans || true
                    docker compose -p ${COMPOSE_PROJECT_NAME} up -d
                '''
            }
        }

        stage('Status') {
            when {
                expression { return params.DEPLOY }
            }
            steps {
                sh "docker compose -p ${COMPOSE_PROJECT_NAME} ps"
            }
        }
    }

    post {
        always {
            cleanWs(cleanWhenNotBuilt: false, deleteDirs: true, notFailBuild: true)
        }
    }
}
