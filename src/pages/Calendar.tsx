
import React, { useEffect, useMemo, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, addDays, isSameDay, isWithinInterval, startOfWeek, endOfWeek, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarClock, Users, Phone, FileText, Filter, Search } from 'lucide-react';
import { buscarTarefas, type Tarefa } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const [statusFiltro, setStatusFiltro] = useState<'TODOS' | Tarefa['status']>('TODOS');
  const [prioridadeFiltro, setPrioridadeFiltro] = useState<'TODAS' | Tarefa['prioridade']>('TODAS');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    const carregarTarefas = async () => {
      try {
        setLoading(true);
        const response = await buscarTarefas();
        const lista = Array.isArray(response) ? response : response?.tarefas || [];
        setTarefas(lista);
      } catch (error) {
        console.error('Erro ao carregar tarefas para o calendário:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar tarefas da agenda',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    carregarTarefas();
  }, [toast]);

  const getEventPriority = (prioridade: Tarefa['prioridade']): 'high' | 'medium' | 'low' => {
    switch (prioridade) {
      case 'URGENTE':
      case 'ALTA':
        return 'high';
      case 'MEDIA':
        return 'medium';
      case 'BAIXA':
        return 'low';
      default:
        return 'medium';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Users className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'task':
        return <FileText className="h-4 w-4" />;
      default:
        return <CalendarClock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-slate-500';
    }
  };

  const tarefasDoDia = useMemo(() => {
    if (!selectedDate || loading) return [];
    return tarefas
      .filter((tarefa) => {
        const data = new Date(tarefa.dataVencimento);
        return format(data, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
      })
      .filter((tarefa) => tarefa.status === 'PENDENTE' || tarefa.status === 'EM_ANDAMENTO')
      .filter((tarefa) => (statusFiltro === 'TODOS' ? true : tarefa.status === statusFiltro))
      .filter((tarefa) => (prioridadeFiltro === 'TODAS' ? true : tarefa.prioridade === prioridadeFiltro))
      .filter((tarefa) => {
        if (!busca.trim()) return true;
        const texto = `${tarefa.titulo} ${tarefa.descricao || ''}`.toLowerCase();
        return texto.includes(busca.toLowerCase());
      })
      .sort((a, b) => {
        const ta = new Date(a.dataVencimento).getTime();
        const tb = new Date(b.dataVencimento).getTime();
        return ta - tb;
      });
  }, [selectedDate, loading, tarefas, statusFiltro, prioridadeFiltro, busca]);

  const gruposPorHora = useMemo(() => {
    const map = new Map<string, Tarefa[]>();
    tarefasDoDia.forEach((t) => {
      const hora = format(new Date(t.dataVencimento), 'HH');
      const arr = map.get(hora) || [];
      arr.push(t);
      map.set(hora, arr);
    });
    return Array.from(map.entries()).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [tarefasDoDia]);

  const tarefasFiltradasBase = useMemo(() => {
    return tarefas
      .filter((tarefa) => tarefa.status === 'PENDENTE' || tarefa.status === 'EM_ANDAMENTO')
      .filter((tarefa) => (statusFiltro === 'TODOS' ? true : tarefa.status === statusFiltro))
      .filter((tarefa) => (prioridadeFiltro === 'TODAS' ? true : tarefa.prioridade === prioridadeFiltro))
      .filter((tarefa) => {
        if (!busca.trim()) return true;
        const texto = `${tarefa.titulo} ${tarefa.descricao || ''}`.toLowerCase();
        return texto.includes(busca.toLowerCase());
      });
  }, [tarefas, statusFiltro, prioridadeFiltro, busca]);

  const hoje = useMemo(() => startOfDay(new Date()), []);

  const eventDates = useMemo(() => {
    const set = new Set<number>();
    tarefasFiltradasBase.forEach((t) => {
      const d = startOfDay(new Date(t.dataVencimento)).getTime();
      set.add(d);
    });
    return Array.from(set).map((ts) => new Date(ts));
  }, [tarefasFiltradasBase]);

  const tarefasHoje = useMemo(() => {
    return tarefasFiltradasBase
      .filter((t) => isSameDay(new Date(t.dataVencimento), hoje))
      .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime());
  }, [tarefasFiltradasBase, hoje]);

  const tarefasProximos3 = useMemo(() => {
    const start = addDays(hoje, 1);
    const end = addDays(hoje, 3);
    return tarefasFiltradasBase
      .filter((t) => isWithinInterval(new Date(t.dataVencimento), { start, end }))
      .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime());
  }, [tarefasFiltradasBase, hoje]);

  const tarefasProximaSemana = useMemo(() => {
    const nextWeekStart = startOfWeek(addDays(hoje, 7), { weekStartsOn: 1 });
    const nextWeekEnd = endOfWeek(addDays(hoje, 7), { weekStartsOn: 1 });
    return tarefasFiltradasBase
      .filter((t) => isWithinInterval(new Date(t.dataVencimento), { start: nextWeekStart, end: nextWeekEnd }))
      .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime());
  }, [tarefasFiltradasBase, hoje]);

  const formatarPrioridade = (prioridade: Tarefa['prioridade']) => {
    switch (prioridade) {
      case 'URGENTE':
        return 'Urgente';
      case 'ALTA':
        return 'Alta';
      case 'MEDIA':
        return 'Média';
      case 'BAIXA':
        return 'Baixa';
      default:
        return prioridade;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
        <p className="text-muted-foreground">
          Gerencie seus compromissos e eventos importantes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Selecionar data</CardTitle>
            <CardDescription>Escolha o dia para ver as tarefas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              className="w-full"
              classNames={{
                month: 'w-full space-y-4',
                table: 'w-full border-collapse',
                head_row: 'grid grid-cols-7',
                row: 'mt-2 grid grid-cols-7',
                head_cell: 'text-muted-foreground rounded-md text-center text-[0.8rem]',
                cell: 'relative p-0 text-center text-sm [&>button]:h-11 [&>button]:w-full',
              }}
              modifiers={{ hasEvents: eventDates }}
              modifiersClassNames={{ hasEvents: 'bg-neutral-900 text-white hover:bg-neutral-950' }}
            />
          </CardContent>
        </Card>

        <Card className="xl:col-span-8">
          <CardHeader>
            <CardTitle>
              Eventos para {selectedDate ? format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR }) : 'hoje'}
            </CardTitle>
            <CardDescription>
              {loading ? 'Carregando agenda...' : `${tarefasDoDia.length} tarefa(s) para este dia`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>Filtros</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[180px_180px_1fr]">
                  <Select value={statusFiltro} onValueChange={(v) => setStatusFiltro(v as any)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODOS">Todos</SelectItem>
                      <SelectItem value="PENDENTE">Pendente</SelectItem>
                      <SelectItem value="EM_ANDAMENTO">Em andamento</SelectItem>
                      <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                      <SelectItem value="CANCELADA">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={prioridadeFiltro} onValueChange={(v) => setPrioridadeFiltro(v as any)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODAS">Todas</SelectItem>
                      <SelectItem value="URGENTE">Urgente</SelectItem>
                      <SelectItem value="ALTA">Alta</SelectItem>
                      <SelectItem value="MEDIA">Média</SelectItem>
                      <SelectItem value="BAIXA">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar por título ou descrição"
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              {!loading && tarefasDoDia.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma tarefa para esta data.
                </p>
              ) : (
                <>
                  <div className="space-y-3 md:hidden">
                    {tarefasDoDia.map((tarefa) => {
                      const prioridadeBadge = getEventPriority(tarefa.prioridade);
                      const hora = format(new Date(tarefa.dataVencimento), 'HH:mm');

                      return (
                        <div key={tarefa.id} className="rounded-lg border border-border/70 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2">
                              <div className="mt-0.5 rounded-full bg-muted p-1.5">
                                {getEventIcon('task')}
                              </div>
                              <div>
                                <p className="text-sm font-medium leading-tight">{tarefa.titulo}</p>
                                {tarefa.descricao && (
                                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                    {tarefa.descricao}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">{hora}</span>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <Badge variant="outline" className="text-[11px]">
                              {tarefa.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1 py-0 px-2 text-[11px]">
                              <span className={cn('h-2 w-2 rounded-full', getPriorityColor(prioridadeBadge))} />
                              <span>{formatarPrioridade(tarefa.prioridade)}</span>
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead className="hidden lg:table-cell">Status</TableHead>
                          <TableHead>Prioridade</TableHead>
                          <TableHead className="hidden lg:table-cell">Hora</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gruposPorHora.map(([horaGrupo, lista]) => (
                          <React.Fragment key={`grupo-${horaGrupo}`}>
                            <TableRow>
                              <TableCell colSpan={4} className="bg-muted/40 text-xs font-medium">
                                {horaGrupo}:00
                              </TableCell>
                            </TableRow>
                            {lista.map((tarefa) => {
                              const prioridadeBadge = getEventPriority(tarefa.prioridade);
                              const hora = format(new Date(tarefa.dataVencimento), 'HH:mm');
                              return (
                                <TableRow key={tarefa.id}>
                                  <TableCell>
                                    <div className="flex items-start gap-3">
                                      <div className="mt-0.5 bg-muted p-1.5 rounded-full">
                                        {getEventIcon('task')}
                                      </div>
                                      <div className="space-y-1">
                                        <div className="font-medium text-sm">{tarefa.titulo}</div>
                                        {tarefa.descricao && (
                                          <div className="text-xs text-muted-foreground line-clamp-2">
                                            {tarefa.descricao}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="hidden lg:table-cell">
                                    <Badge variant="outline">{tarefa.status.replace('_', ' ')}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="flex w-fit items-center gap-1 py-0 px-2">
                                      <span className={cn('w-2 h-2 rounded-full', getPriorityColor(prioridadeBadge))} />
                                      <span>{formatarPrioridade(tarefa.prioridade)}</span>
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="hidden lg:table-cell">{hora}</TableCell>
                                </TableRow>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-8">
          <CardHeader>
            <CardTitle>Resumo por período</CardTitle>
            <CardDescription>
              {loading ? 'Carregando...' : `Hoje: ${tarefasHoje.length} • Próximos 3 dias: ${tarefasProximos3.length} • Próxima semana: ${tarefasProximaSemana.length}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="text-sm font-medium">Hoje</div>
                {tarefasHoje.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Sem tarefas para hoje.</p>
                ) : (
                  <div className="space-y-3">
                    {tarefasHoje.map((tarefa) => {
                      const prioridadeBadge = getEventPriority(tarefa.prioridade);
                      const hora = format(new Date(tarefa.dataVencimento), 'HH:mm');
                      return (
                        <div key={tarefa.id} className="rounded-lg border border-border/70 p-3 flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5 rounded-full bg-muted p-1.5">
                              {getEventIcon('task')}
                            </div>
                            <div>
                              <p className="text-sm font-medium leading-tight">{tarefa.titulo}</p>
                              {tarefa.descricao && (
                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                  {tarefa.descricao}
                                </p>
                              )}
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant="outline" className="text-[11px]">
                                  {tarefa.status.replace('_', ' ')}
                                </Badge>
                                <Badge variant="outline" className="flex items-center gap-1 py-0 px-2 text-[11px]">
                                  <span className={cn('h-2 w-2 rounded-full', getPriorityColor(prioridadeBadge))} />
                                  <span>{formatarPrioridade(tarefa.prioridade)}</span>
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">{hora}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium">Próximos 3 dias</div>
                {tarefasProximos3.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Sem tarefas nos próximos 3 dias.</p>
                ) : (
                  <div className="space-y-3">
                    {tarefasProximos3.map((tarefa) => {
                      const prioridadeBadge = getEventPriority(tarefa.prioridade);
                      const data = new Date(tarefa.dataVencimento);
                      const dia = format(data, "dd/MM");
                      const hora = format(data, 'HH:mm');
                      return (
                        <div key={tarefa.id} className="rounded-lg border border-border/70 p-3 flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5 rounded-full bg-muted p-1.5">
                              {getEventIcon('task')}
                            </div>
                            <div>
                              <p className="text-sm font-medium leading-tight">{tarefa.titulo}</p>
                              {tarefa.descricao && (
                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                  {tarefa.descricao}
                                </p>
                              )}
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant="outline" className="text-[11px]">
                                  {tarefa.status.replace('_', ' ')}
                                </Badge>
                                <Badge variant="outline" className="flex items-center gap-1 py-0 px-2 text-[11px]">
                                  <span className={cn('h-2 w-2 rounded-full', getPriorityColor(prioridadeBadge))} />
                                  <span>{formatarPrioridade(tarefa.prioridade)}</span>
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">{dia} • {hora}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium">Próxima semana</div>
                {tarefasProximaSemana.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Sem tarefas na próxima semana.</p>
                ) : (
                  <div className="space-y-3">
                    {tarefasProximaSemana.map((tarefa) => {
                      const prioridadeBadge = getEventPriority(tarefa.prioridade);
                      const data = new Date(tarefa.dataVencimento);
                      const dia = format(data, "dd/MM");
                      const hora = format(data, 'HH:mm');
                      return (
                        <div key={tarefa.id} className="rounded-lg border border-border/70 p-3 flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5 rounded-full bg-muted p-1.5">
                              {getEventIcon('task')}
                            </div>
                            <div>
                              <p className="text-sm font-medium leading-tight">{tarefa.titulo}</p>
                              {tarefa.descricao && (
                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                  {tarefa.descricao}
                                </p>
                              )}
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant="outline" className="text-[11px]">
                                  {tarefa.status.replace('_', ' ')}
                                </Badge>
                                <Badge variant="outline" className="flex items-center gap-1 py-0 px-2 text-[11px]">
                                  <span className={cn('h-2 w-2 rounded-full', getPriorityColor(prioridadeBadge))} />
                                  <span>{formatarPrioridade(tarefa.prioridade)}</span>
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">{dia} • {hora}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
