#!/bin/bash

echo "Installing dependencies..."

cd client

# Install Lucide React icons
npm install lucide-react

# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest @vitest/ui jsdom

echo "✅ Dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Review the changes in Dashboard.jsx"
echo "2. Run 'npm test' to verify all tests pass"
echo "3. Start the development server with 'npm run dev'"
echo "4. Check ENHANCED_ACTIVITY_SUMMARY_README.md for detailed documentation"

cd ..
