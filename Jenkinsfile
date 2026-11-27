// KilosTravel - CI/CD pipeline (Jenkins + Docker)
//
// Jenkins job "kilostravel-pipeline" uses "Pipeline script from SCM": Jenkins
// reads this file from GitHub (F1).
//
// Needs on the Jenkins agent: Docker CLI + access to the Docker daemon, and the
// plugins Pipeline, Docker Pipeline, JUnit, Workspace Cleanup, Email Extension.
//
// Owners (see Trello): Kais = F1-F4, F6, F12, triggers, timeouts/retries,
// coverage, app + DB containers. Stages marked "TODO <name>" belong to a
// teammate and are left for them.

pipeline {
    agent any

    // Bonus: automatic trigger (poll GitHub every ~5 min + nightly build ~2 a.m.)
    triggers {
        pollSCM('H/5 * * * *')
        cron('H 2 * * *')
    }

    // Bonus: timeouts. A stuck build stops after 30 minutes.
    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
    }

    // TODO Amine (F5): parameters { choice(name: 'DEPLOY_ENV', ...) + 1 more }

    environment {
        PIP_DISABLE_PIP_VERSION_CHECK = '1'
        PIP_NO_CACHE_DIR = '1'
        COVERAGE_MIN = '70'

        // F7 - image name and tag: <version>.<build number>, never "latest".
        // The Docker Hub account is Amine's (see the "dockerhub-creds" credential).
        APP_VERSION = '1.0'
        IMAGE_REPO  = 'aminebougui/kilostravel-backend'
        IMAGE_TAG   = "${APP_VERSION}.${BUILD_NUMBER}"
    }

    stages {
        // F1 - code, tests, Dockerfile and Jenkinsfile come from Git
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git log -1 --oneline'
            }
        }

        // F2 - install the dependencies in a virtual environment
        stage('Build') {
            agent {
                docker { image 'python:3.11-slim'; reuseNode true; args '-e HOME=/tmp' }
            }
            steps {
                sh '''
                    rm -rf .venv build
                    python -m venv .venv
                    .venv/bin/pip install -r backend/requirements.txt
                    .venv/bin/python -m compileall -q backend/app
                    mkdir -p build/test-results build/coverage build/dist
                    # build output archived by F6: the app source as a versioned archive
                    tar -czf build/dist/kilostravel-backend-${BUILD_NUMBER}.tar.gz \
                        --exclude=__pycache__ --exclude=tests -C backend app requirements.txt
                '''
            }
        }

        // F3 - unit tests and HTTP tests side by side
        stage('Tests') {
            parallel {
                stage('Unit tests') {
                    agent {
                        docker { image 'python:3.11-slim'; reuseNode true; args '-e HOME=/tmp' }
                    }
                    steps {
                        dir('backend') {
                            script {
                                def status = sh(returnStatus: true, script: '''
                                    COVERAGE_FILE=../build/coverage/.coverage.unit \
                                    ../.venv/bin/pytest -m unit \
                                        --junitxml=../build/test-results/unit.xml \
                                        --cov=app --cov-report=
                                ''')
                                markTestResult('Unit tests', status)
                            }
                        }
                    }
                }
                stage('HTTP tests') {
                    agent {
                        docker { image 'python:3.11-slim'; reuseNode true; args '-e HOME=/tmp' }
                    }
                    steps {
                        script {
                            def status = sh(returnStatus: true, script: 'ci/run_http_tests.sh')
                            markTestResult('HTTP tests', status)
                        }
                    }
                }
            }
        }

        // Bonus: app + PostgreSQL in their own containers, HTTP tests against them
        stage('HTTP tests vs PostgreSQL') {
            environment {
                CI_TAG = "${env.BUILD_NUMBER}"
                COMPOSE = "docker compose -f ci/docker-compose.ci.yml -p kt-ci-${env.BUILD_NUMBER}"
            }
            steps {
                script {
                    def status = sh(returnStatus: true, script: '''
                        $COMPOSE up --build --abort-on-container-exit --exit-code-from tests
                    ''')
                    sh '''
                        mkdir -p build/test-results
                        docker cp "$($COMPOSE ps -aq tests)":/tmp/results/db.xml build/test-results/db.xml || true
                        $COMPOSE logs app > build/db-tests-app.log 2>&1 || true
                    '''
                    markTestResult('HTTP tests vs PostgreSQL', status)
                }
            }
            post {
                always {
                    sh '''
                        $COMPOSE down -v || true
                        docker image rm "kilostravel-backend:ci-$CI_TAG" || true
                    '''
                }
            }
        }

        // Bonus: coverage report, build turns yellow under 70 %
        stage('Coverage') {
            agent {
                docker { image 'python:3.11-slim'; reuseNode true; args '-e HOME=/tmp' }
            }
            steps {
                dir('backend') {
                    script {
                        sh '''
                            export COVERAGE_FILE=../build/coverage/.coverage
                            ../.venv/bin/coverage combine --keep ../build/coverage/
                            ../.venv/bin/coverage xml -o ../build/coverage/coverage.xml
                            ../.venv/bin/coverage html -d ../build/coverage/html
                        '''
                        def status = sh(returnStatus: true, script: '''
                            COVERAGE_FILE=../build/coverage/.coverage \
                            ../.venv/bin/coverage report --fail-under=$COVERAGE_MIN
                        ''')
                        if (status != 0) {
                            unstable("Coverage is under ${env.COVERAGE_MIN} %")
                        }
                    }
                }
            }
        }

        // ---- Docker stages: only when everything above is green (F4) ----

        stage('Docker image') {
            when { expression { currentBuild.currentResult == 'SUCCESS' } }
            steps {
                // F7 - production stage of backend/Dockerfile, tagged 1.0.<build>
                sh '''
                    docker build --target production \
                        --label org.opencontainers.image.version="$IMAGE_TAG" \
                        -t "$IMAGE_REPO:$IMAGE_TAG" backend
                    docker image ls "$IMAGE_REPO:$IMAGE_TAG"
                '''
            }
        }

        stage('Push to Docker Hub') {
            when { expression { currentBuild.currentResult == 'SUCCESS' } }
            steps {
                // Bonus (Kais): the push is retried 3 times and cannot hang.
                timeout(time: 10, unit: 'MINUTES') {
                    retry(3) {
                        // F8 - Read & Write token from the "dockerhub-creds" credential.
                        // Single quotes: the shell reads the token, Groovy never puts
                        // it in the command line, and Jenkins masks it in the log.
                        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                                                          usernameVariable: 'DH_USER',
                                                          passwordVariable: 'DH_TOKEN')]) {
                            sh '''
                                echo "$DH_TOKEN" | docker login -u "$DH_USER" --password-stdin
                                docker push "$IMAGE_REPO:$IMAGE_TAG"
                            '''
                        }
                    }
                }
            }
            post {
                // Log out even when the push fails, so no token stays on the host.
                // The image is kept: the staging and production stages use it.
                always { sh 'docker logout || true' }
            }
        }

        // TODO Amine (F9): Deploy to staging (port 8081) + smoke test:
        //   GET /health -> {"status": "healthy", ...}
        //   GET /api/v1/baggage/credit?flight_type=international&allowed_kg=23&actual_kg=18
        //       -> {"flight_type":"international","unused_kg":5.0,"credit_kg":7.5}
        // TODO Amine (F10): Production on port 8082 after input approval
    }

    post {
        always {
            // F4 - test reports in Jenkins (a failing test makes the build yellow)
            junit allowEmptyResults: true, testResults: 'build/test-results/*.xml'

            // F6 - build output + test reports, fingerprinted
            archiveArtifacts artifacts: 'build/dist/*.tar.gz, build/test-results/*.xml, build/coverage/coverage.xml, build/coverage/html/**, build/*.log',
                             allowEmptyArchive: true,
                             fingerprint: true

            // TODO Nesrine (F11): emailext to Mailpit on success and failure (before cleanWs)

            // F12 - empty workspace after every run (also on failure / abort)
            cleanWs()
        }
    }
}

// pytest exit codes: 0 = all passed, 1 = some tests failed, anything else = the
// tests could not run. Failed tests -> yellow build (UNSTABLE), Docker stages skipped.
def markTestResult(String name, int status) {
    if (status == 1) {
        unstable("${name}: some tests failed")
    } else if (status != 0) {
        error("${name}: tests could not run (exit code ${status})")
    }
}
