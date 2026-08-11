import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("api", {
  platform: process.platform,
});
