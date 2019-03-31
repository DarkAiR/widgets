({
    baseUrl: '',
    paths: {
        'd3': 'd3.min'  // d3 library
    },
    name: "mychart",
    out: "mychart.min.js",
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});
