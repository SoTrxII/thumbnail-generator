# Thumbnail generator

Generating a thumbnail programmatically

## Configure


## Development

### Modified OpenFaaS template

The template used for this function is derived from the *node17* official OpenFaaS template.
The Dockerfile has been modified to add ffmpeg and some fonts to the alpine container

### Import trick

NodeJs `import` directive is used in package.json to bind the path `#core` to wherever the function core is.

In development, `#core` is bound to the folder `../dist/`.

In production (the function container), `#core` is bound to `./core`.

This allows to always use the latest transpiled version of the core. 
Jest, the test runner, doesn't yet support the `import` directive, and a `moduleNameMapper` has been created in jest.config.json
