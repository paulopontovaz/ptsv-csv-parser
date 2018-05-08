/* 
		This is a way of forcing the class that extends this one to implement the 'getPropertyNames' method, 
	similar to the use of an interface. Pure Javascript still doesn't have the "implements" keyword
	functionality in class declaration, so this was an alternative. 
*/
module.exports = class CsvDataObject {
	constructor(){}

	/* The implementation of this method has to return the names of the properties 
	of the class that extends this one in order to parse the .csv file rows to 
	objects of that class. */
	static getPropertyNames () {
		throw new Error("The method 'getPropertyNames' has to be implemented!")
	}
}