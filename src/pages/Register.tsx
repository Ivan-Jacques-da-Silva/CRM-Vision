
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { register, ApiError } from '@/services/api';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    empresaNome: '',
    aceitarTermos: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validações
    if (formData.senha !== formData.confirmarSenha) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    if (!formData.aceitarTermos) {
      toast({
        title: "Erro de validação",
        description: "Você deve aceitar os termos de uso",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    try {
      const registerData = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        empresaNome: formData.empresaNome || undefined
      };

      const response = await register(registerData);
      
      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo ao VisionCRM, ${response.usuario?.nome || 'usuário'}!`,
      });
      
      // Redirecionar para o dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro no registro:', error);
      
      let errorMessage = 'Erro interno do servidor';
      
      if (error instanceof ApiError) {
        if (error.status === 400) {
          errorMessage = error.message || 'Dados inválidos';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro no registro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Criar Conta no VisionCRM
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Comece sua jornada de vendas hoje
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                name="nome"
                type="text"
                placeholder="Seu nome completo"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="empresaNome">Nome da Empresa (Opcional)</Label>
              <Input
                id="empresaNome"
                name="empresaNome"
                type="text"
                placeholder="Nome da sua empresa"
                value={formData.empresaNome}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  name="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="Crie uma senha segura"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua senha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="aceitarTermos"
                checked={formData.aceitarTermos}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, aceitarTermos: checked as boolean }))
                }
              />
              <Label htmlFor="aceitarTermos" className="text-sm">
                Aceito os{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  termos de uso
                </Link>{' '}
                e{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  política de privacidade
                </Link>
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
