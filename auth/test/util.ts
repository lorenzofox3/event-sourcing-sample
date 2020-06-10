// @ts-ignore
import stub from 'sbuts';

//@ts-ignore
export const createDBStub = (...args) => {
    const query = stub(...args.map(arg => Promise.resolve(arg)));
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
