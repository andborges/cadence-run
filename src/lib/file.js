const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const WORK_FOLDER = './.flow-run';

const ensureWorkFolder = function () {
    if (!fs.existsSync(WORK_FOLDER)) {
        fs.mkdirSync(WORK_FOLDER);
    }
};

const prepareFile = function (network, file, params) {
    const flow = JSON.parse(fs.readFileSync('./flow.json'));

    let fileContent = fs.readFileSync(file).toString();

    if (params) {
        for (let i = 0; i < params.length; i++) {
            fileContent = fileContent.replace(new RegExp('#' + (i + 1), 'g'), params[i]);
        }
    }

    // Removing imports
    fileContent = fileContent.replace(/^import.*$/gm, '');

    // Adding imports from flow.json by network
    const contracts = Object.keys(flow.contracts);

    for (let i = 0; i < contracts.length; i++) {
        if (flow.contracts[contracts[i]].aliases[network]) {
            fileContent = `import ${contracts[i]} from ${
                flow.contracts[contracts[i]].aliases[network]
            }\n${fileContent}`;
        }
    }

    const filename = path.basename(file);
    const tempFile = `${WORK_FOLDER}/${uuidv4()}_${filename}`;

    ensureWorkFolder();

    fs.writeFileSync(tempFile, fileContent);

    return tempFile;
};

const getFlowJson = function () {
    return JSON.parse(fs.readFileSync('./flow.json'));
};

const saveFlowJson = function (flowJson) {
    fs.writeFileSync('./flow.json', JSON.stringify(flowJson, null, 2));
};

const cleanUp = function (file) {
    if (fs.existsSync(WORK_FOLDER)) {
        fs.rmSync(WORK_FOLDER, { recursive: true, force: true });
    }
};

module.exports = { prepareFile, getFlowJson, saveFlowJson, cleanUp };
