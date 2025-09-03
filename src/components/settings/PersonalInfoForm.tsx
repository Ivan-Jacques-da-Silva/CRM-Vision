
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { buscarDadosUsuario, atualizarDadosPessoais } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface DadosPessoais {
  nome: string;
  email: string;
  telefone: string;
}

export const PersonalInfoForm: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [dados, setDados] = useState<DadosPessoais>({
    nome: '',
    email: '',
    telefone: ''
  });

  const { data: dadosUsuario } = useQuery({
    queryKey: ['dados-usuario'],
    queryFn: buscarDadosUsuario
  });

  const mutationAtualizar = useMutation({
    mutationFn: atualizarDadosPessoais,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dados-usuario'] });
      toast({
        title: "Dados atualizados",
        description: "Suas informações pessoais foram salvas com sucesso."
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os dados.",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (dadosUsuario) {
      setDados({
        nome: dadosUsuario.nome,
        email: dadosUsuario.email,
        telefone: dadosUsuario.telefone
      });
    }
  }, [dadosUsuario]);

  const handleChange = (campo: keyof DadosPessoais, valor: string) => {
    setDados(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutationAtualizar.mutate(dados);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Informações Pessoais</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              value={dados.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={dados.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={dados.telefone}
              onChange={(e) => handleChange('telefone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>

          <Button 
            type="submit" 
            disabled={mutationAtualizar.isPending}
            className="w-full"
          >
            {mutationAtualizar.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
