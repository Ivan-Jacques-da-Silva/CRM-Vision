
/**
 * Página de Chat Centralizado
 * Centraliza todas as conversas do Facebook, Instagram e WhatsApp
 */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Send, Facebook, Instagram, MessageCircle, Phone, Video, MoreHorizontal } from 'lucide-react';

interface Conversa {
  id: string;
  contato: {
    nome: string;
    avatar?: string;
    plataforma: 'facebook' | 'instagram' | 'whatsapp';
  };
  ultimaMensagem: {
    texto: string;
    horario: Date;
    enviada: boolean;
  };
  naoLidas: number;
  status: 'ativo' | 'arquivado' | 'pausado';
}

interface Mensagem {
  id: string;
  texto: string;
  horario: Date;
  enviada: boolean;
  status?: 'enviando' | 'enviada' | 'lida';
}

const mockConversas: Conversa[] = [
  {
    id: '1',
    contato: {
      nome: 'João Silva',
      avatar: '/placeholder.svg',
      plataforma: 'whatsapp',
    },
    ultimaMensagem: {
      texto: 'Oi, gostaria de saber mais sobre os produtos',
      horario: new Date('2024-06-11T14:30:00'),
      enviada: false,
    },
    naoLidas: 2,
    status: 'ativo',
  },
  {
    id: '2',
    contato: {
      nome: 'Maria Costa',
      avatar: '/placeholder.svg',
      plataforma: 'instagram',
    },
    ultimaMensagem: {
      texto: 'Obrigada pelo atendimento!',
      horario: new Date('2024-06-11T13:45:00'),
      enviada: false,
    },
    naoLidas: 0,
    status: 'ativo',
  },
  {
    id: '3',
    contato: {
      nome: 'Pedro Santos',
      avatar: '/placeholder.svg',
      plataforma: 'facebook',
    },
    ultimaMensagem: {
      texto: 'Quando vocês abrem?',
      horario: new Date('2024-06-11T12:20:00'),
      enviada: false,
    },
    naoLidas: 1,
    status: 'ativo',
  },
];

const mockMensagens: { [key: string]: Mensagem[] } = {
  '1': [
    {
      id: '1',
      texto: 'Oi, gostaria de saber mais sobre os produtos',
      horario: new Date('2024-06-11T14:30:00'),
      enviada: false,
    },
    {
      id: '2',
      texto: 'Olá! Claro, ficarei feliz em ajudar. Que tipo de produto você está procurando?',
      horario: new Date('2024-06-11T14:32:00'),
      enviada: true,
      status: 'lida',
    },
  ],
  '2': [
    {
      id: '3',
      texto: 'Muito obrigada pelo excelente atendimento!',
      horario: new Date('2024-06-11T13:45:00'),
      enviada: false,
    },
  ],
  '3': [
    {
      id: '4',
      texto: 'Quando vocês abrem?',
      horario: new Date('2024-06-11T12:20:00'),
      enviada: false,
    },
  ],
};

export function Chat() {
  const [conversas, setConversas] = useState<Conversa[]>(mockConversas);
  const [conversaSelecionada, setConversaSelecionada] = useState<string>('1');
  const [mensagens, setMensagens] = useState<{ [key: string]: Mensagem[] }>(mockMensagens);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroPlataforma, setFiltroPlataforma] = useState<'todas' | 'whatsapp' | 'instagram' | 'facebook'>('todas');

  const getPlataformaIcon = (plataforma: string) => {
    switch (plataforma) {
      case 'whatsapp':
        return <MessageCircle className="h-4 w-4 text-green-600" />;
      case 'instagram':
        return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'facebook':
        return <Facebook className="h-4 w-4 text-blue-600" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getPlataformaColor = (plataforma: string) => {
    switch (plataforma) {
      case 'whatsapp':
        return 'bg-green-50 border-green-200';
      case 'instagram':
        return 'bg-pink-50 border-pink-200';
      case 'facebook':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const conversasFiltradas = conversas.filter(conversa => {
    const matchesSearch = conversa.contato.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlataforma = filtroPlataforma === 'todas' || conversa.contato.plataforma === filtroPlataforma;
    return matchesSearch && matchesPlataforma;
  });

  const conversaAtual = conversas.find(c => c.id === conversaSelecionada);
  const mensagensAtuais = mensagens[conversaSelecionada] || [];

  const formatarHorario = (data: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(data);
  };

  const enviarMensagem = () => {
    if (!novaMensagem.trim()) return;

    const novaMens: Mensagem = {
      id: Date.now().toString(),
      texto: novaMensagem,
      horario: new Date(),
      enviada: true,
      status: 'enviando',
    };

    setMensagens(prev => ({
      ...prev,
      [conversaSelecionada]: [...(prev[conversaSelecionada] || []), novaMens],
    }));

    setNovaMensagem('');

    // Simular envio
    setTimeout(() => {
      setMensagens(prev => ({
        ...prev,
        [conversaSelecionada]: prev[conversaSelecionada].map(m =>
          m.id === novaMens.id ? { ...m, status: 'enviada' } : m
        ),
      }));
    }, 1000);
  };

  const totalNaoLidas = conversas.reduce((total, conversa) => total + conversa.naoLidas, 0);

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Lista de Conversas */}
      <div className="w-80 border-r bg-background flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Chat Centralizado</h2>
            {totalNaoLidas > 0 && (
              <Badge variant="destructive">{totalNaoLidas}</Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Tabs value={filtroPlataforma} onValueChange={(value) => setFiltroPlataforma(value as any)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="todas">Todas</TabsTrigger>
                <TabsTrigger value="whatsapp">
                  <MessageCircle className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="instagram">
                  <Instagram className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="facebook">
                  <Facebook className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversasFiltradas.map((conversa) => (
            <div
              key={conversa.id}
              className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors ${
                conversaSelecionada === conversa.id ? 'bg-accent' : ''
              }`}
              onClick={() => setConversaSelecionada(conversa.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conversa.contato.avatar} />
                    <AvatarFallback>
                      {conversa.contato.nome.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-white ${getPlataformaColor(conversa.contato.plataforma)}`}>
                    {getPlataformaIcon(conversa.contato.plataforma)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{conversa.contato.nome}</h3>
                    <span className="text-xs text-muted-foreground">
                      {formatarHorario(conversa.ultimaMensagem.horario)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {conversa.ultimaMensagem.texto}
                  </p>
                  {conversa.naoLidas > 0 && (
                    <Badge variant="destructive" className="mt-2 text-xs">
                      {conversa.naoLidas}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {conversaAtual ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conversaAtual.contato.avatar} />
                    <AvatarFallback>
                      {conversaAtual.contato.nome.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{conversaAtual.contato.nome}</h3>
                    <div className="flex items-center space-x-1">
                      {getPlataformaIcon(conversaAtual.contato.plataforma)}
                      <span className="text-sm text-muted-foreground capitalize">
                        {conversaAtual.contato.plataforma}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mensagensAtuais.map((mensagem) => (
                <div
                  key={mensagem.id}
                  className={`flex ${mensagem.enviada ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      mensagem.enviada
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{mensagem.texto}</p>
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      <span className="text-xs opacity-70">
                        {formatarHorario(mensagem.horario)}
                      </span>
                      {mensagem.enviada && mensagem.status && (
                        <span className="text-xs opacity-70">
                          {mensagem.status === 'enviando' && '⏳'}
                          {mensagem.status === 'enviada' && '✓'}
                          {mensagem.status === 'lida' && '✓✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-background">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
                  className="flex-1"
                />
                <Button onClick={enviarMensagem} disabled={!novaMensagem.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium">Selecione uma conversa</h3>
              <p className="text-muted-foreground">
                Escolha uma conversa para começar a chatear
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
