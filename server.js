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
            /* simplest way to configure an engine */
            pug:  require('pug'),
            /* configure the engine to have specific options */
            html: {
                module: require('handlebars'),
                /* Engine specific options go here */

                /* Whether or not the engine uses layouts */
                layout: true,
                /*
                    where the layout is located
                    NOTE: unless an engine specific relativeTo option is given,
                    all paths will go off the main relativeTo option
                */
                layoutPath: 'layout',
                /* where your partial files are stored */
                partialsPath: 'partials',
            },
        },

        /* these options configure all engines  */

        /*
            where the path will start from,
            default is the current working directory
        */
        relativeTo: Path.join(__dirname, 'lib/templates'),
        /* this tells us where our view files are stored */
        path: '.',
        /*
            CRUCIAL for refreshing page and getting latest changes in dev
            without having to go and save a server file to restart the server
            but in prod, you do want it to be set to true to increase perfomance
        */
        isCached: process.env.NODE_ENV === 'production',
        /* global context for all views, regardless of engine */
        context: {siteTitle: 'the section 5 notes'},
        /* files given no extension will be defaulted to this str */
        defaultExtension: 'html',
        /*
            you can also use layouts for your whole project out here
            The issue in this instance is that Pug uses layouts
            differently, so if we put this down here, it will break, see the
            vision docs for more info
            https://github.com/hapijs/vision/blob/master/API.md#options
        */
        // layout: true,
        // layoutPath: 'lib/templates/layout'
        // partialsPath: 'lib/templates/partials',
        /*
            some engines use helper files, like handlebars
            We can put this for all engines here, since if an engine doesn't
            use helpers, it just ignores it
        */
        helpersPath: 'helpers',
    });

    /* load routes */
    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, h) {
            /* our defaultExtension at work here */
            /* view() takes the filepath to the template, context, and options */
            return h.view('index', {topic: "Views"}, {});
            /* context and options are optional */
        }
    });

    /* instead of h.view(), you can also use the views handler */
    // server.route({
    //     method: 'GET',
    //     path: '/',
    //     handler: {
    //         /* if no context is needed, give view at the top level */
    //         // view: 'index'
    //         view: {
    //             template: 'index',
    //             context: {
    //                 topic: "Views",
    //             },
    //         }
    //     }
    // });

    /* A view that uses helper functions, check the template */
    server.route({
        method: 'GET',
        path: '/helpers',
        handler: function (request, h) {
            return h.view('helpers', {topic: "Helpers"});
        }
    });

    server.route({
        method: 'GET',
        path: '/nested',
        handler: function (request, h) {
            /* if you use a nested structure, just give the file path */
            /* we aren't using html so we add the pug extension*/
            return h.view('nested/example.pug', {topic: "Nesting"});
        }
    });

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
}

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

start();