# Build Configuration Guide

This project includes a comprehensive build configuration for different environments with optimizations for production deployments.

## Available Build Scripts

### Development
```bash
npm run dev                 # Start development server
```

### Production Builds
```bash
npm run build:prod         # Full production build with optimizations
npm run build:staging      # Staging build with some debug features
npm run build:debug        # Debug build with source maps
npm run build:analyze      # Production build with bundle analysis
```

### Utility Scripts
```bash
npm run setup:env          # Setup environment files
npm run clean              # Clean dist directory
npm run package            # Create zip package from dist
npm run lint               # Run ESLint
```

## Build Environments

### Production (`npm run build:prod`)
- **Minification**: Enabled with Terser
- **Source Maps**: Disabled
- **Selective Code Obfuscation**: Only data files, API services, utilities, and cache files
- **Console Removal**: All console.* calls removed
- **Bundle Splitting**: Vendor, MUI, and utility chunks
- **Compression**: Enabled
- **Analytics**: Enabled

### Staging (`npm run build:staging`)
- **Minification**: Enabled with Terser
- **Source Maps**: Enabled
- **Code Obfuscation**: Disabled
- **Console Removal**: Partial (keeps warnings/errors)
- **Bundle Splitting**: Enabled
- **Debug Logs**: Enabled

### Development (`npm run dev`)
- **Minification**: Disabled
- **Source Maps**: Inline
- **Code Obfuscation**: Disabled
- **Console Removal**: Disabled
- **Hot Reload**: Enabled

## Selective Obfuscation

In production builds, only specific sensitive files are obfuscated to protect critical data while keeping the UI components readable:

### Obfuscated Files:
- `src/Data/**/*` - All data files (course data, plans, etc.)
- `src/services/api/**/*` - API service files
- `src/utils/**/*` - Utility functions
- `src/cache/**/*` - Cache management files

### Not Obfuscated:
- `src/components/**/*` - React components (for easier debugging)
- `src/themes/**/*` - Theme files
- `src/types/**/*` - TypeScript type definitions
- `node_modules/**/*` - Third-party dependencies

This approach protects your sensitive data and business logic while keeping the UI layer maintainable.

## Environment Variables

The build system automatically creates environment files for each build mode:

### Production (`.env.production`)
```env
NODE_ENV=production
VITE_APP_ENV=production
VITE_API_BASE_URL=https://api.production.example.com
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_LOGS=false
```

### Staging (`.env.staging`)
```env
NODE_ENV=production
VITE_APP_ENV=staging
VITE_API_BASE_URL=https://api.staging.example.com
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_LOGS=true
```

## Build Optimizations

### Production Optimizations
1. **Tree Shaking**: Removes unused code
2. **Code Splitting**: Separates vendor and application code
3. **Selective Minification**: Minifies all code
4. **Selective Obfuscation**: Protects only sensitive data files
5. **Asset Optimization**: Optimizes images and other assets
6. **Console Removal**: Removes debug statements

### Bundle Analysis
Run `npm run build:analyze` to generate a bundle analysis report showing:
- Bundle size breakdown
- Dependency analysis
- Optimization opportunities

## Chrome Extension Specific

The build configuration is optimized for Chrome extensions:
- Manifest V3 support via `@crxjs/vite-plugin`
- Proper content script handling
- Extension-specific asset management
- CSP-compliant builds

## File Structure After Build

```
dist/
├── manifest.json           # Extension manifest
├── assets/
│   ├── vendor-[hash].js   # React, React-DOM
│   ├── mui-[hash].js      # Material-UI components
│   ├── utils-[hash].js    # Utility libraries (obfuscated)
│   └── main-[hash].js     # Application code
├── icons/                 # Extension icons
└── [other extension files]
```

## Deployment

### Production Deployment
1. Run `npm run build:prod`
2. The `dist.zip` file is automatically created
3. Upload `dist.zip` to Chrome Web Store

### Staging Deployment
1. Run `npm run build:staging`
2. Load unpacked extension from `dist/` folder
3. Test in staging environment

## Troubleshooting

### Build Fails
- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run lint`
- Clear cache: `npm run clean`

### Large Bundle Size
- Run `npm run build:analyze` to identify large dependencies
- Consider lazy loading for non-critical components
- Review imported libraries for tree-shaking opportunities

### Extension Loading Issues
- Verify manifest.json is valid
- Check console for CSP violations
- Ensure all required permissions are declared

### Obfuscation Issues
- If obfuscated files cause runtime errors, check the `include`/`exclude` patterns in `vite.config.ts`
- Consider reducing obfuscation settings for problematic files
- Test thoroughly in staging before production deployment

## Performance Monitoring

The production build includes:
- Bundle size reporting
- Compression analysis
- Build time metrics
- Dependency analysis

Monitor these metrics to maintain optimal performance. 