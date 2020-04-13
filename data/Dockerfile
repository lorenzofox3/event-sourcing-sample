FROM postgres:latest

RUN mkdir -p /fixture /docker-entrypoint-initdb.d

COPY sql /docker-entrypoint-initdb.d

VOLUME /fixture


