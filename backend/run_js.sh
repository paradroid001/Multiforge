#!/bin/sh
cd ../frontend
#node  -e "const litegraph = require('litegraph.js'); console.log(litegraph.LGraph);"
#node src/utils/runGraph.js
npx ts-node src/utils/runGraph.ts $1