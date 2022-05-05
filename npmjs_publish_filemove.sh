#!/bin/bash
cp -R ./dist/ ./npmjs_publish/dist/
cp -R ./src/ ./npmjs_publish/src/
cp ./README.md ./npmjs_publish/README.md
cp ./tsconfig.json ./npmjs_publish/tsconfig.json
cp ./config.schema.json ./npmjs_publish/config.schema.json
cp ./CHANGELOG.md ./npmjs_publish/CHANGELOG.md