import { prepare } from "../deps.ts";
import { NotificationParams } from "../types.ts";

const filenameBase = "deno_notify";

const PLUGIN_URL_BASE =
  "https://github.com/divy-work/deno-notify/releases/latest/download";

const isDev = Deno.env.get("DEV");

if (isDev) {
  let filenameSuffix = ".so";
  let filenamePrefix = "lib";

  if (Deno.build.os === "windows") {
    filenameSuffix = ".dll";
    filenamePrefix = "";
  }
  if (Deno.build.os === "darwin") {
    filenameSuffix = ".dylib";
  }

  const filename =
    `./target/debug/${filenamePrefix}${filenameBase}${filenameSuffix}`;

  // This will be checked against open resources after Plugin.close()
  // in runTestClose() below.
  const resourcesPre = Deno.resources();

  const rid = Deno.openPlugin(filename);
} else {
  const pluginId = await prepare({
    name: "autopilot_deno",
    printLog: true,
    checkCache: Boolean(Deno.env.get("CACHE")) || true,
    urls: {
      darwin: `${PLUGIN_URL_BASE}/libdeno_notify.dylib`,
      windows: `${PLUGIN_URL_BASE}/deno_notify.dll`,
      linux: `${PLUGIN_URL_BASE}/libdeno_notify.so`,
    },
  });
}


// @ts-ignore
const core = Deno.core as {
  ops: () => { [key: string]: number };
  setAsyncHandler(rid: number, handler: (response: Uint8Array) => void): void;
  dispatch(
    rid: number,
    msg: any,
    buf?: ArrayBufferView,
  ): Uint8Array | undefined;
};


const {
  notify
} = core.ops();

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

export function Notify(params: NotificationParams) {
  const response = core.dispatch(notify, textEncoder.encode(JSON.stringify(params)));
  return textDecoder.decode(response);
}
