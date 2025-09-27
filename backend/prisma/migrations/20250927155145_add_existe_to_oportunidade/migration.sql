-- AlterTable
ALTER TABLE "public"."oportunidades" ADD COLUMN     "dataFechamento" TIMESTAMP(3),
ADD COLUMN     "etapaPersonalizada" TEXT,
ADD COLUMN     "fonte" TEXT,
ADD COLUMN     "motivoPerda" TEXT,
ADD COLUMN     "notas" TEXT,
ADD COLUMN     "pipeline" TEXT NOT NULL DEFAULT 'principal',
ADD COLUMN     "probabilidade" INTEGER DEFAULT 20,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "valorFechado" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "public"."atividades_oportunidades" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "valorAnterior" TEXT,
    "valorNovo" TEXT,
    "dataAgendada" TIMESTAMP(3),
    "dataRealizada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oportunidadeId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atividades_oportunidades_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."atividades_oportunidades" ADD CONSTRAINT "atividades_oportunidades_oportunidadeId_fkey" FOREIGN KEY ("oportunidadeId") REFERENCES "public"."oportunidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."atividades_oportunidades" ADD CONSTRAINT "atividades_oportunidades_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
