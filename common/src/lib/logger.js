import debug from 'debug';

export default (opts = {}) => {
    return opts.namespace ?
        debug(opts.namespace) :
        console.log;
};
