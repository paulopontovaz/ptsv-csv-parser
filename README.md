# ptsv-csv-parser

A CSV parser created as an exercise for applying JavaScript concepts.

This package is used for parsing a .csv file to a JSON structure specified by a class which must `extend` the `CsvDataObject` class. Both the `Parser` class and the `CsvDataObject` class are provided by this package. It is possible for each row parsed from the .csv to be an instance of a provided class. 
The provided class will have to: 
- Be passed in to the parser's constructor, 
- Extend from the `CsvDataObject` class,
- and implement its `getPropertyNames` function.

Please refer to the [Morning Train Challenge](https://github.com/paulopontovaz/morning-train-challenge) repository for an example of this package in action.

### Examples
Handling request from client receiving the CSV file:
```javascript

  require('dotenv').config()
  const express = require('express')
  const cors = require('cors')
  const fileUpload = require('express-fileupload')
  const config = require('./config')
  const PtsvCsv = require('ptsv-csv-parser')
  const Parser = PtsvCsv.Parser
  const Person = require('./classes/person')

  const app = express()

  app.use(cors())
  app.use(fileUpload());
  app.use('/uploads', express.static(__dirname + '/uploads'));

  app.post('/upload', (req, res) => {
    const csvFile = req.files.file
    const filePath = `${__dirname}\\uploads\\${csvFile.name}`

    //Downloading the file to the server 
    //so that the parser can have acess to it.
    csvFile.mv(filePath, error => {
      if (error)
        return res.status(500).send(error)

      const parser = new Parser(filePath, Person)
      parser.parseCsv()
        .then(response => {
          res.send(response)
        })
        .catch(response => {
          console.log(response)
          res.status(500).send(response)				
        })
    })
  })

  app.listen(config.port, () => {
    console.log('Server listening on port %s, Ctrl+C to stop', config.port)
  })
```
Class extending the `CsvDataObject` class:
```javascript
  const PtsvCsvParser = require('ptsv-csv-parser')
  const CsvDataObject = PtsvCsvParser.CsvDataObject

  module.exports = class Person extends CsvDataObject {
    constructor(firstName = null, lastName = null, age = null, email = null) {
      super()
      this.firstName = firstName
      this.lastName = lastName
      this.age = age
      this.email = email
    }

    //Implementing the method 'required' by the CsvDataObject class
    static getPropertyNames () {
      return ['firstName', 'lastName', 'age', 'email']
    }
  }
```
