echo "🔨 Building..."

minify ./src/background.js > ./bin/background.js
minify ./src/content.js > ./bin/content.js
cp ./src/manifest.json ./bin/manifest.json

echo "✨ Done!"
