import {Router} from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { prisma } from '../config/db';
import { QUERY_RAW_GET_SERVICE_DETAILS_RESPONSE, QUERY_RAW_SAVE_SERVICE_RESPONSE, QUERY_RAW_SAVE_SP_RESPONSE, QUERY_RAW_SERVICES_LIST_RESPONSE, QUERY_RAW_SPECIALTIES_LIST_RESPONSE } from '../interfaces/services-management.interfaces';
import { requireRole } from '../middleware/require-role';
import { validateQuery } from '../middleware/validate';
import { serviceListQuerySchema, specialtiesListQuerySchema } from '../schemas/services-management.schema';
import z from 'zod';


const router = Router();


router.get('/get-services-list', 
  authenticateToken, requireRole('admin'), validateQuery(serviceListQuerySchema), async (req: AuthenticatedRequest, res) => {
  try {
    // Extragere filtre din query params
    const q = (req as any).validatedQuery as z.infer<typeof serviceListQuerySchema>;

    const dbResponse = await prisma.$queryRaw<QUERY_RAW_SERVICES_LIST_RESPONSE[]>`
      SELECT public.get_admin_services_json(
        ${q.name ?? null},
        ${q.isActive ?? null},
        ${q.maxPrice ?? null},
        ${q.rows}, 
        ${q.first},
        ${q.sortField ?? null},
        ${q.sortOrder ?? null}

      ) AS result
    `;

    const finalResponse = dbResponse[0]?.result || { data: [], total: 0 };

    res.status(200).json(finalResponse);



    // ${q.rows}, - limit
    // ${q.first},- offset


    // const p_sort_field = req.query.sortField ? String(req.query.sortField) : null;
    // const p_sort_order = req.query.sortOrder ? parseInt(String(req.query.sortOrder), 10) : null;
    // const name = (req.query.name as string) || null;
    // const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : null;
    // const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : null;    
    // const p_offset = req.query.first ? parseInt(req.query.first as string, 10) : 0;
    // const p_limit = req.query.rows ? parseInt(req.query.rows as string, 10) : 10;

    // const dbResponse = await prisma.$queryRaw<QUERY_RAW_SERVICES_LIST_RESPONSE[]>`
    //   SELECT public.get_admin_services_json(
    //     ${name},
    //     ${isActive},
    //     ${maxPrice},
    //     ${p_limit},
    //     ${p_offset},
    //     ${p_sort_field},
    //     ${p_sort_order}

    //   ) AS result
    // `;

    // console.log("== || /api/get-services-list || == dbResponse ==", dbResponse)
    // console.log("== || /api/get-services-list || == dbResponse[0]?.result ==", dbResponse[0]?.result)
  } catch (error) {
    console.error('Eroare la extragerea serviciilor de admin:', error);
    res.status(500).json({ error: 'Eroare la procesarea listei de servicii.' });
  }
});


router.post('/save-service', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // 1. Verificare drepturi administrative
    if (req.user?.role !== 'admin') {
       res.status(403).json({ id: null, success: false, message: 'Acces interzis. Necesită drepturi de administrator.' });
       return;
    }

    // 2. Extragerea parametrilor din body (id poate fi undefined/null la creare)
    const { id, name, duration_minutes, price, is_active } = req.body;

    console.log(" == || /api/save-service || == req.body == ", req.body);

    const parsedId = id ? parseInt(id) : null;
    const parsedDuration = duration_minutes ? parseInt(duration_minutes) : null;
    const parsedPrice = price ? parseFloat(price) : null;
    const activeStatus = is_active !== undefined ? filterToBoolean(is_active) : true;

    // Helper simplu pentru parsarea booleană din body
    function filterToBoolean(val: any): boolean {
      return val === true || val === 'true' || val === 1 || val === '1';
    }
    

    // 3. Executăm funcția stocată din PostgreSQL
    const dbResponse = await prisma.$queryRaw<QUERY_RAW_SAVE_SERVICE_RESPONSE[]>`
      SELECT public.upsert_service_json(
        ${parsedId},
        ${name},
        ${parsedDuration},
        ${parsedPrice},
        ${activeStatus}
      ) AS result
    `;

    console.log(" == || /api/save-service || == dbResponse == ", dbResponse);


    const finalData = dbResponse[0].result;

    res.json(finalData);

    // const rawJsonText = dbResponse?.?.[0]?.response;

    // if (!rawJsonText) {
    //   res.status(500).json({ id: null, success: false, message: 'A apărut o eroare la salvarea înregistrării.' });
    //   return;
    // }

    // const finalData = JSON.parse(rawJsonText);

    // // 4. Returnăm răspunsul exact generat de baza de date
    // if (!finalData.success) {
    //   res.status(400).json(finalData);
    //   return;
    // }

    // res.status(200).json(finalData);

  } catch (error) {
    console.error('API UPSERT SERVICE ERROR:', error);
    res.status(500).json({ id: null, success: false, message: 'A apărut o eroare la salvarea înregistrării.' });
  }
});


router.post('/save-sp', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // 1. Verificare drepturi administrative
    if (req.user?.role !== 'admin') {
       res.status(403).json({ id: null, success: false, message: 'Acces interzis. Necesită drepturi de administrator.' });
       return;
    }

    // 2. Extragerea parametrilor din body (id poate fi undefined/null la creare)
    const { id, name, is_active } = req.body;

    console.log(" == || /api/save-sp || == req.body == ", req.body);


    const parsedId = id ? parseInt(id) : null;
    // const activeStatus = is_active !== undefined ? filterToBoolean(is_active) : true;

    // Helper simplu pentru parsarea booleană din body
    // function filterToBoolean(val: any): boolean {
    //   return val === true || val === 'true' || val === 1 || val === '1';
    // }
    

    // 3. Executăm funcția stocată din PostgreSQL
    const dbResponse = await prisma.$queryRaw<QUERY_RAW_SAVE_SP_RESPONSE[]>`
      SELECT public.upsert_specialty_json(
        ${parsedId},
        ${name},
        ${is_active}
      ) AS result
    `;

    console.log(" == || /api//save-sp || == dbResponse == ", dbResponse);


    const finalData = dbResponse[0].result;

    console.log(" == || /api//save-sp || == dbResponse == ", dbResponse[0].result);

    res.json(finalData);

    // const rawJsonText = dbResponse?.?.[0]?.response;

    // if (!rawJsonText) {
    //   res.status(500).json({ id: null, success: false, message: 'A apărut o eroare la salvarea înregistrării.' });
    //   return;
    // }

    // const finalData = JSON.parse(rawJsonText);

    // // 4. Returnăm răspunsul exact generat de baza de date
    // if (!finalData.success) {
    //   res.status(400).json(finalData);
    //   return;
    // }

    // res.status(200).json(finalData);

  } catch (error) {
    console.error('API UPSERT SERVICE ERROR:', error);
    res.status(500).json({ id: null, success: false, message: 'A apărut o eroare la salvarea înregistrării.' });
  }
});



router.get('/get-service-details', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {

    // 1. Verificare drepturi administrative
    if (!req.user) {
       res.status(403).json({ service_id: null, success: false, message: 'Acces interzis'});
       return;
    }

    // console.log("== || /api/get-service-details || == req.query == ", req.query)

    const service_id = req.query.service_id ? parseInt(String(req.query.service_id), 10) : null;
    
    console.log("== || /api/get-service-details || == service_id == ", service_id)

    const result = await prisma.$queryRaw<QUERY_RAW_GET_SERVICE_DETAILS_RESPONSE[]>`
      SELECT public.get_service_details(
        ${service_id}
      ) AS result
    `;

    console.log("== || /api/get-service-details|| == result == ", result);

    const finalResponse = result[0]?.result; 

    // console.log("== || /api/admin/appointments || == result == ", result);
    console.log("== || /api/get-service-details || == finalResponse == ", finalResponse);

    res.json(finalResponse);
 
  } catch (error) {
    console.error('Eroare la aducerea rezumat programare:', error);
    res.status(500).json({ error: 'Eroare la extragerea datelor.' });
  }
});


router.get('/get-specialties-list', 
  authenticateToken, requireRole('admin'), validateQuery(specialtiesListQuerySchema), async (req: AuthenticatedRequest, res) => {
  try {
    
    const q = (req as any).validatedQuery as z.infer<typeof specialtiesListQuerySchema>;

    const dbResponse = await prisma.$queryRaw<QUERY_RAW_SPECIALTIES_LIST_RESPONSE[]>`
      SELECT public.get_specialties_json(
        ${q.searchQuery ?? null},
        ${q.isActive ?? null},
        ${q.rows}, 
        ${q.first},
        ${q.sortField ?? null},
        ${q.sortOrder ?? null}

      ) AS result
    `;

    const finalResponse = dbResponse[0]?.result || { data: [], total: 0 };
    res.status(200).json(finalResponse);
    // const p_sort_field = req.query.sortField ? String(req.query.sortField) : null;
    // const p_sort_order = req.query.sortOrder ? parseInt(String(req.query.sortOrder), 10) : null;
    // const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : null;
    // const p_search_query = req.query.searchQuery ? String(req.query.searchQuery) : null;
    // const p_offset = req.query.first ? parseInt(req.query.first as string, 10) : 0;
    // const p_limit = req.query.rows ? parseInt(req.query.rows as string, 10) : 10;

    // const dbResponse = await prisma.$queryRaw<QUERY_RAW_SPECIALTIES_LIST_RESPONSE[]>`
    //   SELECT public.get_specialties_json(
    //     ${p_search_query},
    //     ${isActive},
    //     ${p_limit},
    //     ${p_offset},
    //     ${p_sort_field},
    //     ${p_sort_order}

    //   ) AS result
    // `;

    // Extragem obiectul structurat { data: [...], total: X } din proprietatea 'response'
    // console.log("== || /api/get-services-list || == dbResponse ==", dbResponse)
    // console.log("== || /api/get-services-list || == dbResponse[0]?.result ==", dbResponse[0]?.result)
    //const finalResponse = dbResponse[0]?.result || { data: [], total: 0 };

    // Trimitem structura curată direct către Angular
    //res.json(finalResponse);

  } catch (error) {
    console.error('Eroare la extragerea serviciilor de admin:', error);
    res.status(500).json({ error: 'Eroare la procesarea listei de servicii.' });
  }
});





export default router;