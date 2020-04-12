FROM postgres:latest

RUN mkdir -p /fixture /docker-entrypoint-initdb.d

COPY ./schema/*.sql /docker-entrypoint-initdb.d

VOLUME /fixture


