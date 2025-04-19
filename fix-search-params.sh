#!/bin/bash

# Find all TypeScript and TypeScript React files in src directory
find src -type f -name "*.ts" -o -name "*.tsx" | while read -r file; do
  # Replace direct useSearchParams import with our context hook
  sed -i '' 's/import { useSearchParams } from '\''next\/navigation'\''/import { useSearchParamsContext as useSearchParams } from '\''@\/components\/SearchParamsContent'\''/g' "$file"
  
  # Replace any remaining direct imports
  sed -i '' 's/import { \([^}]*\), useSearchParams\([^}]*\) } from '\''next\/navigation'\''/import { \1 } from '\''next\/navigation'\''\
import { useSearchParamsContext as useSearchParams } from '\''@\/components\/SearchParamsContent'\''/g' "$file"
done 