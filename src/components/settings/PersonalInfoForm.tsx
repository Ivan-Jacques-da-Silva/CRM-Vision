
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { buscarDadosUsuario, atualizarDadosPessoais, uploadAvatar, getAvatarUrl } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Loader2 } from 'lucide-react';

interface DadosPessoais {
  nome: string;
  email: string;
  telefone: string;
  avatar?: string;
}

export const PersonalInfoForm: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  
  const [dados, setDados] = useState<DadosPessoais>({
    nome: '',
    email: '',
    telefone: '',
    avatar: ''
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
      // Check if dadosUsuario has nested structure or flat structure
      const user = dadosUsuario.usuario || dadosUsuario;
      
      setDados({
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        avatar: user.avatar || ''
      });
    }
  }, [dadosUsuario]);

  const handleChange = (campo: keyof DadosPessoais, valor: string) => {
    setDados(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadAvatar(file);
      setDados(prev => ({ ...prev, avatar: response.avatar }));
      
      // Force update user data cache
      queryClient.invalidateQueries({ queryKey: ['dados-usuario'] });
      
      toast({
        title: "Avatar atualizado",
        description: "Sua foto de perfil foi atualizada com sucesso."
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a foto de perfil.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <Avatar className="h-24 w-24 border-2 border-primary/20">
                <AvatarImage src={getAvatarUrl(dados.avatar)} alt={dados.nome} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {dados.nome ? dados.nome.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-8 w-8 text-white" />
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Clique para alterar a foto</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

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
