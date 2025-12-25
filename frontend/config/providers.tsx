'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';

// QueryClient는 React Query의 핵심 컴포넌트로, 데이터 캐싱, 오류 처리, 동시성 관리 등을 담당


// 1. 데이터 보관소(Cache) 만들기
//   : 서버에서 받아온 데이터를 임시로 저장해두는 가상의 창고 생성
const queryClient = new QueryClient();

export function Providers({ 
  // 리액트에서 컴포넌트를 만들 때, 태그 사이에 넣는 모든 내용이 자동으로 {children} 이란 이름으로 들어옴.
  children
}: React.PropsWithChildren) { //{ children: React.ReactNode }
  return (
    // - 울타리 설치 (JotaiProvider)
    // Jotai로 감싸는 순간, 그 아래 있는 모든 자식{children}들은 Jotai라는 데이터 저장소를 공유할 수 있게 됨.
    <JotaiProvider>
      {/* // 2. 배급망 설치 (Provider) */}
      {/* // 창고를 하위의 (children) 모든 컴포넌트가 같이 쓸수 있게 허락 */}
      {/* //   : <QueryClientProvider client={queryClient}> 태그로 감싸진 자식들은  */}
      {/* //     어디서든 useQuery 같은 기능을 사용해 데이터를 가져오고, 이 창고에 저장된 데이터를 공유할 수 있음. */}
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </JotaiProvider>
  );
}



/**
 * React Query
 * : 서버 데이터 담당
 * : db에 저장된 게시글 목록, 사용자 프로필 정보 등 서버에서 가져와야하는 데이터를 
 *   캐싱하고, 오류 처리, 동시성 관리 등을 담당
 * 
 * Jotai
 * : 클라이언트 데이터 담당
 * : 사용자가 클릭해서 바뀐 버튼 색깔, 입력창에 타이핑 중인 텍스트, 
 *   모달창이 열렸는지 여부 등 내 브라우저 안에서만 일어나는 상태를 관리.
 */