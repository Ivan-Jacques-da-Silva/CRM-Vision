import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { checkTrialStatus } from '../middleware/trial';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);
router.use(checkTrialStatus);

router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const empresaId = req.user?.empresaId;

    if (!empresaId) {
      return res.status(400).json({ message: 'Usuário não pertence a nenhuma empresa' });
    }

    const agora = new Date();
    const anoQuery = (req.query as any).ano;
    const mesQuery = (req.query as any).mes;
    const exportQuery = (req.query as any).export;

    const ano = anoQuery ? parseInt(String(anoQuery), 10) || agora.getFullYear() : agora.getFullYear();
    const mes = mesQuery ? parseInt(String(mesQuery), 10) || agora.getMonth() + 1 : agora.getMonth() + 1;

    const inicioMes = new Date(ano, mes - 1, 1, 0, 0, 0, 0);
    const fimMes = new Date(ano, mes, 0, 23, 59, 59, 999);

    const usuarios = await prisma.usuario.findMany({
      where: {
        empresaId,
        isActive: true,
      },
      include: {
        oportunidades: true,
      },
    });

    const rankingComPontuacao = usuarios.map((usuario) => {
      const oportunidadesGanhas = usuario.oportunidades.filter((oportunidade) => {
        if (oportunidade.status !== 'GANHO') {
          return false;
        }

        const referencia =
          (oportunidade as any).dataFechamento ||
          (oportunidade as any).updatedAt ||
          (oportunidade as any).createdAt;

        if (!referencia) {
          return false;
        }

        const dataRef = referencia instanceof Date ? referencia : new Date(referencia);
        if (Number.isNaN(dataRef.getTime())) {
          return false;
        }

        return dataRef >= inicioMes && dataRef <= fimMes;
      });

      const vendasConcluidas = oportunidadesGanhas.length;

      const valorTotal = oportunidadesGanhas.reduce((total, oportunidade) => {
        const valor = oportunidade.valorFechado ?? oportunidade.valor ?? 0;
        return total + valor;
      }, 0);

      return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        vendasConcluidas,
        valorTotal,
      };
    });

    const rankingOrdenado = rankingComPontuacao
      .sort((a, b) => b.valorTotal - a.valorTotal)
      .map((usuario, index) => ({
        ...usuario,
        posicao: index + 1
      }));

    if (exportQuery === 'csv') {
      const header = 'posicao;nome;email;vendasConcluidas;valorTotal\n';

      const linhas = rankingOrdenado.map((usuario) => {
        const nomeSeguro = usuario.nome.replace(/"/g, '""');
        return `${usuario.posicao};"${nomeSeguro}";${usuario.email};${usuario.vendasConcluidas};${usuario.valorTotal}`;
      });

      const csv = header + linhas.join('\n');
      const mesStr = String(mes).padStart(2, '0');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="ranking-vendas-${ano}-${mesStr}.csv"`);

      return res.send(csv);
    }

    res.json(rankingOrdenado);
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;
