node {
  def packageJson
  def workDir = "${WORKSPACE}/${env.BRANCH_NAME}-${env.BUILD_ID}"
  def nodeImage = 'node:14'
  def exceptionThrown = false
  try {
    docker.image(nodeImage).inside() {
      dir(workDir) {

        stage('Prep') {
          checkout scm
          packageJson = readJSON file: 'package.json'

          def tag = "${packageJson.version}+${env.BUILD_ID}"
          dockerName = "${packageJson.name}--${env.BRANCH_NAME}--${tag}".toLowerCase().replace('.', '-')
          currentBuild.displayName = tag
          sh 'node --version'
          sh 'npm --version'
        }

        stage('Install') {
          sh 'npm ci'
        }

        stage('Lint') {
          sh 'npm run lint'
        }

        stage('Build') {
          sh 'npm run build'
        }

        stage('Package') {
          sh 'npm run pack'
          archiveArtifacts artifacts: 'dist/*', allowEmptyArchive: true
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
                sh 'sed -i -e \'s/<testcase\\(.*\\)classname="\\(.*\\)"/<testcase\\1classname="unit"/g\' test-results/unit.xml'
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
                sh 'sed -i -e \'s/<testcase\\(.*\\)classname="\\(.*\\)"/<testcase\\1classname="func"/g\' test-results/func.xml'
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