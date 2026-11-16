// Supabase 연결 정보 (Supabase 화면 > Project Settings > API Keys 에서 복사)
// url: Project URL, anonKey: Publishable key(또는 anon public key)
// 이 두 값은 공개되어도 되는 값입니다. 데이터는 로그인 + 행 단위 보안(RLS)으로 보호됩니다.
// 절대 service_role / secret 키를 넣지 마세요.
window.WB_CONFIG = {
  url: "https://YOUR-PROJECT.supabase.co",
  anonKey: "YOUR-PUBLISHABLE-KEY"
};
