import axios from 'axios';
import { Pool, PoolConfig, QueryResult } from 'pg';
require('dotenv').config();
import {DBM, DBM_HOST, DBPASS, DBT, DBT_HOST, DB_USER} from '../config'

// * CONEXION TENENCIAS
const poolConfig: PoolConfig = {
  user: DB_USER,
  host: DBT_HOST,
  database: DBT,
  password: DBPASS,
  port: 5432, // Puerto predeterminado de PostgreSQL
};

// * CONEXION MANGUS
const poolConfigMangus: PoolConfig = {
  user: DB_USER,
  host: DBM_HOST,
  database: DBM,
  password: DBPASS,
  port: 5432, // Puerto predeterminado de PostgreSQL
};

const pool = new Pool(poolConfig);
const poolM = new Pool(poolConfigMangus);

export const obtenerEsquemas = async (req: any, res: any) => {
  const esquemaAIgnorar = 'wrocolombia';
  const tablaName = 'lesson_scorms';
  try {
    const result: QueryResult = await pool.query(
      "SELECT DISTINCT table_schema FROM information_schema.tables WHERE table_name = 'lesson_scorms'"
    );

    const esquemas: string[] = result.rows.map((row) => row.table_schema);
    const esquemasFiltrados = esquemas.filter(
      (esquema) => esquema !== esquemaAIgnorar
    );

    res.json(esquemasFiltrados);
  } catch (error) {
    console.error('Error al obtener esquemas:', error);
    res.status(500).json({ error: 'Error al obtener esquemas' });
  }
};

export const obtenerDominios = async (req: any, res: any) => {
  try {
    const result = await pool.query(`SELECT description as url, t."name"
  FROM
    public.tenancy_domains as td
  JOIN
    public.tenancies as t
  ON
    td.tenancy_id = t.id
  WHERE
    td.description  not like '%SUSPENDIDA' and t.tenancy_status_id = 3`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener dominios:', error);
    res.status(500).json({ error: 'Error al obtener registros' });
  }
};

export const verificarSsl = async (req: any, res: any) => {
  const { domain_name } = req.params;
  const API_SSL = 'https://ssl-checker.io/api/v1/check';

  try {
    const response = await axios.get(`${API_SSL}/${domain_name}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error al consumir la API_SSL', error);
    res.status(500);
  }
};

export const buscarSCORM = async (req: any, res: any) => {
  const { valor_buscar } = req.params;
  const tablaName = 'lesson_scorms';
  const tabla2Name = 'course_lessons';
  const tabla3Name = 'courses';
  const tabla4Name = 'lessons';

  const esquemaAIgnorar = 'wrocolombia';

  const result: QueryResult = await pool.query(
    "SELECT DISTINCT table_schema FROM information_schema.tables WHERE table_name = 'lesson_scorms'"
  );

  const esquemas: string[] = result.rows.map((row) => row.table_schema);
  const esquemasFiltrados = esquemas.filter(
    (esquema) => esquema !== esquemaAIgnorar
  );

  if (poolM) {
    esquemasFiltrados.push('mangus');
  }

  // Función para ejecutar la consulta para un esquema específico en una conexión dada
  const executeQueryForSchema = async (
    currentEsquema: any,
    currentPool: any
  ) => {
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
      const result: QueryResult = await currentPool.query(query, [
        valor_buscar,
      ]);
      return result.rows;
    } catch (error) {
      console.error(
        `Error al obtener datos para el esquema ${currentEsquema} en la conexión ${currentPool}:`,
        error
      );
      throw new Error(
        `Error al obtener datos para el esquema ${currentEsquema} en la conexión ${currentPool}`
      );
    }
  };

  try {
    // Ejecuta la consulta para cada esquema filtrado en ambas conexiones
    const [resultadosPorEsquemaPool, resultadosPorEsquemaPoolM] =
      await Promise.all([
        Promise.all(
          esquemasFiltrados.map((esquema) =>
            executeQueryForSchema(esquema, pool)
          )
        ),
        Promise.all(
          esquemasFiltrados.map((esquema) =>
            executeQueryForSchema(esquema, poolM)
          )
        ),
      ]);

    // Combina los resultados de ambas conexiones en un solo array
    const datos: Array<any> = ([] as any[]).concat(
      ...resultadosPorEsquemaPool,
      ...resultadosPorEsquemaPoolM
    );

    res.json(datos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos' });
  }
};

export const contarUsuarios = async (req: any, res: any) => {

  const esquemaAIgnorar = 'wrocolombia';

  const tablaName = 'users';

  const result: QueryResult = await pool.query(
    "SELECT DISTINCT table_schema FROM information_schema.tables WHERE table_name = 'users'"
  );

  const esquemas: string[] = result.rows.map((row) => row.table_schema);
  const esquemasFiltrados = esquemas.filter(
    (esquema) => esquema !== esquemaAIgnorar
  );

  if (poolM) {
    esquemasFiltrados.push('mangus');
  }

  // Función para ejecutar la consulta para un esquema específico en una conexión dada
  const executeQueryForSchema = async (
    currentEsquema: any,
    currentPool: any
  ) => {
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
      const result: QueryResult = await currentPool.query(query);
      return result.rows;
    } catch (error) {
      console.error(
        `Error al obtener datos para el esquema ${currentEsquema} en la conexión ${currentPool}:`,
        error
      );
      throw new Error(
        `Error al obtener datos para el esquema ${currentEsquema} en la conexión ${currentPool}`
      );
    }
  };

  try {
    // Ejecuta la consulta para cada esquema filtrado en ambas conexiones
    const [resultadosPorEsquemaPool, resultadosPorEsquemaPoolM] =
      await Promise.all([
        Promise.all(
          esquemasFiltrados.map((esquema) =>
            executeQueryForSchema(esquema, pool)
          )
        ),
        Promise.all(
          esquemasFiltrados.map((esquema) =>
            executeQueryForSchema(esquema, poolM)
          )
        ),
      ]);

    // Combina los resultados de ambas conexiones en un solo array
    const datos: Array<any> = ([] as any[]).concat(
      ...resultadosPorEsquemaPool,
      ...resultadosPorEsquemaPoolM
    );

    res.json(datos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos' });
  }
};

export const buscarUsuarios = async (req: any, res: any) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;
    // Realiza la consulta a la base de datos
    const result = await poolM.query('SELECT * FROM mangus.users OFFSET $1 LIMIT $2', [
      offset,
      pageSize,
    ]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
