enum ReleaseNoteType {
  Breaking = 'breaking',
  Features = 'features',
  Fixes = 'fixes',
}

interface Release {
  version: string
  description?: string
  breaking?: string[]
  features?: string[]
  fixes?: string[]
}

const notes: Release[] = [
  {
    version: '1.0.0',
    description: 'Initial public release.',
    features: [
      'Add a software configuration',
      'View configured software versions',
      'Edit a software configuration',
      'Remove a software configuration',
    ],
  },
  {
    version: '1.0.1',
    description: 'Depencency updates.',
    fixes: ['Addressed security vulnerabilities by updating dependencies (#62)'],
  },
  {
    version: '1.0.2',
    description: 'Unix improvements.',
    fixes: [
      'Improved handling of self-references (#66)',
      'Updated dependencies (#67)',
      'Version option no longer global (#68)',
    ],
  },
  {
    version: '1.0.3',
    description: 'Rename repository.',
    fixes: [
      'Renamed repository from "software-update-checker-cli" to just "software-update-checker" (#71)',
      'Updated dependencies (#72)',
    ],
  },
  {
    version: '1.0.4',
    description: 'Self-reference restriction relaxation',
    fixes: [
      'References to itself relaxes restrictions on error messages, making it more reliable (#74)',
      'Update dependencies (#75)',
    ],
  },
  {
    version: '1.0.5',
    description: 'Upgrade Node.js',
    fixes: ['Incremented Node.js version to 18 (#76)', 'Update dependencies (#77)'],
  },
]

export function getDescription({ version, build }: { version: string; build?: string }): string {
  const release: Release | undefined = notes.find((note) => note.version === version)
  if (!release) {
    throw Error(`The release notes do not contain a release for version "${version}": "${JSON.stringify(notes)}`)
  }
  let description = ''
  if (release.description) {
    description += `${release.description}\n\n---\n\n`
  }
  description += addReleaseNotesToDescription({
    release,
    type: ReleaseNoteType.Breaking,
  })
  description += addReleaseNotesToDescription({
    release,
    type: ReleaseNoteType.Features,
  })
  description += addReleaseNotesToDescription({
    release,
    type: ReleaseNoteType.Fixes,
  })
  if (build) {
    description += `---\n\nAdditional Information\n* Build: ${build}`
  }
  return description
}

function addReleaseNotesToDescription({ release, type }: { release: Release; type: ReleaseNoteType }): string {
  let description = ''
  const notes = release[type]
  if (notes && notes.length > 0) {
    if (type === ReleaseNoteType.Breaking) {
      description += '**Breaking Changes**\n'
    } else if (type === ReleaseNoteType.Features) {
      description += '**New Features**\n'
    } else if (type === ReleaseNoteType.Fixes) {
      description += '**Bug Fixes**\n'
    }
    for (const note of notes) {
      description += `* ${note}\n`
    }
    description += '\n'
  }
  return description
}
