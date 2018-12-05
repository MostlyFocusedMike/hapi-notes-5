/*
    Certain engines, like handlebars, can take helper files
    It looks like each file must export a top level function
    that gets called in the engine by referencing the file name.
    so in the template it would be like
    {{ subtract 8 2 }}
    which would output 6 in this case, arguments are separated by
    spaces
*/

module.exports = (a,b) => {
    return a - b
};
