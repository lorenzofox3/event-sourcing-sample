import {Pool, QueryResult, PoolConfig} from 'pg';
import {SQLStatement} from 'sql-template-strings';
import defaultDBConfig from '../../config/db.js';

export const createDB = (conf: PoolConfig = defaultDBConfig): Connection => {
    const pool = new Pool(conf);

    return {
        query<T>(query: SQLStatement): Promise<QueryResult<T>> {
            return pool.query(query);
        },

        end(): Promise<void> {
            return pool.end();
        }
    };
};

export default createDB();

export interface Connection {
    query<T>(query: SQLStatement): Promise<QueryResult<T>>;

    end(): Promise<void>;
}
