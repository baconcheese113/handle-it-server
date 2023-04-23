## Writing tests

You can run tests with `npm run test-watch`

If making changes to queries, run `npx graphql-codegen` to regenerate the type files

## Local development

For local development start the server with
```
npm run dev
```


## Testing locally

For local testing start the server with
```
npm run dev:test
```

## Configuring the .env
- If using an emulator or phone on a local wifi connection, then the local IP address of this computer can be used by getting the IP address of the server machine on the local network with `ipconfig`

  - i.e `http://192.168.1.8:8080/`

  - This address also needs to be configured in the .env of the flutter app

- If using a phone that needs to work outside the local network (like a cellular network) or if using with embedded devices then a proxy like ngrok will be needed to forward requests to localhost.

  - Start ngrok with
    ```bash
    ./ngrok.exe http 8080
    ```
  - Copy `ngrok.app` address to config of flutter or nrf lib
