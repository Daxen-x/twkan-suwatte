import { ContentRating, type SourceInfo } from "@suwatte/toolchain/types";

/**
 * Installation-only diagnostic source.
 * Does not connect to TWKan or alter the existing TWKan extension.
 */
export default class TWKanInstallProbe {
  static info: SourceInfo = {
    id: "zh-hant.twkan.install-probe",
    name: "TWKan 安装诊断（临时）",
    version: 1,
    website: "https://twkan.com",
    languages: ["zh-Hant"],
    rating: ContentRating.EVERYONE,
  };
}
