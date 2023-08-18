const jsonInput = document.getElementById("json-data-input");
const csvOutput = document.getElementById("csv-data-output");
const convertButton = document.getElementById("convert-json-button");
const clearDataButton = document.getElementById("clear-data-button");
const saveCsvButton = document.getElementById("save-csv-button");
const importJsonButton = document.getElementById("import-json-button");

/**
 * 
 * @param {String} data
 * @returns {Void}
 */
const convert = (data, method) => {
    let parsedJSON;

    try {
        parsedJSON = JSON.parse(data);
    } catch {
        let message;
        message = (data === null || data === ``) ?  `No text entered.` : `Incorrectly formatted JSON.`;
        alert(`Failed to parse JSON data: ${message}`);
        csvOutput.innerHTML = null;
    }

    const csvData = createCsvData(parsedJSON);
    let csvString = '';

    for (const row of csvData) {
        if (csvData.indexOf(row) !== csvData.length - 1) {
            csvString += `${row}\n`;
        }
        else {
            csvString += `${row}`;
        }
    }

    csvOutput.value = csvString;
};

/**
 * 
 * @param {Object} jsonData 
 * @returns {Array.<Array.<String>>}
 */
const createCsvData = jsonData => {
    const keys = Object.keys(jsonData);
    const columns = keys.map((key) => { return `"${key}"`});
    const rows = getRows(jsonData);
    let csvData = [columns];
    
    
    const numRows = rows.length;
    let i;

    for (i = 0; i < numRows; i++) {
        csvData.push(rows[i]);
    }

    return csvData;
};

/**
 * 
 * @param {Object} parsedJSON 
 * @returns {Number}
 */
const getNumRows = parsedJSON => {
    let numRows = 1;

    for (const key in parsedJSON) {
        if (Array.isArray(parsedJSON[key]) && parsedJSON[key].length > numRows) {
            numRows = parsedJSON[key].length;
        } 
    }

    return numRows;
}

/**
 * 
 * @param {Number} numRows 
 * @param {Number} numColumns 
 * @returns {Array}
 */
const initRows = (numRows, numColumns) => {
    let rows = [];
    let i, j;
    
    for (i = 0; i < numRows; i++) {
        let row = [];
        for (j = 0; j < numColumns; j++) {
            row.push(null);
        }
        rows.push(row);
    }

    return rows;
}

/**
 * @param {Object} parsedJSON 
 * @returns {Array.<Array.<String>>}
 */
const getRows = parsedJSON => {
    const columns = Object.keys(parsedJSON);
    const numColumns = columns.length;
    const numRows = getNumRows(parsedJSON);
    let rows = initRows(numRows, numColumns);

    for (const column of columns) {
        if (Array.isArray(parsedJSON[column])) {
            parsedJSON[column].forEach((element, index) => {
                rows[index][columns.indexOf(column)] = element;
            });
        } else if (typeof parsedJSON[column] !== 'Object') {
            rows[0][columns.indexOf(column)] = parsedJSON[column];
        }
    }

    return rows;
};

const clearData = () => {
    jsonInput.value = null;
    csvOutput.innerHTML = null;
}

convertButton.addEventListener("click", () => {
    const method = csvOutput.value === null ? 'json' : 'csv';
    if (jsonInput.value && csvOutput.value) {
        alert(`Data detected in both JSON and CSV input fields. Please clear one before converting.`);
        return;
    }

    convert(jsonInput.value, method);
});

clearDataButton.addEventListener("click", () => {
    clearData();
});

// Opening and Saving files through the File System Access API
// https://developer.chrome.com/articles/file-system-access/
let fileHandle;
importJsonButton.addEventListener("click", async () => {
    try {
        [fileHandle] = await window.showOpenFilePicker();
    /**
     * https://w3c.github.io/FileAPI/ 
     * @returns {FileObject}
     */
    const jsonFile = await fileHandle.getFile();
    const fileExtension = jsonFile.name.split('.').pop();
    if (!/^json$/.test(fileExtension) && !/^txt$/.test(fileExtension)) {
        alert('Not supported file extension detected. You can only import .json or .txt files.');
        return;
    }
    const jsonData = await jsonFile.text();
    jsonInput.value = jsonData;
    
    } catch (error) {
        console.log(`The following error occured when trying to import the file:\n"${error}"`);
    }
})

saveCsvButton.addEventListener("click", async () => {
    const options = {
        suggestedName: 'JSON to CSV.csv',
        startIn: 'documents',
        types: [
            {
                description: 'JSON output to CSV',
                accept: {
                    'text/plain': ['.csv']
                }
            }
        ]
    }
    try {
        if (csvOutput.value === null || csvOutput.value === "") {
            alert('No data output detected. Please ensure you have converted your JSON file correctly.');
            return;
        }
        const handle = await window.showSaveFilePicker(options);
        const csvFile = await handle.createWritable();
        await csvFile.write(csvOutput.value);
        await csvFile.close();
    } catch (error) {
        console.log(`The following error occured when trying to save the file:\n"${error}"`);
    }
});