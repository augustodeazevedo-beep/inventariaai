import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase passa tokens de recovery no hash da URL
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      setReady(true);
    } else {
      supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error("Senha mínima de 8 caracteres."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Senha redefinida com sucesso!");
    navigate("/triagem", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page-pattern p-4">
      <Card className="relative w-full max-w-md p-6 backdrop-blur-sm bg-card/80 border-border">
        <h1 className="font-serif text-xl font-bold mb-1">Redefinir senha</h1>
        <p className="text-sm text-muted-foreground mb-5">Defina uma nova senha para sua conta.</p>
        {!ready ? (
          <p className="text-sm text-destructive">Link inválido ou expirado. Solicite uma nova redefinição na tela de login.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newpwd">Nova senha</Label>
              <Input id="newpwd" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar nova senha
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}