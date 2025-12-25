import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { comparePassword } from "./lib/password-utils";

export const { handlers, signIn, signOut, auth } = NextAuth({
	// auth.js가 기본적으로 브라우저 쿠키를 사용하는데, 쿠키 이름을 secure하게 설정할건지 여부
	useSecureCookies: process.env.NODE_ENV === "production",

	// nestjs의 호스트를 신뢰할건지 여부
	trustHost: true,

	// auth.js의 시크릿 키
	secret: process.env.NEXTAUTH_SECRET,

	// prisma 어댑터 사용
	adapter: PrismaAdapter(prisma),
	providers: [
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: {
					label: "이메일",
					type: "email",
					placeholder: "이메일을 입력해주세요.",
				},
				password: { 
          label: "비밀번호",
          type: "password",
          placeholder: "비밀번호를 입력해주세요.",
        },
			},
      // 이메일과 비밀번호를 받아서 어떻게 인증을 할건지 작성
      async authorize(credentials) {
        // 1. 모든 값들이 정상적으로 들어왔는가?
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error("이메일과 비밀번호를 입력해주세요.");
        }

        // 2. 데이터베이스에서 사용자를 찾는다.
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if(!user) {
          throw new Error("존재하지 않는 이메일 입니다.");
        }

        // 3. 비밀번호 일치여부 확인
        // bcrypt 해싱 알고리즘 기반으로 해싱된 비밀번호 일치여부 확인
        const passwordMatch = comparePassword(
          credentials.password as string, 
          user.hashedPassword as string
        );

        if(!passwordMatch) {
          throw new Error("비밀번호가 일치하지 않습니다.");
        }

        // 4. 사용자 정보 반환  -> 이후부터 nextauth가 자동으로 인증을 진행.
        return user;
      }
		}),
	],
  session: {
    // jwt 전략 사용  
    strategy: "jwt",
  },
  pages: {},
  callbacks: {}
});
