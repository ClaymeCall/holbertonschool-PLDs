export function classifyReleaseChannel(version = '') {
  return /^v?\d+\.\d+\.\d+/.test(version) ? 'stable' : 'unknown';
}

export function releaseLabel(item) {
  return classifyReleaseChannel(item.version) === 'stable' ? 'RELEASE STABLE' : 'A SURVEILLER';
}
