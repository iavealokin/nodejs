CREATE DATABASE forms;
use forms;
CREATE TABLE users (id varchar(36), username VARCHAR(11), password VARCHAR(10000),regtime VARCHAR(24),
       ip VARCHAR(20));

)

GRANT ALL PRIVILEGES ON * . * TO 'adm'@'localhost';
FLUSH PRIVILEGES;

ALTER USER 'adm'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'mysql';

CREATE TABLE forms (id varchar(36), name VARCHAR(11));
CREATE TABLE questions (id int(10) ,questorder int(10) , idform varchar(36), name VARCHAR(20));



CREATE TABLE answers (iduser varchar(36), idform varchar(36), idquest int(10), answer int(1), formDt varchar(24);

CREATE TABLE user_history (iduser varchar(36),ipuser VARCHAR(20) , timeenter varchar(24), timeexit varchar(24));

CREATE TABLE compare_history (iduser varchar(36),idform VARCHAR(36) , idComparableUser varchar(36));
