import pg from 'pg';

export const pool = new pg.Pool({
    user : "postgres",
    host : "db.bvmnizsvgblfelreghwj.supabase.co",
    password : "Ucb-ExplorerManager",
    database : "postgres",
    port : "5432"
})