const fastCsv = require('fast-csv')
const camelCase = require('camelcase')
const CsvDataObject = require('./csv-data-object')

module.exports = class Parser {
    /*
            In the constructor, the filePath is necessary for the
        fast-csv to work. The second argument is the class definition
        which is necessary for decoupling the parser from exterior classes.
        Passing the class to the constructor allows the parseCsv function to
        instantiate objects from whatever class the user wants, parsing from
        the csv rows.
    */
    constructor(csvFilePath, parseObjectClass = null, hasHeaders = true) {
        this.csvFilePath = csvFilePath
        this.parseObjectClass = parseObjectClass
        this.hasHeaders = hasHeaders

        //Enforcing the inheritance from the CsvDataObjectClass
        if(parseObjectClass && !(parseObjectClass.prototype instanceof CsvDataObject))
            throw new Error("The class passed as argument to the Parser class constructor has to extend the CsvDataObject class")
    }

    parseCsv () {
        return new Promise((resolve, reject) => {
            let csvObjectList = [],
                propertyNames = null

            fastCsv.fromPath(this.csvFilePath, { headers: this.hasHeaders })
                .on('data', item => {
                    /*
                            If propertyNames is null, the first line read from the .csv will be the headers.
                        If propertyNames is NOT null, it means we have an object row (as opposed to a header 
                        row), so we proceed to add the element to the list.
                            Here we set the propertyNames array equal to a list of the headers formatted 
                        as camelCase.                        
                            These strings will be used to set the properties of the object to be added to the 
                        list.
                            It is only possible to use the property names if there is a header row in the .csv 
                        file. If there is NOT a header row, the parseObjectClass is NEEDED in order for the 
                        parsing to complete, otherwise there won't be any names for the properties of the 
                        objects in the list.
                    */
                    if(!propertyNames) {
                        if (this.parseObjectClass)
                            //Inserting an object passing a destructured item (the "...item" part) as argument. 
                            //Destructuring is a feature available for ES6 and newer versions of ECMA Script.
                            csvObjectList.push(new this.parseObjectClass(...item))
                        else if (this.hasHeaders)
                           propertyNames = item.map(header => camelCase(header))
                    } 
                    else if (!this.parseObjectClass){
                        /*
                            Here populate iteratively the item to be inserted in the array, using 
                            the "reduce" function.
                            -> "newItem" is the accumulator, initialized as an empty object
                            -> "propertyName" is a string using for setting the value of a 
                            property in newItem
                            -> "index" is the index of the propertyName in the headers array
                        */
                        csvObjectList.push(propertyNames.reduce((newItem, propertyName, index) => {
                            newItem[propertyName] = item[index]
                            return newItem
                        }, {}))
                    }
                    /*                      
                            With the setup above, no matter how many properties 
                        the item has, the object will still be instantiated correctly, considering 
                        the properties are in the right order coming from the .csv file.
                    */
                })
                .on('end', data => {
                    resolve(csvObjectList)
                })
                .on('error', data => {
                    reject(data)
                })
        })
    }
}
