import { PrismaClient } from "@prisma/client";

// Prisma v7부터는 PrismaClient 생성 시 adapter(accelerateUrl 또는 driver adapter)가 필요 -> 
import { PrismaPg } from "@prisma/adapter-pg";

// 싱글톤 인스턴스를 만드는 함수
const prismaClientSingleton = () => {
	// Prisma v7부터는 PrismaClient 생성 시 adapter(accelerateUrl 또는 driver adapter)가 필요합니다.
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error(
			"DATABASE_URL이 설정되어 있지 않습니다. (.env.local에 DATABASE_URL을 추가하세요.)"
		);
	}

	const adapter = new PrismaPg({ connectionString });
	return new PrismaClient({ adapter });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClientSingleton | undefined;
};

// 이미 생성된 게 있으면 쓰고, 없으면 새로 만듭니다.
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


// (1) 강의 예제코드 따라했으나 에러 발생 --> Prisma Client가 engineType = client 로 생성돼 서버 코드인데 browser 엔진으로 생성돼서 에러가 발생함(gpt)
// --- 강의 예제 코드 (prisma v6) ---
// import { PrismaClient } from "@prisma/client"

// const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// export const prisma =
//   globalForPrisma.prisma || new PrismaClient();

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// --- 에러 ---
/**
 * ⨯ Error [PrismaClientConstructorValidationError]: Using engine type "client" requires either "adapter" or "accelerateUrl" to be provided to PrismaClient constructor. Read more at https://pris.ly/d/client-constructor at __TURBOPACK__module__evaluation__ (prisma.ts:19:3) at __TURBOPACK__module__evaluation__ (auth.ts:3:1) at __TURBOPACK__module__evaluation__ (app/api/auth/[...nextauth]/route.ts:1:1) at Object.<anonymous> (.next/server/app/api/auth/[...nextauth]/route.js:8:3) 17 | export const prisma = 18 | globalForPrisma.prisma ?? > 19 | new PrismaClient({ | ^ 20 | log: 21 | process.env.NODE_ENV === "development" 22 | ? ["query", "error", "warn"] { page: '/api/auth/signin' } ○ Compiling /_error ... ✓ Compiled /_error in 658ms GET /api/auth/signin 500 in 2093ms
 */





//(2) gemini 추천 코드 따라했으나 여전히 에러발생
/**
 * import { PrismaClient } from "@prisma/client";

// 싱글톤 인스턴스를 만드는 함수
const prismaClientSingleton = () => {
  return new PrismaClient(); // 옵션을 비우면 자동으로 .env의 DATABASE_URL을 사용합니다.
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// 이미 생성된 게 있으면 쓰고, 없으면 새로 만듭니다.
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
 */





// --- 원인 정리 ---
/*
 Prisma v7에서 PrismaClient 생성 시 adapter(또는 accelerateUrl)가 필수인데, 지금은 new PrismaClient()로 비어있게 생성해서임.
  
"비어있게 생성해서 에러가 났다"는 말의 의미
작성하셨던 에러 메시지를 다시 보면 이렇습니다: Using engine type "client" requires either "adapter" or "accelerateUrl" to be provided...

이 말은 즉, **"네가 지금 클라이언트 모드로 쓰겠다고 설정했는데, 정작 연결 통로(Adapter)는 안 알려줬잖아!"**라는 뜻입니다.

new PrismaClient() (비어있음) -> 연결 정보 없음.

v7은 더 이상 알아서 찾아주지 않음.

결국 "나 어떻게 접속해?"라며 에러를 뿜는 것이죠.
*/


// 해결 방법
/**
1. 드라이버 어댑터를 직접 생성 (연결 통로 확보)
const adapter = new PrismaPg({ connectionString });

2. 클라이언트를 만들 때 "이 통로를 써!"라고 명시
return new PrismaClient({ adapter });

이렇게 함으로써 Prisma v7이 요구하는 **"명시적인 연결 방식 제공"**이라는 규칙을 완벽히 지키게 된 것입니다.

*/
