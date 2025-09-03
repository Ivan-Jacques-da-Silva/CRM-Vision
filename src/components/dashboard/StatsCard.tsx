
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  icon: React.ElementType;
  iconClassName?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  trend,
  trendValue,
  icon: Icon,
  iconClassName
}) => {
  return (
    <Card className="glass-card card-hover morphing-border group relative overflow-hidden">
      {/* Simplified background element */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
          {title}
        </CardTitle>
        <div className={cn(
          "p-3 rounded-xl transition-all duration-300 glass-card", 
          iconClassName
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold text-foreground mb-2">
          {value}
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
            {description}
          </p>
          {trend && trendValue && (
            <Badge 
              variant={trend === 'up' ? 'default' : 'destructive'}
              className="flex items-center gap-1 text-xs glass-card"
            >
              {trend === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trendValue}
            </Badge>
          )}
        </div>
        
        {/* Simplified decorative dot */}
        <div className="absolute bottom-2 right-2 w-2 h-2 bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </CardContent>
    </Card>
  );
};
