CREATE TABLE public.peticao_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  request_id text NOT NULL,
  status text NOT NULL,
  http_status integer NOT NULL,
  tipo_peticao text,
  duration_ms integer,
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_peticao_audit_logs_user_id ON public.peticao_audit_logs(user_id);
CREATE INDEX idx_peticao_audit_logs_created_at ON public.peticao_audit_logs(created_at DESC);

ALTER TABLE public.peticao_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
ON public.peticao_audit_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
