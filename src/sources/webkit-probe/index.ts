"use webkit";
import { ContentRating, type SourceInfo } from "@suwatte/toolchain/types";

/** WebKit-only install comparison for the Suwatte 7.2.0 startup error. */
export default class TWKanWebKitProbe {
  static info: SourceInfo = {
    id: "zh-hant.twkan.webkit-probe",
    name: "TWKan WebKit 安装诊断",
    version: 1,
    website: "https://twkan.com",
    languages: ["zh-Hant"],
    rating: ContentRating.EVERYONE,
  };
}
