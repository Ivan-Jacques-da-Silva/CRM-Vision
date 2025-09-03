
/**
 * Componente para configuração de idioma
 * Permite ao usuário selecionar o idioma padrão da plataforma
 */
import React from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { atualizarIdioma, buscarIdioma } from "@/services/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Globe } from "lucide-react";

/**
 * Interface para opções de idioma
 */
interface OpcaoIdioma {
  valor: string;
  rotulo: string;
}

/**
 * Opções de idioma disponíveis
 */
const opcoesDeLinguagem: OpcaoIdioma[] = [
  { valor: "pt-BR", rotulo: "Português (Brasil)" },
  { valor: "en-US", rotulo: "English (US)" },
];

/**
 * Esquema de validação para o formulário de idioma
 */
const formSchema = z.object({
  idioma: z.string({
    required_error: "Por favor selecione um idioma",
  }),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * Formulário para configuração de idioma
 */
export function LanguageSettings() {
  // Busca configuração de idioma atual
  const { data: idiomaAtual, isLoading } = useQuery({
    queryKey: ['idioma-usuario'],
    queryFn: buscarIdioma,
  });

  // Configuração do formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idioma: "pt-BR",
    },
    values: idiomaAtual ? { idioma: idiomaAtual.codigo } : undefined,
  });

  // Mutação para atualizar idioma
  const mutation = useMutation({
    mutationFn: (values: FormValues) => atualizarIdioma(values.idioma),
    onSuccess: () => {
      toast.success("Idioma atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar idioma. Tente novamente.");
    },
  });

  /**
   * Função para enviar o formulário
   * @param values - Valores do formulário
   */
  function onSubmit(values: FormValues) {
    mutation.mutate(values);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="idioma"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Idioma padrão</FormLabel>
              <div className="relative">
                <Globe className="absolute left-2 top-2.5 h-5 w-5 text-muted-foreground" />
                <FormControl>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="pl-9 w-full">
                      <SelectValue placeholder="Selecione um idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      {opcoesDeLinguagem.map((opcao) => (
                        <SelectItem key={opcao.valor} value={opcao.valor}>
                          {opcao.rotulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full sm:w-auto"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : "Salvar preferência"}
        </Button>
      </form>
    </Form>
  );
}
