import request from "@/utils/request";

// 获取行政区列表
export function GetXzqData() {
    return request({
        url: "/webapi/WebTZZCommon/GetXzqData",
        method: "post",
        headers: {
            "Content-Type": "application/json;charset=UTF-8",
            isToken: false
        }
    });
}
// 获取行政区列表(乡镇级别)
export function GetTownData() {
    return request({
        url: "/webapi/WebTZZCommon/GetTownData",
        method: "post",
        headers: {
            "Content-Type": "application/json;charset=UTF-8",
            isToken: false
        }
    });
}


