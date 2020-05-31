import {
  Notify
} from "./plugin/index.ts";

import { NotificationParams } from "./types.ts";

export default function notify(title: string, body: string) {
  Notify({
    title,
    body
  } as NotificationParams);
}
