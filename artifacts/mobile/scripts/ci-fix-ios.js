// Run in CI after `expo prebuild` + `pod install`. Makes sure the generated iOS project
// has our bundle ID and a valid app icon, and prints what it found.
const fs = require('fs');
const path = require('path');

const BUNDLE_ID = 'com.natsimc.gamehost';
const iosDir = path.join(__dirname, '..', 'ios');
// Expo names the Xcode project after the app's name, so find it rather than hard-coding it.
const projDir = fs.readdirSync(iosDir).find(f => f.endsWith('.xcodeproj'));
if (!projDir) throw new Error('No .xcodeproj found in ' + iosDir);
const IOS_NAME = projDir.replace(/\.xcodeproj$/, '');
console.log('Xcode project:', IOS_NAME);
const appDir = path.join(iosDir, IOS_NAME);
const pbxPath = path.join(iosDir, projDir, 'project.pbxproj');
const iconSrc = path.join(__dirname, '..', 'assets', 'images', 'icon.png');
const iconSet = path.join(appDir, 'Images.xcassets', 'AppIcon.appiconset');

let pbx = fs.readFileSync(pbxPath, 'utf8');

// 1. Bundle ID
pbx = pbx.replace(/org\.name\.[A-Za-z0-9_-]+/g, BUNDLE_ID);

// 2. App icon asset set
fs.mkdirSync(iconSet, { recursive: true });
const iconDest = path.join(iconSet, 'App-Icon-1024x1024@1x.png');
if (!fs.existsSync(iconDest)) {
  fs.copyFileSync(iconSrc, iconDest);
  console.log('Created missing icon file');
}
fs.writeFileSync(
  path.join(iconSet, 'Contents.json'),
  JSON.stringify(
    {
      images: [{ filename: 'App-Icon-1024x1024@1x.png', idiom: 'universal', platform: 'ios', size: '1024x1024' }],
      info: { version: 1, author: 'expo' },
    },
    null,
    2
  )
);
const rootContents = path.join(appDir, 'Images.xcassets', 'Contents.json');
if (!fs.existsSync(rootContents)) {
  fs.writeFileSync(rootContents, JSON.stringify({ info: { version: 1, author: 'expo' } }, null, 2));
}

// 3. Make sure the app target compiles the AppIcon set (this is what adds CFBundleIconName)
if (!/ASSETCATALOG_COMPILER_APPICON_NAME/.test(pbx)) {
  pbx = pbx.replace(
    new RegExp(`(PRODUCT_BUNDLE_IDENTIFIER = "?${BUNDLE_ID.replace(/\./g, '\\.')}"?;)`, 'g'),
    '$1\n\t\t\t\tASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;'
  );
  console.log('Added ASSETCATALOG_COMPILER_APPICON_NAME');
}

fs.writeFileSync(pbxPath, pbx);

// 4. Report
console.log('--- Report ---');
console.log('Bundle ID lines:', pbx.match(/PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g));
console.log('Icon build setting lines:', (pbx.match(/ASSETCATALOG_COMPILER_APPICON_NAME = [^;]+;/g) || []).length);
console.log('xcassets referenced in project:', /Images\.xcassets/.test(pbx));
console.log('Icon file size:', fs.statSync(iconDest).size);
console.log('Info.plist has CFBundleIconName:', /CFBundleIconName/.test(fs.readFileSync(path.join(appDir, 'Info.plist'), 'utf8')));
