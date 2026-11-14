import {databaseSchema,initialDatabase,type MockDatabase} from './model';
export const MOCK_DB_KEY='woku:cx-survey:mock-api:v1';
export const readDatabase=():MockDatabase=>{
 const raw=localStorage.getItem(MOCK_DB_KEY);if(!raw)return {...initialDatabase,records:[]};
 const parsed=databaseSchema.safeParse(JSON.parse(raw));if(!parsed.success)throw new Error('Invalid mock database');return parsed.data;
};
export const writeDatabase=(db:MockDatabase):void=>localStorage.setItem(MOCK_DB_KEY,JSON.stringify(databaseSchema.parse(db)));
export const configureMock=(values:Partial<Omit<MockDatabase,'records'>>):void=>writeDatabase({...readDatabase(),...values});
