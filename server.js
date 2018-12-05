const Hapi = require('hapi');
const Path = require ('path');

const server = new Hapi.server({
    host: 'localhost',
    port: '3105',
});

const start = async () => {

    await server.register([
        require('vision')
    ]);

    server.views({
        engines: {
            html: require('handlebars'),
            pug: {
               module: require('pug'),
               /* Engine specific options go here */
            }
        },
        relativeTo: __dirname,
        /* this tells us where our view files are stored */
        path: 'lib/templates',
        /* global context for all views, regardless of engine */
        context: {siteTitle: 'The Section 5 Notes'},
        /* Crucial for refreshing page and getting latest changes */
        isCached: false,
         /* only for engines that accept helper files, like handlebars */
        helpersPath: 'lib/helpers',
        defaultExtension: 'html',
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, h) {
            /* our view */
            return h.view('index.pug', {name: "tom"});
        }
    });

    server.route({
        method: 'GET',
        path: '/helpers',
        handler: function (request, h) {

            return h.view('helpers', {name: "tom"});
        }
    });

    /* load routes */
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
}

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

start();