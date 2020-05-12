// @ts-ignore
export const createDBStub = (input) => {
    if (typeof input === 'function') {
        return createDBStubFromGenerator(input);
    }

    return createDBStubFromGenerator(function* () {
        yield input;
    });
};

//@ts-ignore
export const createDBStubFromGenerator = (dataGenerator) => {
    const gen = dataGenerator();
    return {
        async query() {
            const {value} = gen.next();
            const rows = Array.isArray(value) ? value : [value];
            return {
                rows
            };
        }
    };
};
