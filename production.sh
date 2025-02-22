#!/bin/bash
echo "This script will set your Xivi environment to production."
echo "Are you sure you want to continue? (y/N)"
read -r response
if [[ $response =~ ^([yY][eE][sS]|[yY])$ ]]; then
    if [[ -f .env ]]; then
        echo ".env file already exists. Do you want to delete it and create a new one? (y/N)"
        read -r delete
        if [[ $delete =~ ^([yY][eE][sS]|[yY])$ ]]; then
            rm .env
            echo ".env file deleted."
        else
            echo "Aborted."
            exit 1
        fi
    fi
    echo "Setting up environment..."
    echo "NODE_ENV=production" > .env
    echo "Please enter your Groq API key (press enter if you don't have one, this means Xivi Agent won't work):"
    read -r groq_api_key
    echo "GROQ_API_KEY=$groq_api_key" >> .env
    echo "Do you have a Gitea instance that you'd like to use for Xivi? (y/N)"
    read -r gitea
    if [[ $gitea =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "Gitea URL (e.g. https://gitea.example.com/):"
        read -r giteaurl
        if [[ ! $giteaurl =~ ^https?:// ]]; then
            echo "Invalid URL. It must start with http:// or https://"
            exit 1
        fi
        if [[ ${giteaurl: -1} != "/" ]]; then
            giteaurl="$giteaurl/"
        fi
        echo "GITEA_URL=$giteaurl" >> .env
        echo "Gitea token:"
        read -r giteatoken
        echo "GITEA_TOKEN=$giteatoken" >> .env
    fi
    echo "Would you like to enable password resets for Xivi? (y/N)"
    read -r mailserver
    if [[ $mailserver =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "SMTP server:"
        read -r smtpserver
        echo "SMTP_SERVER=$smtpserver" >> .env
        echo "SMTP port:"
        read -r smtpport
        echo "SMTP_PORT=$smtpport" >> .env
        echo "SMTP username (probably the email address if you're using mailcow):"
        read -r smtpuser
        echo "SMTP_USER=$smtpuser" >> .env
        echo "SMTP password (encoded in base64, this can be done with \\\`echo -n 'password' | base64\\\`):"
        read -r smtppass
        echo "SMTP_PASS=$smtppass" >> .env
    fi
    echo "Finished setting up environment."
    echo "Please run 'bun run build' and 'bun run start' to start Xivi."
else
    echo "Aborted."
    exit 1
fi