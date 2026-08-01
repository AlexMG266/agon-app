-- Crea la base de datos de TEST independiente (agon_test).
-- Se ejecuta en el primer arranque del volumen (docker-entrypoint-initdb.d se
-- ejecuta tras crear la BD principal definida en POSTGRES_DB).
-- Las tablas de agon_test las crea el propio sql-maven-plugin durante `mvn test`
-- (1-PostgreSQLCreateTables.sql + 3-SeedData.sql apuntando a testDataSource.url).
SELECT 'CREATE DATABASE agon_test OWNER agon'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'agon_test') \gexec
