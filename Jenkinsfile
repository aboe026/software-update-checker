node {
  def packageJson
  def workDir = "${WORKSPACE}/${env.BRANCH_NAME}-${env.BUILD_ID}"
  def nodeImage = 'node:14'
  def exceptionThrown = false
  try {
    ansiColor('xterm') {
      dir(workDir) {

        stage('Prep') {
          checkout scm
          packageJson = readJSON file: 'package.json'

          def tag = "${packageJson.version}+${env.BUILD_ID}"
          currentBuild.displayName = tag
          sh "docker pull ${nodeImage}"
        }

        docker.image(nodeImage).inside() {
          stage('Install') {
            sh 'apt-get install -y xmlstarlet'
            sh 'node --version'
            sh 'npm --version'
            sh 'npm ci'
          }

          parallel (
            'test': {

              stage('Lint') {
                sh 'npm run lint'
              }

              try {
                stage('Unit Tests') {
                  try {
                    sh 'npm run test:unit:xml'
                  } catch (err) {
                    exceptionThrown = true
                    println 'Exception was caught in try block of unit tests stage.'
                    println err
                  } finally {
                    if (fileExists('test-results/unit.xml')) {
                      sh 'xmlstarlet edit --inplace --update "/testsuites/testsuite/testcase/@classname" --expr "concat(\'unit.\', .)" test-results/unit.xml' // update package name for easier distinction between unit & functional tests in Jenkins UI
                    }
                    junit testResults: 'test-results/unit.xml', allowEmptyResults: true
                  }
                }

                stage('Functional Tests') {
                  try {
                    sh 'npm run test:func:xml'
                  } catch (err) {
                    exceptionThrown = true
                    println 'Exception was caught in try block of func tests stage.'
                    println err
                  } finally {
                    if (fileExists('test-results/func.xml')) {
                      sh 'xmlstarlet edit --inplace --update "/testsuites/testsuite/testcase/@classname" --expr "concat(\'func.\', .)" test-results/func.xml' // update package name for easier distinction between unit & functional tests in Jenkins UI
                    }
                    junit testResults: 'test-results/func.xml', allowEmptyResults: true
                  }
                }
              } catch (err) {
                println 'Exception caught while running unit and func tests:'
                println err
              } finally {
                stage('Coverage') {
                  sh 'npm run coverage:merge'
                  cobertura coberturaReportFile: 'coverage/merged/cobertura-coverage.xml'
                }
              }

            },
            'dist': {

              stage('Build') {
                sh 'npm run build'
              }

              stage('Package') {
                sh 'npm run pack'
                archiveArtifacts artifacts: 'dist/*', allowEmptyArchive: true
              }

            }
          )

        }
      }
    }
  } catch (err) {
    exceptionThrown = true
    println 'Exception was caught in try block of jenkins job.'
    println err
  } finally {
    stage('Cleanup') {
      try {
        sh "rm -rf ${workDir}"
      } catch (err) {
        println 'Exception deleting working directory'
        println err
      }
      try {
        sh "rm -rf ${workDir}@tmp"
      } catch (err) {
        println 'Exception deleting temporary working directory'
        println err
      }
      if (exceptionThrown) {
        error('Exception was thrown earlier')
      }
    }
  }
}