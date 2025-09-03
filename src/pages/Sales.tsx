
import React, { useState } from 'react';
import { KanbanBoard } from '@/components/sales/KanbanBoard';
import { NewOpportunityDialog } from '@/components/sales/NewOpportunityDialog';
import { Button } from '@/components/ui/button';
import { Plus, Target, TrendingUp, DollarSign } from 'lucide-react';

export const Sales = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleNewOpportunity = (data: any) => {
    console.log('Nova oportunidade:', data);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header Section with Stats */}
      <div className="glass-card rounded-2xl p-6 sparkle-effect morphing-border">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              Pipeline de Vendas
            </h1>
            <p className="text-muted-foreground text-lg">
              Gerencie suas oportunidades de vendas e acompanhe o progresso em tempo real
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="glass-card rounded-lg p-4 interactive-element group">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Pipeline</p>
                  <p className="text-xl font-bold text-green-500">R$ 45.000</p>
                </div>
              </div>
            </div>
            
            <div className="glass-card rounded-lg p-4 interactive-element group">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-sm text-muted-foreground">Taxa Conversão</p>
                  <p className="text-xl font-bold text-blue-500">68%</p>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="glass-button shine-effect interactive-element morphing-border"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nova Oportunidade
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="slide-up">
        <KanbanBoard />
      </div>

      <NewOpportunityDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleNewOpportunity}
        clientes={[]}
      />
    </div>
  );
};
