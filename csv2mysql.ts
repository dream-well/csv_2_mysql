import mysql from 'mysql2';
import csv from 'csv-parser';
import fs from 'fs';

// Set up MySQL connection
const connection = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
});

export default function csv2mysql(filename, tablename = undefined) {
    // Read CSV file
    let header;
    let columns;
    let schema;
    let cache = [];
    let rowCount;
    let finalRowCount;
    if(!tablename) tablename = filename;
    
    schema = `DROP TABLE IF EXISTS \`${tablename}\`;`;
    connection.query(schema, (error) => {
      if (error) {
            console.error('Failed to create table:', error);
            return;
      }
      fs.createReadStream(filename + '.csv')
      .pipe(csv())
      .on('data', (data) => {
        if(!header) { // if header
            console.log('create table');
            header = data;
            columns = Object.keys(header).map((column) => `\`${column}\` text`);
            schema = `CREATE TABLE IF NOT EXISTS \`${tablename}\` (${columns.join(', ')})`;
            connection.query(schema, (error) => {
                if (error) {
                    console.error('Failed to create table:', error);
                    return;
                }
                console.log(`Created table ${tablename}`);
            });
            return;
        }
        cache.push(data);
        rowCount ++;
        if(cache.length == 10) {
            insert_rows(cache);
            cache = [];
        }
      })
      .on('end', () => {
        finalRowCount = rowCount;
        if(cache.length) {
            insert_rows(cache);
        }
        console.log('upload ended');
      });
    })
    
    function insert_rows(rows) {
        // Insert data into MySQL table
        const values = rows.map((result) => `(${Object.values(result).map((value) => `"${(value as string).replace(/\"/g, `\\"`)}"`).join(', ')})`);
        const query = `INSERT INTO \`${tablename}\` VALUES ${values.join(', ')}`;
        connection.query(query, (error) => {
            if (error) {
            console.error('Failed to insert data:', error);
            return;
            }
            console.log(`Inserted ${rows.length} rows into ${tablename}`);
        });
    }
}