
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { alterarSenha } from '@/services/api';
import { useMutation } from '@tanstack/react-query';

interface DadosAlteracaoSenha {
  senhaAtual: string;
  novaSenha: string;
  confirmarSenha: string;
}

export const PasswordChangeForm: React.FC = () => {
  const { toast } = useToast();
  
  const [dados, setDados] = useState<DadosAlteracaoSenha>({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  const mutationAlterarSenha = useMutation({
    mutationFn: alterarSenha,
    onSuccess: () => {
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso."
      });
      setDados({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível alterar a senha.",
        variant: "destructive"
      });
    }
  });

  const handleChange = (campo: keyof DadosAlteracaoSenha, valor: string) => {
    setDados(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (dados.novaSenha !== dados.confirmarSenha) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (dados.novaSenha.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    mutationAlterarSenha.mutate(dados);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Alterar Senha</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="senhaAtual">Senha Atual</Label>
            <Input
              id="senhaAtual"
              type="password"
              value={dados.senhaAtual}
              onChange={(e) => handleChange('senhaAtual', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="novaSenha">Nova Senha</Label>
            <Input
              id="novaSenha"
              type="password"
              value={dados.novaSenha}
              onChange={(e) => handleChange('novaSenha', e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
            <Input
              id="confirmarSenha"
              type="password"
              value={dados.confirmarSenha}
              onChange={(e) => handleChange('confirmarSenha', e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button 
            type="submit" 
            disabled={mutationAlterarSenha.isPending}
            className="w-full"
          >
            {mutationAlterarSenha.isPending ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
