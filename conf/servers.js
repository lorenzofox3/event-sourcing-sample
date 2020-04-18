export default Object.freeze({
    bookkeeping: Object.freeze({
        port: process.env.BOOKKEEPING_PORT || 3001,
        public: process.env.BOOKKEEPING_PUBLIC || 'http://localhost:3001',
        cors: process.env.BOOKKEEPING_CORS || '*'
    }),
    balance: Object.freeze({
        port: process.env.BALANCE_PORT || 3002,
        public: process.env.BALANCE_PUBLIC || 'http://localhost:3002',
        cors: process.env.BALANCE_CORS || '*'
    }),
    dashboard: Object.freeze({
        port: process.env.DASHBOARD_PORT || 3003,
        public: process.env.DASHBOARD_PUBLIC || 'http://localhost:3003',
        cors: process.env.DASHBOARD_CORS || '*'
    }),
    web: Object.freeze({
        port: 3000
    })
});
