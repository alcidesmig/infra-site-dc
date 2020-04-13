#/bin/sh

if [[ ! -z `diff api-config/api strapi-app/api -r` ]]
then
    # Salva a configuração atual
    tar -zcf api-config/backups/api-`date +%F-%H%M`.tar.gz api-config/api
    # Mantém somente as 30 últimas versões
    ls -1tr api-config/backups | head -n -30 | xargs -d '\n' rm -f --
    # Faz o backup
    cp strapi-app/api/* api-config/api -r
fi
