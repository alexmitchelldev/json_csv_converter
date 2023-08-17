const jsonInput = document.getElementById("json-data-input");
const csvOutput = document.getElementById("csv-data-output");
const convertButton = document.getElementById("convert-json-button");
const clearDataButton = document.getElementById("clear-data-button");

/**
 * 
 * @param {String} jsonData
 * @returns {Void}
 */
const convertJsonToCsv = jsonData => {
    let parsedJSON;

    try {
        parsedJSON = JSON.parse(jsonData);
    } catch {
        alert(`Failed to parse JSON data. Please check the text you have entered is correctly formatted JSON.`);
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

    csvOutput.innerHTML = csvString;
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

convertButton.addEventListener("click", () => {
    convertJsonToCsv(jsonInput.value);
})

const clearData = () => {
    jsonInput.value = null;
    csvOutput.innerHTML = null;
}

clearDataButton.addEventListener("click", () => {
    clearData();
})