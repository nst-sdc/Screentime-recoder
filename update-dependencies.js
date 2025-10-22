const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'client', 'package.json');

if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add/update devDependencies for testing
  packageJson.devDependencies = packageJson.devDependencies || {};
  
  const requiredDevDeps = {
    '@testing-library/react': '^13.4.0',
    '@testing-library/jest-dom': '^5.16.5',
    '@testing-library/user-event': '^14.4.3'
  };
  
  Object.entries(requiredDevDeps).forEach(([pkg, version]) => {
    if (!packageJson.devDependencies[pkg]) {
      packageJson.devDependencies[pkg] = version;
    }
  });
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✓ Updated package.json');
} else {
  console.log('⚠ package.json not found, skipping dependency update');
}
