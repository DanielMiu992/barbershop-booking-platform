import { Router } from 'express';
import { prisma } from '../config/db';
import { QUERY_RAW_BARBERS_COMBO_RESULT, QUERY_RAW_SERVICES_COMBO_RESULT, QUERY_RAW_SP_COMBO_RESULT } from '../interfaces/combo-box.interfaces';


const router = Router();



router.get('/services-combo', async (req, res) => {
  try {
    const { isAddon } = req.query;
    const p_is_addon = isAddon === undefined ? null : isAddon === 'true';

    const dbResponse = await prisma.$queryRaw<QUERY_RAW_SERVICES_COMBO_RESULT[]>`
      SELECT public.get_services_combo_json(${p_is_addon}) AS response
    `;

    console.log('== || /api/barbers/services-combo || == dbResponse?.[0]?.response', dbResponse?.[0]?.response);

    const finalData = dbResponse?.[0]?.response;

    // if (!finalData || !finalData.success) {
    //   res.status(500).json({ result: [], success: false });
    //   return;
    // }

    // Trimitem direct către frontend obiectul: { result: [...], success: true }
    res.json(finalData);

  } catch (error) {
    console.error('API SERVICES COMBO ERROR:', error);
    res.status(500).json({ result: [], success: false });
  }
});


router.get('/barbers-combo', async (req, res) => {
  try {
    //console.log('== || /api/barbers/get-barbers-combo || == Request received');
    
    const dbResponse = await prisma.$queryRaw<QUERY_RAW_BARBERS_COMBO_RESULT[]>`
      SELECT public.get_barbers_combo_json() AS response
    `;

    // console.log('== || /api/barbers/get-barbers-combo || == dbResponse?.[0]?.response', dbResponse?.[0]?.response);

    const finalData = dbResponse?.[0]?.response;

    res.json(finalData);

  } catch (error) {
    console.error('API BARBERS COMBO ERROR:', error);
    res.status(500).json({ result: [], success: false });
  }
});



router.get('/sp-combo', async (req, res) => {
  try {
    console.log('== || /api/sp-combo|| == Request received');
    
    const dbResponse = await prisma.$queryRaw<QUERY_RAW_SP_COMBO_RESULT[]>`
      SELECT public.get_specialties_combo_json() AS response
    `;

    console.log('== || /api/sp-combo || == dbResponse?.[0]?.response', dbResponse?.[0]?.response);

    const finalData = dbResponse?.[0]?.response;

    res.json(finalData);

  } catch (error) {
    console.error('API SP COMBO ERROR:', error);
    res.status(500).json({ result: [], success: false });
  }
});






export default router;