import { handlers } from "@/auth";

// 핸들러를 가지고 와서 GET, POST 함수를 내보내주는 역할을 함.
// 로그인, 회원가입을 할때 필요한 api route를 자동으로 만들어줌.
export const { GET, POST } = handlers;
