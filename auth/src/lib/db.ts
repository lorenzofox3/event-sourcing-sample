import {Pool, QueryResult, PoolConfig} from 'pg';
import {SQLStatement} from 'sql-template-strings';
import defaultDBConfig from '../../config/db.js';

export interface Connection {
    query<T>(query: SQLStatement): Promise<QueryResult<T>>;
}

export const createDB = (conf: PoolConfig = defaultDBConfig): Connection => {
    const pool = new Pool(conf);

    return {
        query<T>(query: SQLStatement): Promise<QueryResult<T>> {
            return pool.query(query);
        }
    };
};

export default createDB();
