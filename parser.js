const fastCsv = require('fast-csv')
const camelCase = require('camelcase')
const CsvDataObject = require('./csv-data-object')

module.exports = class Parser {
    /*
            In the constructor, the filePath is necessary for the fast-csv to work. 
        The second argument is the class definition which is used for decoupling the 
        parser from exterior classes. Passing the class to the constructor allows the 
        "parseCsv" function to return a list of objects from whatever class the user 
        passes in. If a class is not  provided, the parser uses the first line of the 
        .csv as source of property names to use for instantiating the objects, but only 
        if "hasHeaders" is set to true. If there are no headers and there is no class set, 
        each item on the result list will be an array of values.
    */
    constructor(csvFilePath, hasHeaders = true, parseObjectClass = null) {
        this.csvFilePath = csvFilePath
        this.hasHeaders = typeof hasHeaders === "boolean" ?     //Guaranteeing that the value 
            hasHeaders : hasHeaders.toLowerCase() === "true"    //of hasHeaders is boolean
        this.parseObjectClass = parseObjectClass

        //Enforcing the inheritance from the CsvDataObjectClass, if a class was passed in.
        if(parseObjectClass && !(parseObjectClass.prototype instanceof CsvDataObject))
            throw new Error("The class passed as argument to the Parser class constructor has to extend the CsvDataObject class")
    }

    get csvFilePath() { return this._csvFilePath }
    set csvFilePath(value) { this._csvFilePath = value }

    get parseObjectClass() { return this._parseObjectClass }
    set parseObjectClass(value) { this._parseObjectClass = value }

    get hasHeaders() { return this._hasHeaders }
    set hasHeaders(value) {                            
        this._hasHeaders = typeof value === "boolean" ? //Guaranteeing that the value 
            value : value.toLowerCase() === "true"      //of hasHeaders is boolean
    }

    parseCsv () {
        return new Promise((resolve, reject) => {
            let csvObjectList = [],
                propertyNames = null            

            fastCsv.fromPath(this.csvFilePath)
                .on('data', item => {
                    if (this.parseObjectClass) {
                        /* If "parseObjectClass" was set, we simply instantiate an object through 
                        deconstruction (as in "...item"). */
                        item = new this.parseObjectClass(...item)
                    } 
                    else {
                        if (this.hasHeaders) {
                            if (propertyNames) {
                                /* Using "reduce" we can iterate over the "propertyNames" and mount an object,
                                obtaining its properties from the "item". */
                                item = propertyNames.reduce((mountedItem, propertyName, index) => {
                                    /* When the property does not have a corresponding header,
                                    the 'index' is used as an alias so that the property's name
                                    doesn't get set to an empty string */
                                    mountedItem[propertyName || index] = item[index]
                                    return mountedItem
                                }, {})                            
                            }                        
                            else //Obtain the property names from the .csv from the first row.
                                propertyNames = item.map(header => camelCase(header))                            
                        }                                              
                    }

                    /* When there is no source of property names (no headers) nor a class for item 
                    to have its properties set, then the item is pushed as is. */  
                    csvObjectList.push(item)
                })
                .on('end', data => {
                    /* If the csv has headers, the list has to remove the first element, which 
                    is the one whose values are the headers. */
                    const list = this.hasHeaders ? csvObjectList.slice(1) : csvObjectList
                    resolve(list)
                })
                .on('error', data => {
                    reject(data)
                })
        })
    }
}
