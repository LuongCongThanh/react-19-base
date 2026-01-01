#!/usr/bin/env node

/**
 * Script tạo feature mới với cấu trúc chuẩn
 * Usage: node scripts/create-feature.js <feature-name>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const featureName = process.argv[2];

if (!featureName) {
  console.error('❌ Feature name is required');
  console.log('Usage: node scripts/create-feature.js <feature-name>');
  process.exit(1);
}

// Validate feature name (lowercase, kebab-case)
if (!/^[a-z][a-z0-9-]*$/.test(featureName)) {
  console.error('❌ Feature name must be lowercase and kebab-case (e.g., user-profile)');
  process.exit(1);
}

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const toPascalCase = (str) => {
  return str
    .split('-')
    .map((word) => capitalize(word))
    .join('');
};

const basePath = path.join(__dirname, '..', 'src', 'features', featureName);

// Tạo các thư mục
const folders = ['api', 'components', 'pages', 'hooks', 'stores', 'types', 'validators', 'utils', 'constants'];

folders.forEach((folder) => {
  const folderPath = path.join(basePath, folder);
  fs.mkdirSync(folderPath, { recursive: true });
  console.log(`✅ Created folder: ${folder}`);
});

// Tạo file types
const typesContent = `// Request types
export interface ${toPascalCase(featureName)}Request {
  // Add request fields here
}

// Response types
export interface ${toPascalCase(featureName)}Response {
  // Add response fields here
}

// Entity types
export interface ${toPascalCase(featureName)} {
  id: string;
  // Add entity fields here
  createdAt: string;
  updatedAt: string;
}
`;

fs.writeFileSync(path.join(basePath, 'types', `${featureName}.types.ts`), typesContent);
console.log(`✅ Created file: types/${featureName}.types.ts`);

// Tạo file query keys
const queryKeysContent = `export const ${featureName.toUpperCase().replace(/-/g, '_')}_QUERY_KEYS = {
  root: ['${featureName}'] as const,

  list: () => [...${featureName.toUpperCase().replace(/-/g, '_')}_QUERY_KEYS.root, 'list'] as const,

  detail: (id: string) =>
    [...${featureName.toUpperCase().replace(/-/g, '_')}_QUERY_KEYS.root, 'detail', id] as const,
};
`;

fs.writeFileSync(path.join(basePath, 'constants', `${featureName}-query-keys.constants.ts`), queryKeysContent);
console.log(`✅ Created file: constants/${featureName}-query-keys.constants.ts`);

// Tạo file validator
const validatorContent = `import { z } from 'zod';

export const ${featureName}Schema = z.object({
  // Add validation rules here
});

export type ${toPascalCase(featureName)}FormData = z.infer<typeof ${featureName}Schema>;
`;

fs.writeFileSync(path.join(basePath, 'validators', `${featureName}.schema.ts`), validatorContent);
console.log(`✅ Created file: validators/${featureName}.schema.ts`);

// Tạo file page
const pageContent = `import { ${toPascalCase(featureName)}Form } from '../components/${toPascalCase(featureName)}Form';

export const ${toPascalCase(featureName)}Page = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">${toPascalCase(featureName)}</h1>
      <${toPascalCase(featureName)}Form />
    </div>
  );
};
`;

fs.writeFileSync(path.join(basePath, 'pages', `${toPascalCase(featureName)}Page.tsx`), pageContent);
console.log(`✅ Created file: pages/${toPascalCase(featureName)}Page.tsx`);

// Tạo file routes
const routesContent = `import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '@app/app.router';
import { ${toPascalCase(featureName)}Page } from './pages/${toPascalCase(featureName)}Page';

export const ${featureName.replace(/-/g, '')}Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/${featureName}',
  component: ${toPascalCase(featureName)}Page,
});
`;

fs.writeFileSync(path.join(basePath, `${featureName}.routes.tsx`), routesContent);
console.log(`✅ Created file: ${featureName}.routes.tsx`);

console.log(`\n✅ Feature "${featureName}" created successfully!`);
console.log(`\n📝 Next steps:`);
console.log(`1. Add routes to app.router.tsx`);
console.log(`2. Create API files in api/ folder`);
console.log(`3. Create hooks in hooks/ folder`);
console.log(`4. Create components in components/ folder`);
console.log(`\n📖 See: docs/guides/creating-feature.md for detailed guide`);
