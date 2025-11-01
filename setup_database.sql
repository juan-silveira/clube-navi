-- Setup Database for Clube Navi
-- Execute with: sudo -u postgres psql < setup_database.sql

CREATE DATABASE clube_navi;
CREATE USER clube_navi_user WITH ENCRYPTED PASSWORD 'clube_navi_password';
GRANT ALL PRIVILEGES ON DATABASE clube_navi TO clube_navi_user;
ALTER DATABASE clube_navi OWNER TO clube_navi_user;

-- Connect to the database
\c clube_navi

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO clube_navi_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO clube_navi_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO clube_navi_user;
