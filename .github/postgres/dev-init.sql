CREATE USER root with encrypted password 'root';
CREATE DATABASE postgres;
GRANT ALL PRIVILEGES ON DATABASE postgres TO root;
