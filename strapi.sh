#!/bin/sh
set -ea

_stopStrapi() {
  echo "Stopping strapi"
  kill -SIGINT "$strapiPID"
  wait "$strapiPID"
}

trap _stopStrapi SIGTERM SIGINT

cd /usr/src/api

APP_NAME=${APP_NAME:-strapi-app}
DATABASE_CLIENT=${DATABASE_CLIENT:-mongo}
DATABASE_HOST=${DATABASE_HOST:-localhost}
DATABASE_PORT=${DATABASE_PORT:-27017}
DATABASE_NAME=${DATABASE_NAME:-strapi}
DATABASE_SRV=${DATABASE_SRV:-false}
EXTRA_ARGS=${EXTRA_ARGS:-}

if [ ! -f "$APP_NAME/package.json" ]
then
    strapi new ${APP_NAME} --dbclient=$DATABASE_CLIENT --dbhost=$DATABASE_HOST --dbport=$DATABASE_PORT --dbsrv=$DATABASE_SRV --dbname=$DATABASE_NAME --dbusername=$DATABASE_USERNAME --dbpassword=$DATABASE_PASSWORD --dbssl=$DATABASE_SSL --dbauth=$DATABASE_AUTHENTICATION_DATABASE $EXTRA_ARGS
elif [ ! -d "$APP_NAME/node_modules" ]
then
    npm install --prefix ./$APP_NAME
fi

if [ ! -L $APP_NAME/public/uploads ]
then
    rm -rf $APP_NAME/public/uploads
    ln -s `pwd`/backup/uploads $APP_NAME/public/uploads
fi

#npm install -g nodemailer

if [ ! -d $APP_NAME/api ]
then
    cp api-config/api $APP_NAME -r
    #ln -s `pwd`/api-config/api $APP_NAME/api
    rm -rf $APP_NAME/config
    rm -rf $APP_NAME/api
    #ln -s /usr/src/api/api-config/api $APP_NAME/api
    cp /usr/src/api/api-config/config $APP_NAME/. -r
    rm -f $APP_NAME/plugins/users-permissions/config/jwt.json
    cp /usr/src/api/api-config/jwt.json $APP_NAME/plugins/users-permissions/config/jwt.json
    rm -f $APP_NAME/plugins/users-permissions/models/User.settings.json
    cp /usr/src/api/api-config/User.settings.json $APP_NAME/plugins/users-permissions/models/User.settings.json 
fi

cd $APP_NAME

if [ ! -d "exports/graphql" ]
then
    strapi install graphql 
fi

strapi start &

strapiPID=$!
wait "$strapiPID"
