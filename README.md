---------------------------------------------------------------------------------------------------------------------
# SECTION 5: VIEWS
- [my github for this section](https://github.com/MostlyFocusedMike/hapi-notes-5)
- primary sources
    - https://hapijs.com/tutorials/views?lang=en_US
    - https://futurestud.io/tutorials/how-to-create-and-use-handlebars-partial-views-with-hapi
    - https://github.com/hapijs/vision

**NOTE:**
- this section's github has a lot of helpful comments and template files, be sure to check it out
---------------------------------------------------------------------------------------------------------------------
# Using views with the Vision plugin
- Using template views like Pug or Handlebars is a crucial part of any major project, pure HTML is too clunky for more advanced projects 
- Just like static files that required a plugin, rendering views takes a plugin, it's called [Vision](https://github.com/hapijs/vision)
- installing is dead easy as usual: 

```
yarn add vision
// or 
npm install -S vision 
```
- then simply register it to your server like you would any plugin
- You will also need to install template engines, this section uses [Pug](https://pugjs.org/api/getting-started.html) and [Handlebars](https://handlebarsjs.com/installation.html) 
- Handlebars has much more builtin features that work right out of the box, but it's good to see other engines in action too



---------------------------------------------------------------------------------------------------------------------
# The server.views() method 
- after registering, Vision decorates the server object with a .views() method, which takes an object, the **views manager options**: 

```
FILE: server.js


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
       /* HERE IS THE VIEW MANAGER OBJECT */
        engines: {
            pug:  require('pug'),
            html: {
                module: require('handlebars'),
                /* Engine specific options go here */
                layout: true,
                layoutPath: 'layout',
                partialsPath: 'partials',
            },
        },

        /* these options configure all engines  */

        relativeTo: Path.join(__dirname, 'lib/templates'),
        path: '.',
        isCached: process.env.NODE_ENV === 'production',
        context: {siteTitle: 'the section 5 notes'},
        defaultExtension: 'html',
        helpersPath: 'helpers',
    });

...rest of file
```
- that's a lot, so let's break down just the engines property: 

## the template engines
- For Vision to work, you must give it at least one template engine
- here is the simple way:

```
sever.views({ 
    engines: {
       pug:  require('pug'),
    }
})
```
- all you are doing is telling it that .pug files will be rendered by the pug engine
- sometimes though, you will want to configure special options on a per engine basis, so you can also pass in objects to **engines**

```
engines: {
    pug:  require('pug'),
    html: {
        module: require('handlebars'),

        /* specific engine options go here */
        partialsPath: 'partials',
        layout: true,
        layoutPath: 'layout',
    },
    ...
}

```
- all you do is have the top key be the file extension, and then an object, the only required key is **module**, since this will be the actual rendering engine. 
- for any other options, just include them as keys, we'll talk about them below



---------------------------------------------------------------------------------------------------------------------
# View options 

- There are two places to put your options: 
    - **View Manager Options**: when options are put at the top level, they will affect all engines, so this is a good place to put things like **global context**
    - **Engine level**: when passed in at the individual engine level, the options will only affect that engine, and they will override the main options given in the View Manager

- lets look at some of the common ones below (for a full list see the [docs section](https://github.com/hapijs/vision/blob/master/API.md#options)):

- **relativeTo** (optional)
    - Like our static files, this sets where Hapi will start looking for files, it's very common to see this set with __dirname, like I did: 
```
relativeTo: Path.join(__dirname, 'lib/templates'),
``` 
- **path** (required)
    - this is the path to the directory where all your templates are located, when used in conjunction with **relativeTo** it's fine to just be '.'
    - it should be noted that templates *can't* be outside the **path** directory unless **allowAbsolutePaths** and **allowInsecureAccess** are also given and set to true: 
```
allowAbsolutePaths: true,
allowInsecureAccess: true
```
    - they are optional and default to false 

- **isCached** (optional, BUT NEEDED FOR SANITY)
    - takes true or false, and decides if Hapi will cache the templates. In dev, it should *absolutely* be set to false, otherwise, you will have to restart your server every time you want to see any change.
    - in production, it should be set to true in order to improve performance, so it's common to see it set as a boolean that pulls in environment variables or something
    - here's my simple little test: 
```
isCached: process.env.NODE_ENV === 'production',
```
    - I don't have that variable setup in dev, so it will always go to false

- **context** (optional)
    - while you can pass context to each individual view, you can also pass a global context that will either affect all engines or per engine, depending where you put it


- In addition to the **path** property, there are several other useful directories that you can setup: 
  - **partialsPath**: (optional) 
    - contains your partials
  - **helpersPath** (optional)
    - contains your template helpers, which are js files that export a helper function that are accessible inside your views. Check my github for an example as well as the [view helpers](https://hapijs.com/tutorials/views?lang=en_US) section on the Hapi docs tutorial
  - **layoutPath** (optional)
    - contains layout templates, to use this you must set **layout** to a boolean or string first:

```
layout: true /* assumes layout file is layout.[ext] */
/* if your layout file is titled differently: */
layout: 'custom-layout-name.html'

```

- all three of these are to help with views, but since these are sometimes engine specific, if you want to know more, check the [docs](https://github.com/hapijs/vision/blob/master/API.md#options) for more info, as well as my github, which shows simple examples with Pug and Handlebars 
- the hapi tutorial site also has some good parts on [these](https://hapijs.com/tutorials/views?lang=en_US) 
- personal observation, it seems Hapi is much more suited to using handlebars out of the box, especially since it is the template engine of choice for Hapi Pal 
 
### where can these options be used?
- most, if not all, of these options can be configured at either the engine level, or apply to all engines at once in the **view manager** object




----------------------------------------------------------------------------------------------------------------------------------
# Rendering views with 'h'
- Again, like we had with static assets, Vision also decorates the response toolkit with a method, this time it's **.view(file, context, options)**

```
    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, h) {
            return h.view('index.html', {topic: "Views"}, {layout: 'other-layout.html'});
            /* context and options are optional */
        }
    });
```
- here we are telling it to look up the template in index.html, giving it a context, and using our options to override what layout gets used for this particular route 
    - use the options object to override anything but **isCached, partialsPath,** or **helpersPath** which are set only once on the initialization of the engines 

----------------------------------------------------------------------------------------------------------------------------------
# Rendering with the view handler 
- Like static files, you can also use the handler approach:

```
server.route({
    method: 'GET',
    path: '/',
    handler: {
        view: {
            template: 'index',
            context: {
                topic: "Views",
            },
            options: {
                layout: 'other-layout.html'
            } 
        }
    }
});
```
- both context and options are optional arguments, so if you just want to render a view, there's a simpler way: 
```
server.route({
    method: 'GET',
    path: '/',
    handler: {
        view:  'index'
    }
});
```




-----------------------------------------------------------------------------------------------------------------------------------


 




