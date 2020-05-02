import log from 'log';
import logNode from 'log-node';

// enabling logging (stdout)
logNode();

export default (opts = {}) => {
    const {namespace = 'es:default'} = opts;
    const logger = log.get(namespace);
    return {
        log: logger,
        error: logger.error
    };
};
