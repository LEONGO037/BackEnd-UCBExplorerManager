import pg from 'pg';

export const pool = new pg.Pool({
    user : "postgres.sinyhvhdeyagufbnsmqj",
    host : "aws-0-sa-east-1.pooler.supabase.com",
    password : "SisTGpassword2025",
    database : "tallerdegrado",
    port : "6543"
})