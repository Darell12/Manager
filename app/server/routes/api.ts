import * as express from 'express';
import {
  buscarSCORM,
  obtenerDominios,
  obtenerEsquemas,
  verificarSsl,
} from '../controllers/mainController';

const router = express.Router();

router.get('/dominios', obtenerDominios);

router.get('/esquemas', obtenerEsquemas);

router.get('/checkssl/:domain_name', verificarSsl);

router.get('/recurso/:valor_buscar', buscarSCORM);
