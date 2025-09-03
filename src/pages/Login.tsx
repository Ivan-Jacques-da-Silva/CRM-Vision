
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { login, ApiError } from '@/services/api';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Login demo - credenciais aceitas
    const isDemo = (formData.email === 'demo@crm.com' && formData.senha === 'demo123') ||
                   (formData.email === 'admin@crm.com' && formData.senha === 'admin123');

    try {
      if (isDemo) {
        // Simular delay de login
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Salvar dados demo no localStorage
        const demoUser = {
          id: 1,
          nome: formData.email === 'admin@crm.com' ? 'Admin Demo' : 'Usuario Demo',
          email: formData.email,
          empresaId: 1,
          token: 'demo-token-' + Date.now()
        };
        
        localStorage.setItem('crm-user', JSON.stringify(demoUser));
        localStorage.setItem('crm-token', demoUser.token);
        
        toast({
          title: "Login demo realizado com sucesso!",
          description: `Bem-vindo, ${demoUser.nome}!`,
        });
        
        navigate('/dashboard');
      } else {
        // Tentar login real
        const response = await login(formData);
        
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${response.usuario?.nome || 'usuário'}!`,
        });
        
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      
      let errorMessage = 'Erro interno do servidor';
      
      if (error instanceof ApiError) {
        if (error.status === 401) {
          errorMessage = 'Email ou senha incorretos';
        } else if (error.status === 403) {
          errorMessage = 'Conta inativa ou assinatura vencida';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro no login",
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
            Entrar no VisionCRM
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Acesse sua conta para continuar
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  name="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
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

            <div className="flex items-center justify-between text-sm">
              <Link 
                to="/register" 
                className="text-primary hover:underline"
              >
                Não tem conta? Registre-se
              </Link>
              <Link 
                to="/forgot-password" 
                className="text-muted-foreground hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <div className="text-sm text-muted-foreground">
              <strong>Acesso Demo:</strong>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>📧 demo@crm.com | 🔑 demo123</div>
              <div>📧 admin@crm.com | 🔑 admin123</div>
            </div>
            <Link 
              to="/plans" 
              className="inline-block text-sm text-muted-foreground hover:underline mt-4"
            >
              Ver planos disponíveis
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
