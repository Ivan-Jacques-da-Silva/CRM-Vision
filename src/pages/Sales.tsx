
import React from 'react';
import { KanbanBoard } from '@/components/sales/KanbanBoard';
import { Target, TrendingUp, DollarSign } from 'lucide-react';

export const Sales = () => {
  return (
    <div className="space-y-4">
      {/* Compact Header with Stats */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Pipeline de Vendas
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gerencie suas oportunidades e acompanhe o progresso
            </p>
          </div>
          
          {/* Compact Stats */}
          <div className="flex gap-2 sm:gap-3">
            <div className="glass-card rounded-lg p-2 sm:p-3 interactive-element group min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Pipeline</p>
                  <p className="text-xs sm:text-sm font-bold text-green-500">R$ 45k</p>
                </div>
              </div>
            </div>
            
            <div className="glass-card rounded-lg p-2 sm:p-3 interactive-element group min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Conversão</p>
                  <p className="text-xs sm:text-sm font-bold text-blue-500">68%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board - Now with more focus */}
      <div className="slide-up">
        <KanbanBoard />
      </div>
    </div>
  );
};
