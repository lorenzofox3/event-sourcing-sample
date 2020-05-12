# Auth

A simple (and weak) OAuth server which only supports grant type ``password`` for confidential, trusted client applications.
With the current implementation, tokens can not be revoked, and the system does not implement token expiration/refresh mechanism.

Note for the time being, this server will work as an authentication server rather than as an authorization server

## Installation

With a running postgres database, run the ``scripts/init-db.sql`` as superuser: (example from a psql session)

``\i scripts/init-db.sql``

You can then create a user for the auth API, belonging to the ``auth`` group role:

``CREATE ROLE auth_api WITH LOGIN 'the_password' IN ROLE auth``

You will also need to add the ``auth`` schema to this user's search path (or the superuser if ever you decide to use the same credentials for all the services)

``ALTER ROLE auth_api SET search_path=auth;``

You can now use the user credentials to connect to the database

## Add client applications

Many parts of the system will need to use the auth service in order to authenticate users. You should therefore register them as clients and save their credentials (Technically you could make them the same client although that will definitely not be the case in production).

For the web app for example:

``node -r esm -r dotenv/config auth/scripts/create-client-application.js --name web-app``

## Create user

There is also a script to add a user (in the sense of consumer of the system, end user) to the database

For example:

``node -r esm -r dotenv/config scripts/create-user.js -w 1234 -f laurent -l renard -e laurent@example.com``
