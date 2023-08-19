const jsonDataArea = document.getElementById("json-data-area");
const csvDataArea = document.getElementById("csv-data-area");
const convertButton = document.getElementById("convert-json-button");
const clearDataButton = document.getElementById("clear-data-button");
const saveCsvButton = document.getElementById("save-csv-button");
const importJsonButton = document.getElementById("import-json-button");
const importCsvButton = document.getElementById("import-csv-button");

/**
 * 
 * @param {String} data
 * @returns {Void}
 */
const convert = (data, method) => {
    let parsedData;

    try {
        parsedData = method === 'json' ? JSON.parse(data) : csvToJson(data);
    } catch {
        let message;
        message = (data === null || data === ``) ? `No text entered.` : `Incorrectly formatted ${method.toUpperCase()}.`;
        alert(`Failed to parse ${method.toUpperCase()} data: ${message}`);
        csvDataArea.innerHTML = null;
    }

    if (method === 'csv') {
        jsonDataArea.value = parsedData;
        return;
    }

    const csvData = createCsvData(parsedData);
    let csvString = '';

    for (const row of csvData) {
        if (csvData.indexOf(row) !== csvData.length - 1) {
            csvString += `${row}\n`;
        }
        else {
            csvString += `${row}`;
        }
    }

    csvDataArea.value = csvString;
};

const csvToJson = csvData => {
    let obj = {};

    const rows = csvData.split("\n");
    const columns = rows[0].split(",").map((key) => { return key.replace(/"/g, "") });

    for (const column of columns) {
        obj[column] = [];
    }

    for (let i = 1; i < rows.length; i++) {
        let currentRow = rows[i].split(",");

        for (let j = 0; j < currentRow.length; j++) {
            if (currentRow[j] !== "") {
                obj[columns[j]].push(currentRow[j]);
            }
        }
    }

    for (const column in obj) {
        if (obj[column].length === 1) {
            obj[column] = obj[column][0];
            if (/^[0-9]$/.test(obj[column])) {
                obj[column] = parseInt(obj[column]);
            }
        }
    }

    const csvString = JSON.stringify(obj, null, 4);
    return csvString;
}

/**
 * 
 * @param {Object} jsonData 
 * @returns {Array.<Array.<String>>}
 */
const createCsvData = jsonData => {
    const keys = Object.keys(jsonData);
    const columns = keys.map((key) => { return `"${key}"` });
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
    jsonDataArea.value = null;
    csvDataArea.value = null;
}

convertButton.addEventListener("click", () => {
    if (jsonDataArea.value && csvDataArea.value) {
        alert(`Data detected in both JSON and CSV input fields. Please clear one before converting.`);
        return;
    }

    const method = (csvDataArea.value === null || csvDataArea.value === '') ? 'json' : 'csv';
    const data = method === 'json' ? jsonDataArea.value : csvDataArea.value;

    convert(data, method);
});

clearDataButton.addEventListener("click", () => {
    clearData();
});

const importData = async (dataType) => {
    // Opening and Saving files through the File System Access API
    // https://developer.chrome.com/articles/file-system-access/
    let fileHandle;

    try {
        [fileHandle] = await window.showOpenFilePicker();
        /**
         * https://w3c.github.io/FileAPI/ 
         * @returns {FileObject}
         */
        const jsonFile = await fileHandle.getFile();
        const fileExtension = jsonFile.name.split('.').pop();

        if (dataType === 'json') {
            if (!/^json$/.test(fileExtension) && !/^txt$/.test(fileExtension)) {
                alert('Not supported file extension detected. You can only import .json or .txt files.');
                return;
            }
        } else if (dataType === 'csv') {
            if (!/^csv$/.test(fileExtension) && !/^txt$/.test(fileExtension)) {
                alert('Not supported file extension detected. You can only import .csv or .txt files.');
                return;
            }
        }

        const data = await jsonFile.text();
        if (dataType === 'json') {
            jsonDataArea.value = data;
        } else if (dataType === 'csv') {
            csvDataArea.value = data;
        }

    } catch (error) {
        console.log(`The following error occured when trying to import the file:\n"${error}"`);
    }
};

importJsonButton.addEventListener("click", () => { importData("json") });
importCsvButton.addEventListener("click", () => { importData("csv") });


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
        if (csvDataArea.value === null || csvDataArea.value === "") {
            alert('No data output detected. Please ensure you have converted your JSON file correctly.');
            return;
        }
        const handle = await window.showSaveFilePicker(options);
        const csvFile = await handle.createWritable();
        await csvFile.write(csvDataArea.value);
        await csvFile.close();
    } catch (error) {
        console.log(`The following error occured when trying to save the file:\n"${error}"`);
    }
});