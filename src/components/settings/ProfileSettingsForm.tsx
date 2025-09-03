
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { buscarPerfis, atualizarPerfis } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';

interface Perfil {
  id: string;
  nome: string;
  ativo: boolean;
}

export const ProfileSettingsForm: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [perfis, setPerfis] = useState<Perfil[]>([]);

  const { data: perfisData } = useQuery({
    queryKey: ['perfis-usuario'],
    queryFn: buscarPerfis
  });

  const mutationAtualizar = useMutation({
    mutationFn: atualizarPerfis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfis-usuario'] });
      toast({
        title: "Perfis atualizados",
        description: "As configurações de perfil foram salvas com sucesso."
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os perfis.",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (perfisData) {
      setPerfis(perfisData);
    }
  }, [perfisData]);

  const handleToggle = (id: string) => {
    setPerfis(prev => prev.map(perfil => 
      perfil.id === id 
        ? { ...perfil, ativo: !perfil.ativo }
        : perfil
    ));
  };

  const handleNomeChange = (id: string, novoNome: string) => {
    setPerfis(prev => prev.map(perfil => 
      perfil.id === id 
        ? { ...perfil, nome: novoNome }
        : perfil
    ));
  };

  const adicionarPerfil = () => {
    const novoPerfil: Perfil = {
      id: Math.random().toString(36).substring(2, 9),
      nome: 'Novo Perfil',
      ativo: true
    };
    setPerfis(prev => [...prev, novoPerfil]);
  };

  const removerPerfil = (id: string) => {
    setPerfis(prev => prev.filter(perfil => perfil.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutationAtualizar.mutate(perfis);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Configurações de Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {perfis.map((perfil) => (
              <div key={perfil.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor={`perfil-${perfil.id}`}>Nome do Perfil</Label>
                  <Input
                    id={`perfil-${perfil.id}`}
                    value={perfil.nome}
                    onChange={(e) => handleNomeChange(perfil.id, e.target.value)}
                    required
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor={`ativo-${perfil.id}`} className="text-sm">
                    Ativo
                  </Label>
                  <Switch
                    id={`ativo-${perfil.id}`}
                    checked={perfil.ativo}
                    onCheckedChange={() => handleToggle(perfil.id)}
                  />
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removerPerfil(perfil.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={adicionarPerfil}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Perfil
          </Button>

          <Button 
            type="submit" 
            disabled={mutationAtualizar.isPending}
            className="w-full"
          >
            {mutationAtualizar.isPending ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
