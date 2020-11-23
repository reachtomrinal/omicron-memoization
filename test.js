const memoization = require('./memoizaton');
const expect = require('chai').expect;

//var sinon = require('sinon');//replaced by lolex
var lolex = require("lolex");//lolex was recomended to fake timeouts instead of sinon
var clock;// = lolex.createClock();

//lolex.install modifies the default clock to be able to control it using the clock variable.
beforeEach(() => {clock = lolex.install()})
//clock uninstall restores the clock to the system default after finishing all tasks.
 afterEach(() => {clock = clock.uninstall()})

// hint: use https://sinonjs.org/releases/v6.1.5/fake-timers/ for faking timeouts
// used lolex instead of sinonjs becouse it was a recomendation of sinonjs to handle the clock

describe('memoization', function () {

    //Moved the declaration code outside the IT to avoid repeating in each IT.
    //Moved the memoized const outside IT to:
    //  keep the cache available trough all ITS
    //  Having the memoized const outside IT fixes the timeout to the default 1000.
    //  if it is required to be changed, a new memoization.memoize should be assigned to memoized
    //  with the desired timeout value.
    let returnValue = 5;
    const testFunction =  (key) => returnValue;
    let timeout = 1000; //default timeout
    const memoized = memoization.memoize(testFunction, (key) => key, timeout);

    it('should memoize function result', () =>{
        //const memoized = memoization.memoize(testFunction, (key) => key, timeout);
        expect(memoized('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(5);
        returnValue = 10;
        // TODO currently fails, should work after implementing the memoize function, it should also work with other
        // types then strings, if there are limitations to which types are possible please state them
        expect(memoized('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(5);
    });

    // TODO additional tests required
    /*
    Data type testing summary:
    typeof undefined // "undefined" => undefined type does not work with memoized   ***
    typeof 0 // "number"            => number type is memoized succesfully, see firt IT
    typeof true // "boolean"        => boolean type is memoized succesfully
    typeof "foo" // "string"        => string type is memoized succesfully
    typeof Symbol("id") // "symbol" => symbol type does not work with memoized      ***
    typeof Math // "object"  (1)    => object type is memoized succesfully
    typeof null // "object"  (2)    => object type null is memoized succesfully
    typeof alert // "function"  (3) => object type function is memozed succesfully
    */

    it('memoizing undefined [not-supported]', () =>{
        //const memoized = memoization.memoize(testFunction, (key) => key, timeout);
        returnValue = undefined;
        expect(memoized('c544d3ae-a72d-4755-8ce5-AAAAAAAAAAAA')).to.equal(undefined);
        returnValue = 'already-defined';
        //this line fails, becouse undefined is not memoized
        //expect(memoized('c544d3ae-a72d-4755-8ce5-AAAAAAAAAAAA')).to.equal(undefined);
    });

    it('memoizing booleans', () =>{
        //const memoized = memoization.memoize(testFunction, (key) => key, timeout);
        returnValue = true;
        expect(memoized('c544d3ae-a72d-4755-8ce5-BBBBBBBBBBBB')).to.equal(true);
        returnValue = false;
        expect(memoized('c544d3ae-a72d-4755-8ce5-BBBBBBBBBBBB')).to.equal(true);
    });

    it('memoizing strings', () =>{
        //const memoized = memoization.memoize(testFunction, (key) => key, timeout);
        returnValue = 'first';
        expect(memoized('c544d3ae-a72d-4755-8ce5-CCCCCCCCCCCC')).to.equal('first');
        returnValue = 'second';
        expect(memoized('c544d3ae-a72d-4755-8ce5-CCCCCCCCCCCC')).to.equal('first');
    });


    //memoizing symbols does not work
    it('memoizing symbols [not-supported]', () =>{
        //const memoized = memoization.memoize(testFunction, (key) => key, timeout);
        /*
        returnValue = Symbol(60);
        expect(memoized('c544d3ae-a72d-4755-8ce5-CCCCCCCCCCCC')).to.equal(Symbol(60));
        returnValue = Symbol(61);
        expect(memoized('c544d3ae-a72d-4755-8ce5-CCCCCCCCCCCC')).to.equal(Symbol(60));
        */
    });


    it('memoizing objects', () =>{
        //const memoized = memoization.memoize(testFunction, (key) => key, 1000);
        returnValue = Math;
        expect(memoized('c544d3ae-a72d-4755-8ce5-DDDDDDDDDDDD')).to.equal(Math);
        returnValue = null;
        expect(memoized('c544d3ae-a72d-4755-8ce5-DDDDDDDDDDDD')).to.equal(Math);

        expect(memoized('c544d3ae-a72d-4755-8ce5-HHHHHHHHHHHH')).to.equal(null);
    });

    it('memoizing functions', () =>{
        //const memoized = memoization.memoize(testFunction, (key) => key, 1000);
        returnValue = console.log;
        expect(memoized('c544d3ae-a72d-4755-8ce5-EEEEEEEEEEEE')).to.equal(console.log);
        returnValue = 123456;
        expect(memoized('c544d3ae-a72d-4755-8ce5-EEEEEEEEEEEE')).to.equal(console.log);
    });

    it('cache expiration and timeouts', () =>{
        //to change the timeout value the memoized const should be overwriten with a new isntance of memoization.memoize
        //the cache would be empty becouse of this
        //timeout = 10000; //uncomment to change timeout
        //const memoized = memoization.memoize(testFunction, (key) => key, timeout);//uncomment to change timeout
        returnValue = 'old_value';
        expect(memoized('c544d3ae-a72d-4755-8ce5-FFFFFFFFFFFF')).to.equal('old_value');
        returnValue = 'new_value';

        //console.log("faking clock");
        //Advancing the clock towards the future, to trigger cache expiration.
        //used to align the fake clock ticking with the fake Date used in memoization to check cache age.
        clock.setTimeout(function () {
            expect(memoized('c544d3ae-a72d-4755-8ce5-FFFFFFFFFFFF')).to.equal('old_value');
        }, 500);

        clock.tick(500);//advancing the clock 5000 millisecs, triggering first timeout

        clock.setTimeout(function () {
            expect(memoized('c544d3ae-a72d-4755-8ce5-FFFFFFFFFFFF')).to.equal('new_value');
        }, 15000);

        clock.tick(15000);//advancing the clock 15000 millisecs, triggering second timeout

    });

    it('Passing more complex functions', () =>{

        returnValue = 1000 * 60 * 60 * 24; //one day in milliseconds
        const testFunctionComplex =  (key) => {return returnValue/86400000;}
        const memoizedComplex = memoization.memoize(testFunctionComplex, (key) => key, timeout);


        expect(memoizedComplex('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(1);

        returnValue = 1000 * 60 * 60 * 24 * 2; //two days in milliseconds
        expect(memoizedComplex('c544d3ae-a72d-4755-8ce5-d25db415b776aa')).to.equal(2);
    });

});