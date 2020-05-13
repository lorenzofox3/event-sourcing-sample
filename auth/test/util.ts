//@ts-ignore
export const createDBStub = (dataGenerator) => {
    const query = createStubFn(dataGenerator);
    return {
        async query(...args: any) {
            const result = await query(...args);
            const rows = Array.isArray(result) ? result : [result];
            return {
                rows
            };
        }
    };
};

export const createStubFn = (input: any) => {
    if (typeof input === 'function') {
        return createStubFnFromGenerator(input);
    }

    return createStubFnFromGenerator(function* () {
        yield input;
    });
};

//@ts-ignore
function createStubFnFromGenerator(dataGenerator) {
    const gen = dataGenerator();
    const calls: any[] = [];

    async function fn(...args: any[]) {
        calls.push([...args]);
        const {value} = gen.next();
        return value;
    }

    return Object.defineProperty(fn, 'calls', {
        value: calls
    });
}

