# Cloudflare Workers for nogi-ical

## Note: You must use [wrangler](https://developers.cloudflare.com/workers/cli-wrangler/install-update) 1.17 or newer.

## ๐ Getting Started

### ๐ฉ ๐ป Developing

[`src/index.ts`](./src/index.ts) calls the request handler in [`src/handler.ts`](./src/handler.ts), and will return ical representation of Nogizak46 schedules.

### ๐งช Testing

This template comes with jest tests which simply test that the request handler can handle each request method. `npm test` will run your tests.

### โ๏ธ Formatting

This template uses [`prettier`](https://prettier.io/) to format the project. To invoke, run `npm run format`.

### ๐ Previewing and Publishing

For information on how to preview and publish your worker, please see the [Wrangler docs](https://developers.cloudflare.com/workers/tooling/wrangler/commands/#publish).
