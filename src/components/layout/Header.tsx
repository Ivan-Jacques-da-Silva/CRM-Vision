
import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Bell, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  buscarTarefas,
  type Tarefa,
  buscarGlobal,
  type ResultadoBuscaGlobal,
} from '@/services/api';
import logo from '@/assets/VisionCRM_Logo.png';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [tarefasNotificacao, setTarefasNotificacao] = useState<Tarefa[]>([]);
  const [carregandoTarefas, setCarregandoTarefas] = useState(false);
  const [resultadosBusca, setResultadosBusca] = useState<ResultadoBuscaGlobal | null>(null);
  const [carregandoBusca, setCarregandoBusca] = useState(false);
  const [erroBusca, setErroBusca] = useState<string | null>(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const buscaTimeoutRef = useRef<number | null>(null);

  const calcularDatasAlvo = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const diaSemana = hoje.getDay();

    const adicionarDias = (base: Date, dias: number) => {
      const d = new Date(base.getTime());
      d.setDate(d.getDate() + dias);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    if (diaSemana >= 1 && diaSemana <= 4) {
      return [hoje, adicionarDias(hoje, 1)];
    }

    if (diaSemana === 5) {
      return [hoje, adicionarDias(hoje, 3)];
    }

    if (diaSemana === 6) {
      return [adicionarDias(hoje, 2)];
    }

    return [adicionarDias(hoje, 1)];
  };

  const obterTextoPeriodo = (tarefas: Tarefa[]) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const diaSemana = hoje.getDay();

    const normalizarData = (valor: string | undefined) => {
      if (!valor) return null;
      const d = new Date(valor);
      if (Number.isNaN(d.getTime())) return null;
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };

    const hasDiaComOffset = (offset: number) => {
      const alvo = new Date(hoje.getTime());
      alvo.setDate(alvo.getDate() + offset);
      alvo.setHours(0, 0, 0, 0);
      const alvoTime = alvo.getTime();
      return tarefas.some((tarefa) => normalizarData(tarefa.dataVencimento)?.valueOf() === alvoTime);
    };

    if (diaSemana >= 1 && diaSemana <= 4) {
      const temHoje = hasDiaComOffset(0);
      const temAmanha = hasDiaComOffset(1);
      if (temHoje && temAmanha) return 'hoje e amanhã';
      if (temHoje) return 'hoje';
      if (temAmanha) return 'amanhã';
      return 'hoje e amanhã';
    }

    if (diaSemana === 5) {
      const temHoje = hasDiaComOffset(0);
      const temSegunda = hasDiaComOffset(3);
      if (temHoje && temSegunda) return 'hoje e segunda-feira';
      if (temHoje) return 'hoje';
      if (temSegunda) return 'segunda-feira';
      return 'hoje e segunda-feira';
    }

    if (diaSemana === 6) {
      const temSegunda = hasDiaComOffset(2);
      return temSegunda ? 'segunda-feira' : 'segunda-feira';
    }

    const temSegunda = hasDiaComOffset(1);
    return temSegunda ? 'segunda-feira' : 'segunda-feira';
  };

  useEffect(() => {
    const carregar = async () => {
      try {
        setCarregandoTarefas(true);
        const resposta = await buscarTarefas();
        const lista: Tarefa[] = Array.isArray(resposta) ? resposta : resposta?.tarefas || [];

        const datasAlvo = calcularDatasAlvo();

        const tarefasFiltradas = lista.filter((tarefa) => {
          if (!tarefa.dataVencimento) return false;

          if (tarefa.status === 'CONCLUIDA' || tarefa.status === 'CANCELADA') {
            return false;
          }

          const data = new Date(tarefa.dataVencimento);
          if (Number.isNaN(data.getTime())) return false;
          data.setHours(0, 0, 0, 0);

          return datasAlvo.some((alvo) => alvo.getTime() === data.getTime());
        });

        setTarefasNotificacao(tarefasFiltradas);
      } catch (error) {
        console.error('Erro ao carregar tarefas para notificações:', error);
      } finally {
        setCarregandoTarefas(false);
      }
    };

    carregar();
  }, []);

  const quantidadeTarefas = tarefasNotificacao.length;
  const textoPeriodo = obterTextoPeriodo(tarefasNotificacao);

  const executarBuscaGlobal = async (termo: string) => {
    const valor = termo.trim();
    if (!valor) {
      setResultadosBusca(null);
      setMostrarResultados(false);
      return;
    }

    try {
      setCarregandoBusca(true);
      setErroBusca(null);
      const resultados = await buscarGlobal(valor);
      setResultadosBusca(resultados);
      setMostrarResultados(true);
    } catch (error) {
      console.error('Erro ao buscar dados globais:', error);
      setErroBusca('Erro ao buscar. Tente novamente.');
      setMostrarResultados(true);
    } finally {
      setCarregandoBusca(false);
    }
  };

  const handleChangeSearch = (valor: string) => {
    setSearchValue(valor);

    if (buscaTimeoutRef.current) {
      window.clearTimeout(buscaTimeoutRef.current);
    }

    const termo = valor.trim();

    if (termo.length < 2) {
      setResultadosBusca(null);
      setMostrarResultados(false);
      setErroBusca(null);
      return;
    }

    buscaTimeoutRef.current = window.setTimeout(() => {
      executarBuscaGlobal(termo);
    }, 500);
  };

  const handleKeyDownSearch: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      executarBuscaGlobal(searchValue);
    }
  };

  const handleClickResultado = (tipo: 'cliente' | 'tarefa' | 'oportunidade') => {
    if (tipo === 'cliente') {
      navigate('/clients');
    } else if (tipo === 'tarefa') {
      navigate('/tasks');
    } else if (tipo === 'oportunidade') {
      navigate('/sales');
    }
    setMostrarResultados(false);
  };

  return (
    <header className="sticky top-0 z-40 h-16 glass-card border-b border-white/20 dark:border-gray-700/20 flex items-center justify-between px-4 md:px-6 sparkle-effect">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="mr-2 glass-button hover-fix interactive-element"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="hidden md:flex items-center animate-fade-in">
          <img
            src={logo}
            alt="VisionCRM"
            className="h-12 w-auto invert dark:invert-0"
          />
        </div>
      </div>
      
      <div className="flex-1 max-w-md mx-4 slide-up">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
          <Input
            type="search"
            name="global-search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            data-1p-ignore="true"
            data-lpignore="true"
            placeholder="Buscar clientes, tarefas, oportunidades..."
            className="pl-9 glass-card border-white/30 dark:border-gray-600/30 focus:ring-2 focus:ring-primary/50 hover-fix interactive-element"
            value={searchValue}
            onChange={(e) => handleChangeSearch(e.target.value)}
            onKeyDown={handleKeyDownSearch}
          />
          {mostrarResultados && (
            <div className="absolute left-0 right-0 mt-2 max-h-80 overflow-auto glass-card border border-white/30 dark:border-gray-600/30 rounded-lg shadow-lg z-20">
              {carregandoBusca && (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  Buscando resultados...
                </div>
              )}
              {!carregandoBusca && erroBusca && (
                <div className="px-3 py-2 text-xs text-destructive">{erroBusca}</div>
              )}
              {!carregandoBusca && !erroBusca && resultadosBusca && (
                <>
                  {resultadosBusca.clientes.length === 0 &&
                    resultadosBusca.tarefas.length === 0 &&
                    resultadosBusca.oportunidades.length === 0 && (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        Nenhum resultado encontrado para "{searchValue}".
                      </div>
                    )}

                  {resultadosBusca.clientes.length > 0 && (
                    <div>
                      <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase text-muted-foreground">
                        Clientes
                      </div>
                      {resultadosBusca.clientes.slice(0, 5).map((cliente) => (
                        <button
                          key={cliente.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-xs hover:bg-accent/60 cursor-pointer flex flex-col gap-0.5"
                          onClick={() => handleClickResultado('cliente')}
                        >
                          <span className="font-medium truncate">{cliente.nome}</span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            {cliente.nomeEmpresa || cliente.email}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {resultadosBusca.tarefas.length > 0 && (
                    <div>
                      <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase text-muted-foreground">
                        Tarefas
                      </div>
                      {resultadosBusca.tarefas.slice(0, 5).map((tarefa) => (
                        <button
                          key={tarefa.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-xs hover:bg-accent/60 cursor-pointer flex flex-col gap-0.5"
                          onClick={() => handleClickResultado('tarefa')}
                        >
                          <span className="font-medium truncate">{tarefa.titulo}</span>
                          {tarefa.descricao && (
                            <span className="text-[10px] text-muted-foreground line-clamp-1">
                              {tarefa.descricao}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {resultadosBusca.oportunidades.length > 0 && (
                    <div>
                      <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase text-muted-foreground">
                        Oportunidades
                      </div>
                      {resultadosBusca.oportunidades.slice(0, 5).map((oportunidade) => (
                        <button
                          key={oportunidade.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-xs hover:bg-accent/60 cursor-pointer flex flex-col gap-0.5"
                          onClick={() => handleClickResultado('oportunidade')}
                        >
                          <span className="font-medium truncate">{oportunidade.titulo}</span>
                          {oportunidade.cliente && (
                            <span className="text-[10px] text-muted-foreground truncate">
                              {oportunidade.cliente.nomeEmpresa || oportunidade.cliente.nome}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative glass-button hover-fix interactive-element"
            >
              <Bell className="h-5 w-5" />
              {quantidadeTarefas > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center glow-effect floating-element">
                  {quantidadeTarefas > 9 ? '9+' : quantidadeTarefas}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 glass-card morphing-border fade-in-scale">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Tarefas próximas</h4>
              {carregandoTarefas ? (
                <p className="text-xs text-muted-foreground">Carregando notificações...</p>
              ) : quantidadeTarefas === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhuma tarefa para {textoPeriodo}.
                </p>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">
                    {quantidadeTarefas} tarefa(s) para {textoPeriodo}.
                  </p>
                  <div className="divide-y divide-border/50">
                    {tarefasNotificacao.slice(0, 5).map((tarefa) => (
                      <div
                        key={tarefa.id}
                        className="py-2 hover-fix interactive-element rounded px-2"
                      >
                        <p className="text-sm font-medium">{tarefa.titulo}</p>
                        {tarefa.dataVencimento && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(tarefa.dataVencimento).toLocaleString('pt-BR', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="glass-button hover-fix interactive-element"
        >
          {theme === 'dark' ? 
            <Sun className="h-5 w-5 animate-[spin_2s_linear_infinite]" /> : 
            <Moon className="h-5 w-5" />
          }
        </Button>
      </div>
    </header>
  );
};

export default Header;
