#usr/bin/sh
docker run --name es-dev-db -v $PWD/fixture:/fixture -p 5432:5432 --env-file ../.env es-db
