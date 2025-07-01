import request from "@/utils/request";

// 用户登录
export function UserLoginInfo(data) {
    return request({
        url: "/api/LoginInfo/UserLoginInfo",
        method: "post",
        data,
        headers: {
            "Content-Type": "application/json;charset=UTF-8",
            isToken: false
        }
    });
}


// 用户登录
export function uploadfiel(data) {
    return request({
        url: "/api/Businessacceptance/UploadFile",
        method: "post",
        data,
        headers: {
            "Content-Type": "multipart/form-data",
            isToken: false
        }
    });
}


