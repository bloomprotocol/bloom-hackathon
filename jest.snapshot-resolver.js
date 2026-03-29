// This resolver organizes snapshots in a __snapshots__ directory at the project root
// This makes it easier to review all UI snapshots in one place

module.exports = {
  // resolves from test to snapshot path
  resolveSnapshotPath: (testPath, snapshotExtension) => {
    // Convert the test path to a snapshot path
    // Example: src/app/page.test.tsx -> __snapshots__/app/page.test.tsx.snap
    const snapshotPath = testPath
      .replace('/src/', '/__snapshots__/')
      .replace('/tests/', '/__snapshots__/tests/')
      + snapshotExtension;
    
    return snapshotPath;
  },

  // resolves from snapshot to test path
  resolveTestPath: (snapshotFilePath, snapshotExtension) => {
    // Convert the snapshot path back to test path
    const testPath = snapshotFilePath
      .replace('/__snapshots__/', '/src/')
      .replace('/__snapshots__/tests/', '/tests/')
      .slice(0, -snapshotExtension.length);
    
    return testPath;
  },

  // Example test path, used for preflight consistency check
  testPathForConsistencyCheck: 'src/example.test.js',
};