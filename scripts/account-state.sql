-- Supabase Auth 사용자별 앱 기록. Prisma 기본 User 모델과 별도로 관리한다.
-- 신규 테이블만 추가하며 기존 계정 및 개인정보는 변경하지 않는다.
BEGIN;
CREATE TABLE public.user_app_state (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('bear', 'appliances')),
  data jsonb NOT NULL CHECK (
    jsonb_typeof(data) = 'object' AND octet_length(data::text) <= 131072
  ),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, kind)
);
COMMENT ON TABLE public.user_app_state IS '계정별 북극곰 활동과 가전 설정. 버전 비교로 오래된 기기의 덮어쓰기를 방지한다.';
COMMENT ON COLUMN public.user_app_state.data IS 'bear: 성장·먹이·미션 기록, appliances: 기기 추가·삭제·사용 여부 설정. 전력 실측값 아님.';
ALTER TABLE public.user_app_state ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.user_app_state FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_app_state TO authenticated;
CREATE POLICY own_read ON public.user_app_state FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);
CREATE POLICY own_insert ON public.user_app_state FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY own_update ON public.user_app_state FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
COMMIT;
