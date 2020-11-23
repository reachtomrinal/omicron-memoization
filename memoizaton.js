/**
 * Creates a function that memoizes the result of func. If resolver is provided,
 * it determines the cache key for storing the result based on the arguments provided to the memorized function.
 * By default, the first argument provided to the memorized function is used as the map cache key. The memorized values
 * timeout after the timeout exceeds. The timeout is in defined in milliseconds.
 *
 * Example:
 * function addToTime(year, month, day) {
 *  return Date.now() + Date(year, month, day);
 * }
 *
 * const memoized = memoization.memoize(addToTime, (year, month, day) => year + month + day, 5000)
 *
 * // call the provided function cache the result and return the value
 * const result = memoized(1, 11, 26); // result = 1534252012350
 *
 * // because there was no timeout this call should return the memorized value from the first call
 * const secondResult = memoized(1, 11, 26); // secondResult = 1534252012350
 *
 * // after 5000 ms the value is not valid anymore and the original function should be called again
 * const thirdResult = memoized(1, 11, 26); // thirdResult = 1534252159271
 *
 * @param func      the function for which the return values should be cached
 * @param resolver  if provided gets called for each function call with the exact same set of parameters as the
 *                  original function, the resolver function should provide the memoization key.
 * @param timeout   timeout for cached values in milliseconds
 */
function memoize(func, resolver, timeout) {
    // TODO implement the memoize function
   //    return func;

    let debug = false;//set debug = true to view console messages.

    var cached_value = []; //variable that storages the cached value
    var cached_time = []; //variable that storages the cached value age

    //returning and anonymous function allows us to keep state
    return function (resolver)
    {
        var key = resolver;
        if(debug){console.log("[NEW CALL]: "+key+" : "+timeout+"ms");console.log(func());}

        if(cached_value[key])//check whether the key exists in the cache
        {
            //Key already exists, should retrieve cache value if cache age is valid
            if(debug){
                console.log("[KEY-EXISTS][CACHE-READ]: "+key+" : "+cached_time[key]);
                console.log(cached_value[key]);
            }

            //calculating the age of the cached value
            var timediff = new Date()-cached_time[key];

            //check whether stored value date is currently valid considering the timeout
            if(timediff < timeout)
            {
                //the cache is valid, its value should be returned.
                if(debug){console.log("[CACHE-AGE]: "+timediff+"ms < "+timeout+"ms (valid) returning value\n");}
                return cached_value[key];
            }
            else
            {
                //the cache has expired, the functions must be executed to calculate the value.
                if(debug){console.log("[CACHE-AGE]: "+timediff+"ms > "+timeout+"ms (expired) recalculating");}
            }
        }
        else
        {
            //the key does not exists, so the value must be writen in the cache
            if(debug){console.log("[KEY-NOT-EXISTS]: calculating value and writing cache");}
        }

        //this code executes if the key does not exist in the cache or the cache date is expired for that value
        cached_value[key] = func();
        cached_time[key] = new Date();

        if(debug){
          console.log("[CACHE-WRITE]: "+key+" : "+cached_time[key]);
          console.log(cached_value[key]);
          console.log(" ");
        }
        return cached_value[key];
     }
}

module.exports = {
    memoize,
};