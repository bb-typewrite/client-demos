import axios, { AxiosRequestConfig } from "axios";
import { WordTipOrigin } from "./App";

export function apiTypingTips(word: string) {
  return result<WordTipOrigin[]>({
    url: "/typing-service/version/test/typingTips",
    method: "post",
    data: { code: word },
  });
}

//#region  //*=========== axios-基础配置 ===========
const axiosInstance = axios.create({
  baseURL: "https://bb-typing.tyu.wiki/",
});

axiosInstance.interceptors.response.use(
  (config) => config.data,
  (error) => {
    Promise.reject(error);
  }
);

function result<RespData = null>(config: AxiosRequestConfig) {
  return axiosInstance(config) as unknown as Promise<APIBaseFormat<RespData>>;
}

interface APIBaseFormat<T = any> {
  code: number;
  message: string;
  result: T;
}

//#endregion  //*======== axios-基础配置 ===========
