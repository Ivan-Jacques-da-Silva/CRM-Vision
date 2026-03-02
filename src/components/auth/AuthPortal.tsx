import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { login, register, ApiError } from '@/services/api';
import type { OrigemAuth } from '@/lib/auth-transition';

interface AuthPortalProps {
  initialAba: OrigemAuth;
}

type TipoPessoa = 'FISICA' | 'JURIDICA';

interface FormCadastro {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  tipoPessoa: TipoPessoa;
  cpf: string;
  cnpj: string;
  telefone: string;
  empresaNome: string;
  aceitarTermos: boolean;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ initialAba }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [abaAtiva, setAbaAtiva] = useState<OrigemAuth>(initialAba);
  const [ladoAtivo, setLadoAtivo] = useState<OrigemAuth>(initialAba);

  const [dadosLogin, setDadosLogin] = useState({
    email: '',
    senha: '',
  });
  const [mostrarSenhaLogin, setMostrarSenhaLogin] = useState(false);
  const [carregandoLogin, setCarregandoLogin] = useState(false);

  const [dadosCadastro, setDadosCadastro] = useState<FormCadastro>({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    tipoPessoa: 'FISICA',
    cpf: '',
    cnpj: '',
    telefone: '',
    empresaNome: '',
    aceitarTermos: false,
  });
  const [mostrarSenhaCadastro, setMostrarSenhaCadastro] = useState(false);
  const [mostrarConfirmacaoCadastro, setMostrarConfirmacaoCadastro] = useState(false);
  const [carregandoCadastro, setCarregandoCadastro] = useState(false);

  useEffect(() => {
    setAbaAtiva(initialAba);
    setLadoAtivo(initialAba);
  }, [initialAba]);

  const ativarLado = (lado: OrigemAuth) => {
    setAbaAtiva(lado);
    if (lado !== ladoAtivo) {
      setLadoAtivo(lado);
    }
  };

  const enviarLogin = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setCarregandoLogin(true);

    try {
      const response = await login(dadosLogin);
      toast({
        title: 'Login realizado com sucesso!',
        description: `Bem-vindo, ${response.usuario?.nome || 'usuário'}!`,
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
      let mensagem = 'Erro interno do servidor';
      if (error instanceof ApiError) {
        if (error.status === 401) mensagem = 'Email ou senha incorretos';
        else if (error.status === 403) mensagem = 'Conta inativa ou assinatura vencida';
        else mensagem = error.message;
      }
      toast({ title: 'Erro no login', description: mensagem, variant: 'destructive' });
    } finally {
      setCarregandoLogin(false);
    }
  };

  const enviarCadastro = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setCarregandoCadastro(true);

    if (dadosCadastro.senha !== dadosCadastro.confirmarSenha) {
      toast({ title: 'Erro de validação', description: 'As senhas não coincidem', variant: 'destructive' });
      setCarregandoCadastro(false);
      return;
    }
    if (!dadosCadastro.aceitarTermos) {
      toast({ title: 'Erro de validação', description: 'Você deve aceitar os termos de uso', variant: 'destructive' });
      setCarregandoCadastro(false);
      return;
    }
    if (dadosCadastro.tipoPessoa === 'FISICA' && !dadosCadastro.cpf.trim()) {
      toast({ title: 'Erro de validação', description: 'O CPF é obrigatório para pessoa física', variant: 'destructive' });
      setCarregandoCadastro(false);
      return;
    }
    if (dadosCadastro.tipoPessoa === 'JURIDICA' && !dadosCadastro.cnpj.trim()) {
      toast({ title: 'Erro de validação', description: 'O CNPJ é obrigatório para pessoa jurídica', variant: 'destructive' });
      setCarregandoCadastro(false);
      return;
    }
    if (dadosCadastro.tipoPessoa === 'JURIDICA' && !dadosCadastro.empresaNome.trim()) {
      toast({ title: 'Erro de validação', description: 'O nome da empresa é obrigatório para pessoa jurídica', variant: 'destructive' });
      setCarregandoCadastro(false);
      return;
    }

    try {
      const response = await register({
        nome: dadosCadastro.nome,
        email: dadosCadastro.email,
        senha: dadosCadastro.senha,
        telefone: dadosCadastro.telefone || undefined,
        tipoPessoa: dadosCadastro.tipoPessoa,
        cpf: dadosCadastro.tipoPessoa === 'FISICA' ? dadosCadastro.cpf : undefined,
        cnpj: dadosCadastro.tipoPessoa === 'JURIDICA' ? dadosCadastro.cnpj : undefined,
        empresaNome: dadosCadastro.empresaNome || undefined,
      });
      toast({
        title: 'Conta criada com sucesso!',
        description: `Bem-vindo ao VisionCRM, ${response.usuario?.nome || 'usuário'}!`,
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro no cadastro:', error);
      let mensagem = 'Erro interno do servidor';
      if (error instanceof ApiError) {
        if (error.status === 400) mensagem = error.message || 'Dados inválidos';
        else mensagem = error.message;
      }
      toast({ title: 'Erro no cadastro', description: mensagem, variant: 'destructive' });
    } finally {
      setCarregandoCadastro(false);
    }
  };

  const renderLoginForm = (mostrarTroca: boolean) => (
    <form onSubmit={enviarLogin} className="space-y-4" onFocusCapture={() => ativarLado('login')}>
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="seu@email.com"
          value={dadosLogin.email}
          onChange={(evento) => setDadosLogin((anterior) => ({ ...anterior, email: evento.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-senha">Senha</Label>
        <div className="relative">
          <Input
            id="login-senha"
            type={mostrarSenhaLogin ? 'text' : 'password'}
            placeholder="Digite sua senha"
            value={dadosLogin.senha}
            onChange={(evento) => setDadosLogin((anterior) => ({ ...anterior, senha: evento.target.value }))}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setMostrarSenhaLogin((atual) => !atual)}
          >
            {mostrarSenhaLogin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <button type="button" className="text-blue-600 hover:underline font-medium" onClick={() => ativarLado('register')}>
          Não tem conta? Cadastre-se
        </button>
        <Link to="/forgot-password" className="text-muted-foreground hover:underline">
          Esqueceu a senha?
        </Link>
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={carregandoLogin}>
        {carregandoLogin ? 'Entrando...' : 'Entrar'}
      </Button>

      {mostrarTroca ? (
        <p className="text-center text-sm text-muted-foreground">
          Ainda não tem conta?{' '}
          <button type="button" onClick={() => ativarLado('register')} className="text-blue-600 hover:underline font-medium">
            Cadastrar
          </button>
        </p>
      ) : null}
    </form>
  );

  const renderCadastroForm = (mostrarTroca: boolean) => (
    <form onSubmit={enviarCadastro} className="space-y-4" onFocusCapture={() => ativarLado('register')}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cadastro-nome">Nome do usuário principal</Label>
          <Input
            id="cadastro-nome"
            type="text"
            placeholder="Seu nome completo"
            value={dadosCadastro.nome}
            onChange={(evento) => setDadosCadastro((anterior) => ({ ...anterior, nome: evento.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cadastro-email">Email</Label>
          <Input
            id="cadastro-email"
            type="email"
            placeholder="seu@email.com"
            value={dadosCadastro.email}
            onChange={(evento) => setDadosCadastro((anterior) => ({ ...anterior, email: evento.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cadastro-telefone">Telefone (opcional)</Label>
          <Input
            id="cadastro-telefone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={dadosCadastro.telefone}
            onChange={(evento) => setDadosCadastro((anterior) => ({ ...anterior, telefone: evento.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Tipo de pessoa</Label>
          <RadioGroup
            value={dadosCadastro.tipoPessoa}
            onValueChange={(value) => setDadosCadastro((anterior) => ({ ...anterior, tipoPessoa: value as TipoPessoa }))}
            className="flex gap-3 pt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="FISICA" id="tipo-fisica" />
              <Label htmlFor="tipo-fisica" className="text-sm font-normal">Pessoa física</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="JURIDICA" id="tipo-juridica" />
              <Label htmlFor="tipo-juridica" className="text-sm font-normal">Pessoa jurídica</Label>
            </div>
          </RadioGroup>
        </div>

        {dadosCadastro.tipoPessoa === 'FISICA' ? (
          <div className="space-y-2">
            <Label htmlFor="cadastro-cpf">CPF</Label>
            <Input
              id="cadastro-cpf"
              type="text"
              placeholder="000.000.000-00"
              value={dadosCadastro.cpf}
              onChange={(evento) => setDadosCadastro((anterior) => ({ ...anterior, cpf: evento.target.value }))}
              required
            />
          </div>
        ) : null}

        {dadosCadastro.tipoPessoa === 'JURIDICA' ? (
          <div className="space-y-2">
            <Label htmlFor="cadastro-cnpj">CNPJ</Label>
            <Input
              id="cadastro-cnpj"
              type="text"
              placeholder="00.000.000/0000-00"
              value={dadosCadastro.cnpj}
              onChange={(evento) => setDadosCadastro((anterior) => ({ ...anterior, cnpj: evento.target.value }))}
              required
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="cadastro-empresaNome">
            {dadosCadastro.tipoPessoa === 'JURIDICA' ? 'Nome da empresa' : 'Nome da empresa (opcional)'}
          </Label>
          <Input
            id="cadastro-empresaNome"
            type="text"
            placeholder="Nome da sua empresa"
            value={dadosCadastro.empresaNome}
            onChange={(evento) => setDadosCadastro((anterior) => ({ ...anterior, empresaNome: evento.target.value }))}
            required={dadosCadastro.tipoPessoa === 'JURIDICA'}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cadastro-senha">Senha</Label>
          <div className="relative">
            <Input
              id="cadastro-senha"
              type={mostrarSenhaCadastro ? 'text' : 'password'}
              placeholder="Crie uma senha segura"
              value={dadosCadastro.senha}
              onChange={(evento) => setDadosCadastro((anterior) => ({ ...anterior, senha: evento.target.value }))}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setMostrarSenhaCadastro((atual) => !atual)}
            >
              {mostrarSenhaCadastro ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cadastro-confirmarSenha">Confirmar senha</Label>
          <div className="relative">
            <Input
              id="cadastro-confirmarSenha"
              type={mostrarConfirmacaoCadastro ? 'text' : 'password'}
              placeholder="Confirme sua senha"
              value={dadosCadastro.confirmarSenha}
              onChange={(evento) => setDadosCadastro((anterior) => ({ ...anterior, confirmarSenha: evento.target.value }))}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setMostrarConfirmacaoCadastro((atual) => !atual)}
            >
              {mostrarConfirmacaoCadastro ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="cadastro-aceitarTermos"
          checked={dadosCadastro.aceitarTermos}
          onCheckedChange={(checked) => setDadosCadastro((anterior) => ({ ...anterior, aceitarTermos: checked as boolean }))}
        />
        <Label htmlFor="cadastro-aceitarTermos" className="text-sm leading-5">
          Aceito os <Link to="/terms" className="text-blue-600 hover:underline">termos de uso</Link> e{' '}
          <Link to="/privacy" className="text-blue-600 hover:underline">política de privacidade</Link>
        </Label>
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={carregandoCadastro}>
        {carregandoCadastro ? 'Criando conta...' : 'Criar conta'}
      </Button>

      {mostrarTroca ? (
        <p className="text-center text-sm text-muted-foreground">
          Já possui conta?{' '}
          <button type="button" onClick={() => ativarLado('login')} className="text-blue-600 hover:underline font-medium">
            Logar
          </button>
        </p>
      ) : null}
    </form>
  );

  const cardBase = 'relative z-10 border-0 md:backdrop-blur-sm transition-all duration-300';
  const cardInativo = 'bg-white/40 shadow-none hover:bg-white/50';
  const cardAtivo = 'bg-white shadow-[0_14px_34px_rgba(15,23,42,0.16)]';

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 flex items-center justify-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.1),transparent_42%),radial-gradient(circle_at_80%_85%,rgba(59,130,246,0.15),transparent_35%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl p-4 md:p-6 z-10">
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="border border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
          >
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>

        <div className="mb-8 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200 mb-2">
            VisionCRM
          </p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl mb-3">
            Construa relacionamentos, acelere vendas
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg">
            Entre para continuar sua operação ou crie sua conta e comece a organizar seu processo comercial.
          </p>
        </div>

        <div className="md:hidden">
          <Tabs value={abaAtiva} onValueChange={(value) => ativarLado(value as OrigemAuth)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/20 text-white border border-white/20">
              <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-blue-900">Logar</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:text-blue-900">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <Card className="border-0 bg-white shadow-xl">
                <CardHeader>
                  <CardTitle className="text-center text-2xl tracking-tight text-slate-900">Logar</CardTitle>
                  <p className="text-center text-sm text-slate-600">
                    Acesse sua rotina comercial e acompanhe suas oportunidades em tempo real.
                  </p>
                </CardHeader>
                <CardContent>{renderLoginForm(true)}</CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <Card className="border-0 bg-white shadow-xl">
                <CardHeader>
                  <CardTitle className="text-center text-2xl tracking-tight text-slate-900">Cadastrar</CardTitle>
                  <p className="text-center text-sm text-slate-600">
                    Crie sua conta e centralize clientes, tarefas e negociações em um só lugar.
                  </p>
                </CardHeader>
                <CardContent>{renderCadastroForm(true)}</CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden md:block">
          <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-[0_28px_70px_rgba(0,0,0,0.3)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0">
              <div
                className={cn(
                  'absolute bottom-0 left-0 top-0 w-1/2 bg-white shadow-xl transition-transform duration-500 ease-out z-0',
                  ladoAtivo === 'login' ? 'translate-x-full' : 'translate-x-0'
                )}
              />
            </div>

            <div className="relative grid grid-cols-2 gap-0">
              <div
                className={cn(
                  'relative z-10 p-6 transition-colors duration-300',
                  ladoAtivo === 'register' ? 'text-slate-900' : 'text-white'
                )}
                onClick={() => ativarLado('register')}
              >
                <div className={cn("transition-opacity duration-300", ladoAtivo === 'register' ? 'opacity-100' : 'opacity-70 hover:opacity-100 cursor-pointer')}>
                  <div className="mb-6 text-center">
                     <h2 className="text-2xl font-bold tracking-tight">Cadastrar</h2>
                     <p className={cn("text-sm mt-1", ladoAtivo === 'register' ? "text-slate-600" : "text-blue-100")}>
                        Dê o primeiro passo para estruturar sua operação.
                     </p>
                  </div>
                  {ladoAtivo === 'register' ? (
                     <div className="animate-in fade-in zoom-in duration-300">
                        {renderCadastroForm(false)}
                     </div>
                  ) : (
                     <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-4">
                        <p>Clique aqui para criar sua conta</p>
                        <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900 bg-transparent">
                          Criar Conta
                        </Button>
                     </div>
                  )}
                </div>
              </div>

              <div
                className={cn(
                  'relative z-10 p-6 transition-colors duration-300',
                  ladoAtivo === 'login' ? 'text-slate-900' : 'text-white'
                )}
                onClick={() => ativarLado('login')}
              >
                <div className={cn("transition-opacity duration-300", ladoAtivo === 'login' ? 'opacity-100' : 'opacity-70 hover:opacity-100 cursor-pointer')}>
                  <div className="mb-6 text-center">
                     <h2 className="text-2xl font-bold tracking-tight">Logar</h2>
                     <p className={cn("text-sm mt-1", ladoAtivo === 'login' ? "text-slate-600" : "text-blue-100")}>
                        Retome seu pipeline e feche oportunidades.
                     </p>
                  </div>
                  {ladoAtivo === 'login' ? (
                     <div className="animate-in fade-in zoom-in duration-300">
                        {renderLoginForm(false)}
                     </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-4">
                        <p>Já tem uma conta?</p>
                        <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900 bg-transparent">
                          Fazer Login
                        </Button>
                     </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
