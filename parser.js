const fastCsv = require('fast-csv')

module.exports = class Parser {
    /*
            In the constructor, the filePath is necessary for the
        fast-csv to work. The second argument is the class definition
        which is necessary for decoupling the parser from exterior classes.
        Passing the class to the constructor allows the parseCsv function to
        instantiate objects from whatever class the user wants, parsing from
        the csv rows.
    */
    constructor(csvFilePath, parseObjectClass) {
        this.csvFilePath = csvFilePath
        this.parseObjectClass = parseObjectClass
    }

    parseCsv () {
        return new Promise((resolve, reject) => {
            const headers = this.parseObjectClass.getPropertyNames()
            let csvObjectList = []

            fastCsv.fromPath(this.csvFilePath, { headers: false })
                .on('data', row => {
                    /*
                        Inserting an object passing a destructured row as argument.
                        This way no matter how many properties the row item has the object 
                        will still be instantiated correctly, considering the properties are 
                        in the right order coming from the .csv file, compared to the class's 
                        constructor arguments. 
                        Destructuring is a feature available for ES6 and newer versions of ECMA Script.
                    */
                    csvObjectList.push(new this.parseObjectClass(...row))
                })
                .on('end', data => {
                    //Removing the item whose properties were set as the header names before returning.
                    resolve(csvObjectList.slice(1))
                })
                .on('error', data => {
                    reject(data)
                })
        })
    }
}
