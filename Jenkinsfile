node {
  def packageJson
  def workDir = "${WORKSPACE}/${env.BRANCH_NAME}-${env.BUILD_ID}"
  def nodeImage = 'node:14'
  def version
  def exceptionThrown = false
  try {
    ansiColor('xterm') {
      dir(workDir) {

        stage('Pull Runtime Image') {
          sh "docker pull ${nodeImage}"
        }

        docker.image(nodeImage).inside() {

          parallel (
            'env': {
              stage('Runtime Versions') {
                sh 'node --version'
                sh 'npm --version'
              }

              stage('Install PowerShell') {
                // Download the Microsoft repository GPG keys
                sh 'wget https://packages.microsoft.com/config/debian/10/packages-microsoft-prod.deb'
                // Register the Microsoft repository GPG keys
                sh 'dpkg -i packages-microsoft-prod.deb'
                // Update the list of products
                sh 'apt-get update'
                // Install PowerShell
                sh 'apt-get install -y powershell'
              }
            },
            'proj': {
              stage('Checkout') {
                checkout scm
              }

              stage('Install') {
                sh 'npm ci'
              }
            }
          )



          stage('Set Build Number') {
            packageJson = readJSON file: 'package.json'
            version = "${packageJson.version}+${env.BUILD_ID}"
            currentBuild.displayName = version

            def buildJsonFile = 'build.json'
            def buildJson = readJSON file: buildJsonFile
            buildJson.number = env.BUILD_ID
            writeJSON (
              json: buildJson,
              file: buildJsonFile,
              pretty: 2 // doesn't seem to work if single element in JSON object :(
            )
            sh 'npx prettier --write build.json' // TO prevent error from prettier during lint
          }

          parallel (
            'test': {

              stage('Lint') {
                sh 'npm run lint'
              }

              try {
                parallel (
                  'unit': {
                    stage('Unit Tests') {
                      try {
                        sh 'npm run test:unit:xml'
                      } catch (err) {
                        exceptionThrown = true
                        println 'Exception was caught in try block of unit tests stage.'
                        println err
                      } finally {
                        junit testResults: 'test-results/unit.xml', allowEmptyResults: true
                      }
                    }
                  },
                  'func': {
                    stage('Functional Tests') {
                      try {
                        sh 'npm run test:func:xml'
                      } catch (err) {
                        exceptionThrown = true
                        println 'Exception was caught in try block of func tests stage.'
                        println err
                      } finally {
                        junit testResults: 'test-results/func.xml', allowEmptyResults: true
                      }
                    }
                  }
                )
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
              }

              parallel (
                'e2e': {
                  stage('E2E Tests') {
                    try {
                      sh 'npm run test:e2e:xml'
                    } catch (err) {
                      exceptionThrown = true
                      println 'Exception was caught in try block of e2e tests stage.'
                      println err
                    } finally {
                      junit testResults: 'test-results/e2e.xml', allowEmptyResults: true
                      def e2eDebugLogs = 'test/e2e/.temp-work-dir/e2e-debug.txt'
                      if (fileExists(e2eDebugLogs)) {
                        archiveArtifacts artifacts: e2eDebugLogs
                      }
                    }
                  }
                },
                'upload': {
                  stage('Nexus Upload') {
                    if (env.BRANCH_NAME == 'master') {
                      def nexusOptions = [
                        url: 'http://host.docker.internal:8081',
                        credentials: 'NEXUS_CREDENTIALS',
                        repo: 'software-update-checker-cli',
                        org: 'suc',
                        version: version,
                      ]
                      dir('dist') {
                        uploadNexusArtifact(nexusOptions +
                          [ fileName: 'software-update-checker-win.exe' ]
                        )
                        uploadNexusArtifact(nexusOptions +
                          [ fileName: 'software-update-checker-linux' ]
                        )
                        uploadNexusArtifact(nexusOptions +
                          [ fileName: 'software-update-checker-macos' ]
                        )
                      }
                    }
                  }
                }
              )

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

def uploadNexusArtifact(Map params) {
    def url = params.url
    if (url.endsWith('/')) {
      url = url.substring(0, url.length - 1)
    }
    url += "/repository/${params.repo}/${params.org}/${params.repo}/${params.version}/${params.fileName}"

    httpRequest (
      httpMode: 'PUT',
      url: url,
      authentication: params.credentials,
      uploadFile: params.fileName,
      wrapAsMultipart: false
    )
}