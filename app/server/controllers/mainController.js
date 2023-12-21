"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarUsuarios = exports.contarUsuarios = exports.buscarSCORM = exports.verificarSsl = exports.obtenerDominios = exports.obtenerEsquemas = void 0;
const axios_1 = require("axios");
const pg_1 = require("pg");
// * CONEXION TENENCIAS
const poolConfig = {
    user: 'dev_user',
    host: 'tenancies.cskfoquuftxn.us-east-1.rds.amazonaws.com',
    database: 'tenancies',
    password: 'XfRAQ.gO%a$Snj2',
    port: 5432, // Puerto predeterminado de PostgreSQL
};
// * CONEXION MANGUS
const poolConfigMangus = {
    user: 'dev_user',
    host: 'mangus-prod.cskfoquuftxn.us-east-1.rds.amazonaws.com',
    database: 'mangus',
    password: 'XfRAQ.gO%a$Snj2',
    port: 5432, // Puerto predeterminado de PostgreSQL
};
const pool = new pg_1.Pool(poolConfig);
const poolM = new pg_1.Pool(poolConfigMangus);
const obtenerEsquemas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const esquemaAIgnorar = 'wrocolombia';
    const tablaName = 'lesson_scorms';
    try {
        const result = yield pool.query("SELECT DISTINCT table_schema FROM information_schema.tables WHERE table_name = 'lesson_scorms'");
        const esquemas = result.rows.map((row) => row.table_schema);
        const esquemasFiltrados = esquemas.filter((esquema) => esquema !== esquemaAIgnorar);
        res.json(esquemasFiltrados);
    }
    catch (error) {
        console.error('Error al obtener esquemas:', error);
        res.status(500).json({ error: 'Error al obtener esquemas' });
    }
});
exports.obtenerEsquemas = obtenerEsquemas;
const obtenerDominios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield pool.query(`SELECT description as url, t."name"
  FROM
    public.tenancy_domains as td
  JOIN
    public.tenancies as t
  ON
    td.tenancy_id = t.id
  WHERE
    td.description  not like '%SUSPENDIDA' and t.tenancy_status_id = 3`);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error al obtener dominios:', error);
        res.status(500).json({ error: 'Error al obtener registros' });
    }
});
exports.obtenerDominios = obtenerDominios;
const verificarSsl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { domain_name } = req.params;
    const API_SSL = 'https://ssl-checker.io/api/v1/check';
    try {
        const response = yield axios_1.default.get(`${API_SSL}/${domain_name}`);
        res.json(response.data);
    }
    catch (error) {
        console.error('Error al consumir la API_SSL', error);
        res.status(500);
    }
});
exports.verificarSsl = verificarSsl;
const buscarSCORM = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { valor_buscar } = req.params;
    const tablaName = 'lesson_scorms';
    const tabla2Name = 'course_lessons';
    const tabla3Name = 'courses';
    const tabla4Name = 'lessons';
    const esquemaAIgnorar = 'wrocolombia';
    const result = yield pool.query("SELECT DISTINCT table_schema FROM information_schema.tables WHERE table_name = 'lesson_scorms'");
    const esquemas = result.rows.map((row) => row.table_schema);
    const esquemasFiltrados = esquemas.filter((esquema) => esquema !== esquemaAIgnorar);
    if (poolM) {
        esquemasFiltrados.push('mangus');
    }
    // Función para ejecutar la consulta para un esquema específico en una conexión dada
    const executeQueryForSchema = (currentEsquema, currentPool) => __awaiter(void 0, void 0, void 0, function* () {
        // Verificar si estamos en la conexión poolM y el esquema no es 'mangus'
        if (currentPool === poolM && currentEsquema !== 'mangus') {
            return [];
        }
        if (currentPool === pool && currentEsquema === 'mangus') {
            return [];
        }
        const query = `
    SELECT '${currentEsquema}' AS esquema, tabla3.code, tabla3.name, tabla4.name as lesson_name, tabla3.course_status_id, td.description AS host, tabla2.id as course_lesson_id
    FROM "${currentEsquema}"."${tablaName}" tabla1
    INNER JOIN "${currentEsquema}"."${tabla2Name}" tabla2 ON tabla1.lesson_id = tabla2.lesson_id
    INNER JOIN "${currentEsquema}"."${tabla3Name}" tabla3 ON tabla2.course_id = tabla3.id
    INNER JOIN "${currentEsquema}"."${tabla4Name}" tabla4 ON tabla1.lesson_id = tabla4.id
    JOIN public.tenancies t ON '${currentEsquema}' = t.schema
    JOIN public.tenancy_domains td ON t.id = td.tenancy_id
    WHERE
    t.tenancy_status_id = 3
    AND td.description != 'qa.mangus.co'
    AND td.description != 'app.mangus.co'
    AND td.description != 'localhost'
    AND tabla1.title = $1
    AND td.description NOT LIKE '%SUSPENDIDA'
  `;
        try {
            const result = yield currentPool.query(query, [
                valor_buscar,
            ]);
            return result.rows;
        }
        catch (error) {
            console.error(`Error al obtener datos para el esquema ${currentEsquema} en la conexión ${currentPool}:`, error);
            throw new Error(`Error al obtener datos para el esquema ${currentEsquema} en la conexión ${currentPool}`);
        }
    });
    try {
        // Ejecuta la consulta para cada esquema filtrado en ambas conexiones
        const [resultadosPorEsquemaPool, resultadosPorEsquemaPoolM] = yield Promise.all([
            Promise.all(esquemasFiltrados.map((esquema) => executeQueryForSchema(esquema, pool))),
            Promise.all(esquemasFiltrados.map((esquema) => executeQueryForSchema(esquema, poolM))),
        ]);
        // Combina los resultados de ambas conexiones en un solo array
        const datos = [].concat(...resultadosPorEsquemaPool, ...resultadosPorEsquemaPoolM);
        res.json(datos);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener datos' });
    }
});
exports.buscarSCORM = buscarSCORM;
const contarUsuarios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const esquemaAIgnorar = 'wrocolombia';
    const tablaName = 'users';
    const result = yield pool.query("SELECT DISTINCT table_schema FROM information_schema.tables WHERE table_name = 'users'");
    const esquemas = result.rows.map((row) => row.table_schema);
    const esquemasFiltrados = esquemas.filter((esquema) => esquema !== esquemaAIgnorar);
    if (poolM) {
        esquemasFiltrados.push('mangus');
    }
    // Función para ejecutar la consulta para un esquema específico en una conexión dada
    const executeQueryForSchema = (currentEsquema, currentPool) => __awaiter(void 0, void 0, void 0, function* () {
        // Verificar si estamos en la conexión poolM y el esquema no es 'mangus'
        if (currentPool === poolM && currentEsquema !== 'mangus') {
            return [];
        }
        if (currentPool === pool && currentEsquema === 'mangus') {
            return [];
        }
        const query = `
    SELECT '${currentEsquema}' AS esquema, COUNT(*)
    FROM "${currentEsquema}"."${tablaName}" tabla1
    WHERE tabla1.active = true
  `;
        try {
            const result = yield currentPool.query(query);
            return result.rows;
        }
        catch (error) {
            console.error(`Error al obtener datos para el esquema ${currentEsquema} en la conexión ${currentPool}:`, error);
            throw new Error(`Error al obtener datos para el esquema ${currentEsquema} en la conexión ${currentPool}`);
        }
    });
    try {
        // Ejecuta la consulta para cada esquema filtrado en ambas conexiones
        const [resultadosPorEsquemaPool, resultadosPorEsquemaPoolM] = yield Promise.all([
            Promise.all(esquemasFiltrados.map((esquema) => executeQueryForSchema(esquema, pool))),
            Promise.all(esquemasFiltrados.map((esquema) => executeQueryForSchema(esquema, poolM))),
        ]);
        // Combina los resultados de ambas conexiones en un solo array
        const datos = [].concat(...resultadosPorEsquemaPool, ...resultadosPorEsquemaPoolM);
        res.json(datos);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener datos' });
    }
});
exports.contarUsuarios = contarUsuarios;
const buscarUsuarios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const offset = (page - 1) * pageSize;
        // Realiza la consulta a la base de datos
        const result = yield poolM.query('SELECT * FROM mangus.users OFFSET $1 LIMIT $2', [
            offset,
            pageSize,
        ]);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
exports.buscarUsuarios = buscarUsuarios;
//# sourceMappingURL=mainController.js.map