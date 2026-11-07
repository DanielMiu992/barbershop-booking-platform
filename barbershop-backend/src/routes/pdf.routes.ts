import PDFDocument from 'pdfkit-table';
import {Router, Request, Response } from 'express';
import path from 'path';
import { formatToSqlDate } from '../utils/date.utils';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { prisma } from '../config/db';
import { QUERY_RAW_ADMIN_APPOINTMENTS_LIST_RESULT } from '../interfaces/admin-dashboard.interfaces';
import { QUERY_RAW_CUSTOMER_APPOINTMENTS_LIST_RESPONSE } from '../interfaces/customer-dashboard.interfaces';
import { QUERY_RAW_BARBERS_LIST_RESULT } from '../interfaces/barbers-management.interfaces';
import { QUERY_RAW_SERVICES_LIST_RESPONSE } from '../interfaces/services-management.interfaces';
import { QUERY_RAW_BARBER_APPOINTMENTS_LIST_RESPONSE } from '../interfaces/barber-dashboard.interfaces';
import { requireRole } from '../middleware/require-role';


const router = Router();


router.get('/barbers-management-pdf', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {

    if (req.user?.role !== 'admin') {
      res.status(403).json({success: false, message: 'Acces interzis. Necesită drepturi de administrator.' });
      return;
    }

    const { nameParam, statusParam } = req.query;

    // console.log("==|| /api/export-pdf/barbers-management-pdf || == req.query == ", req.query)

    // 1. Pregătim parametrii pentru funcția SQL (la fel ca la lista simplă)
    // const p_status = statusParam ? String(statusParam) : null;
    let p_status: boolean | null = null;
    const p_name = nameParam ? String(nameParam) : null;

    if (statusParam !== undefined && statusParam !== 'null' && statusParam !== '') {
      p_status = statusParam === 'true';
    }


    
    // Setăm o limită foarte mare și offset 0.
    const p_limit = 100000; 
    const p_offset = 0;

    // 2. Apelăm funcția din pgAdmin
    const dbResponse = await prisma.$queryRaw<QUERY_RAW_BARBERS_LIST_RESULT[]>`
      SELECT public.get_barbers_list_json(
        ${p_name}, 
        ${p_status}, 
        ${p_limit}, 
        ${p_offset}
      ) AS result
    `;

    // console.log("==|| /api/export-pdf/barbers-management-pdf || == dbResponse == ", dbResponse);
    // console.log("==|| /api/export-pdf/barbers-management-pdf || == dbResponse[0]?.result == ", dbResponse[0]?.result)

    // Extragem obiectul { data: [...], total: X }
    const barbersData = dbResponse[0]?.result || { data: [], total: 0 };
    const list = barbersData.data || [];

    // Calea absolută către imaginea ta de logo PNG
    const logoPath = path.join(__dirname, '../../assets/logo-saloon.png');

    // 3. Configurație document PDF (Format A4, orientare Landscape pentru a avea loc toate coloanele)
    const doc = new PDFDocument({ 
      margin: 30, 
      margins: { top: 30, bottom: 60, left: 30, right: 30 }, 
      size: 'A4', 
      layout: 'landscape' 
    });

    // Setăm header-ele HTTP pentru descărcare fișier
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=raport-frizeri.pdf');

    // Conectăm fluxul PDF direct la răspunsul Express
    doc.pipe(res);

    const generateHeaderFooter = () => {
      // Salvează starea curentă a stilului (pentru a nu strica fontul tabelului)
      doc.save();

      // --- HEADER ---
      try {
        // Adăugăm imaginea PNG în colțul din stânga sus (X: 30, Y: 15, lățime: 50px)
        doc.image(logoPath, 30, 15, { width: 50 });
      } catch (imgError) {
        // Dacă imaginea lipsește la cale, punem un text ca să nu crape serverul
        doc.fontSize(10).fillColor('#64748b').text('[LOGO SALON]', 30, 30);
      }

      // Adăugăm textul din Header în dreapta logoului
      doc.font('Helvetica-Bold').fontSize(16).fillColor('#1e293b').text('BARBER SHOP MANAGEMENT - Raport Frizeri', 95, 25);
      doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(`Raport administrativ generat la: ${new Date().toLocaleString('ro-RO')}`, 95, 45);

      // Desenăm o linie elegantă de separare sub header (X_start: 30, Y: 70, X_end: 792 - 30)
      doc.moveTo(30, 70).lineTo(doc.page.width - 30, 70).lineWidth(1).strokeColor('#e2e8f0').stroke();

      // --- FOOTER ---
      const footerY = doc.page.height - 40; // Poziția pe verticală a subsolului

      // Linie de separare deasupra footer-ului
      doc.moveTo(30, footerY - 5).lineTo(doc.page.width - 30, footerY - 5).lineWidth(0.5).strokeColor('#e2e8f0').stroke();

      // Text în stânga footer-ului
      doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text('Document confidential - Uz intern', 30, footerY);

      // Restaurăm starea anterioară a stilului documentului
      doc.restore();
    };


    // =========================================================================
    // DECLANȘATOARE DE PAGINI (Evenimente PDFKit)
    // =========================================================================
    
    // Generăm header/footer manual pentru PRIMA pagină (deoarece ea se creează instant)
    generateHeaderFooter();

    // Pentru paginile următoare (2, 3, etc.) create automat de tabel, ascultăm evenimentul pageAdded
    doc.on('pageAdded', () => {
      generateHeaderFooter();
    });

    // =========================================================================
    // CONSTRUIREA TEXTULUI PENTRU FILTRE APLICATE
    // =========================================================================
    let filtreText = '';

    // Adăugăm Client (dacă există în listă, luăm numele complet din prima înregistrare găsită ca să fie frumos)
    if (nameParam) {
      filtreText += `Frizer: ${String(nameParam)} | `;
    }
    

    switch (statusParam) {
      case 'true':
        filtreText += `Status activitate: Activi | `;
        break;
      case 'false':
        filtreText += `Status activitate: Inactivi | `;
        break;
      case 'null':
        filtreText += `Status activitate: Toti frizerii | `;
        break;
    }

    // Eliminăm eventualul caracter '|' rămas la final (opțional)
    if (filtreText.endsWith(' | ')) {
      filtreText = filtreText.slice(0, -3);
    }

    // =========================================================================
    // DESENARE TEXT FILTRE PE PDF
    // =========================================================================
    // Linia de header se termină la Y: 70. Începem să scriem textul la Y: 80
    doc.y = 80; 

    doc.save();
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#1e293b')
      .text('Filtre aplicate: ', 30, doc.y, { continued: true }); // continued: true lasă cursorul pe același rând

    doc.font('Helvetica-Oblique').fontSize(10).fillColor('#475569')
      .text(filtreText);
    doc.restore();

    // =========================================================================
    // POZIȚIONARE CURSOR PENTRU TABEL
    // =========================================================================
    // Lăsăm un spațiu liber de 15 puncte sub textul de filtre înainte de a desena tabelul
    doc.y = doc.y + 15; 

      // doc.y = 90; 
    // 5. Construim structura tabelului pentru pdfkit-table
    const table = {
      headers: [
        { label: 'Nume Frizer', property: 'first_name', width: 140 },
        { label: 'Status', property: 'is_active', width: 80 }
      ],
      // Mapăm datele primite din pgAdmin în rânduri text
      rows: list.map((app) => {
        // const start = new Date(app.start_time);
        // const formattedDate = start.toLocaleDateString('ro-RO') + ' ' + 
        //                       start.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

        return [
          `${app.first_name} ${app.last_name}`,
          app.is_active ? 'Activ' : 'Inactiv'
        ];
      })
    };

    // 6. Desenăm tabelul în document cu opțiuni de design
    await doc.table(table, {
      addPage: false,
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
      prepareRow: (row, index, column, rect, rowNumber) => {
        doc.font('Helvetica').fontSize(9);
        // Alternăm culorile rândurilor (zebra striping) la fel ca în PrimeNG
        if (rowNumber !== undefined && Number(rowNumber) % 2 === 0) {
          doc.fillColor('#f8fafc');
        }
      }
    });

  // =========================================================================
    // NUMĂRAREA PAGINILOR (O adăugăm la final, după ce tabelul a generat totul)
    // =========================================================================
    const range = doc.bufferedPageRange(); // Returnează { start: 0, count: X }
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i); // Ne mutăm virtual pe pagina i
      
      const footerY = doc.page.height - 40;
      doc.save();
      doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text(
        `Pagina ${i + 1} din ${range.count}`, 
        doc.page.width - 100, 
        footerY, 
        { align: 'right', width: 70 }
      );
      doc.restore();
    }

    doc.end();
  } catch (error) {
    console.error('Eroare la generarea PDF:', error);
    res.status(500).json({ error: 'Eroare internă de server la generarea fișierului PDF.' });
  }
});


router.get('/services-management-pdf', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {

    if (req.user?.role !== 'admin') {
      res.status(403).json({success: false, message: 'Acces interzis. Necesită drepturi de administrator.' });
      return;
    }

    const { nameParam, priceParam, statusParam } = req.query;

    // console.log("==|| /api/export-pdf/services-management-pdf || == req.query == ", req.query)


    // 1. Pregătim parametrii pentru funcția SQL (la fel ca la lista simplă)
    // const p_status = statusParam ? String(statusParam) : null;
    let isActive: boolean | null = null;
    const name = nameParam ? String(nameParam) : null;
    const maxPrice = priceParam ? String(priceParam) : null;
    //const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string)

    if (statusParam !== undefined && statusParam !== 'null' && statusParam !== '') {
      isActive = statusParam === 'true';
    }
    
    // Pentru export, vrem TOATE înregistrările filtrate, nu doar o pagină.
    // Setăm o limită foarte mare și offset 0.
    const p_limit = 100000; 
    const p_offset = 0;

    // 2. Apelăm funcția din pgAdmin
    const dbResponse = await prisma.$queryRaw<QUERY_RAW_SERVICES_LIST_RESPONSE[]>`
      SELECT public.get_admin_services_json(
        ${name},
        ${isActive},
        ${maxPrice},
        ${p_limit},
        ${p_offset}
      ) AS result
    `;

    // console.log("==|| /api/services-management-pdf || == dbResponse == ", dbResponse)
    // console.log("==|| /api/services-management-pdf || == dbResponse[0]?.response == ", dbResponse[0]?.result)

    // Extragem obiectul { data: [...], total: X }
    const barbersData = dbResponse[0]?.result || { data: [], total: 0 };
    const list = barbersData.data || [];

    // Calea absolută către imaginea ta de logo PNG
    const logoPath = path.join(__dirname, '../../assets/logo-saloon.png');

    // 3. Configurație document PDF (Format A4, orientare Landscape pentru a avea loc toate coloanele)
    const doc = new PDFDocument({ 
      margin: 30, 
      margins: { top: 30, bottom: 60, left: 30, right: 30 }, 
      size: 'A4', 
      layout: 'landscape' 
    });

    // Setăm header-ele HTTP pentru descărcare fișier
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=raport-frizeri.pdf');

    // Conectăm fluxul PDF direct la răspunsul Express
    doc.pipe(res);

    const generateHeaderFooter = () => {
      // Salvează starea curentă a stilului (pentru a nu strica fontul tabelului)
      doc.save();

      // --- HEADER ---
      try {
        // Adăugăm imaginea PNG în colțul din stânga sus (X: 30, Y: 15, lățime: 50px)
        doc.image(logoPath, 30, 15, { width: 50 });
      } catch (imgError) {
        // Dacă imaginea lipsește la cale, punem un text ca să nu crape serverul
        doc.fontSize(10).fillColor('#64748b').text('[LOGO SALON]', 30, 30);
      }

      // Adăugăm textul din Header în dreapta logoului
      doc.font('Helvetica-Bold').fontSize(16).fillColor('#1e293b').text('BARBER SHOP MANAGEMENT - Raport Catalog Servicii', 95, 25);
      doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(`Raport administrativ generat la: ${new Date().toLocaleString('ro-RO')}`, 95, 45);

      // Desenăm o linie elegantă de separare sub header (X_start: 30, Y: 70, X_end: 792 - 30)
      doc.moveTo(30, 70).lineTo(doc.page.width - 30, 70).lineWidth(1).strokeColor('#e2e8f0').stroke();

      // --- FOOTER ---
      const footerY = doc.page.height - 40; // Poziția pe verticală a subsolului

      // Linie de separare deasupra footer-ului
      doc.moveTo(30, footerY - 5).lineTo(doc.page.width - 30, footerY - 5).lineWidth(0.5).strokeColor('#e2e8f0').stroke();

      // Text în stânga footer-ului
      doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text('Document confidential - Uz intern', 30, footerY);

      // Restaurăm starea anterioară a stilului documentului
      doc.restore();
    };


    // =========================================================================
    // DECLANȘATOARE DE PAGINI (Evenimente PDFKit)
    // =========================================================================
    
    // Generăm header/footer manual pentru PRIMA pagină (deoarece ea se creează instant)
    generateHeaderFooter();

    // Pentru paginile următoare (2, 3, etc.) create automat de tabel, ascultăm evenimentul pageAdded
    doc.on('pageAdded', () => {
      generateHeaderFooter();
    });

    // =========================================================================
    // CONSTRUIREA TEXTULUI PENTRU FILTRE APLICATE
    // =========================================================================
    let filtreText = '';

    // // Adăugăm Status
    // filtreText += `Status: ${status ? String(status).toUpperCase() : 'TOATE'} | `;

    // // Adăugăm Dată
    // filtreText += `Dată: ${date ? String(date) : 'TOATE'} | `;

    // Adăugăm Client (dacă există în listă, luăm numele complet din prima înregistrare găsită ca să fie frumos)
    if (nameParam) {
      filtreText += `Denumire serviciu: ${String(nameParam)} | `;
    }

    if (priceParam) {
      filtreText += `Pret maxim: ${String(priceParam)} (RON) | `;
    }

    switch (statusParam) {
      case 'true':
        filtreText += `Status: Active | `;
        break;
      case 'false':
        filtreText += `Status: Inactive | `;
        break;
      case 'null':
        filtreText += `Status: Toate | `;
        break;
    }


        // Eliminăm eventualul caracter '|' rămas la final (opțional)
    if (filtreText.endsWith(' | ')) {
      filtreText = filtreText.slice(0, -3);
    }

    // =========================================================================
    // DESENARE TEXT FILTRE PE PDF
    // =========================================================================
    // Linia de header se termină la Y: 70. Începem să scriem textul la Y: 80
    doc.y = 80; 

    doc.save();
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#1e293b')
      .text('Filtre aplicate: ', 30, doc.y, { continued: true }); // continued: true lasă cursorul pe același rând

    doc.font('Helvetica-Oblique').fontSize(10).fillColor('#475569')
      .text(filtreText);
    doc.restore();

    // =========================================================================
    // POZIȚIONARE CURSOR PENTRU TABEL
    // =========================================================================
    // Lăsăm un spațiu liber de 15 puncte sub textul de filtre înainte de a desena tabelul
    doc.y = doc.y + 15; 

      // doc.y = 90; 
    // 5. Construim structura tabelului pentru pdfkit-table
    const table = {
      headers: [
        { label: 'Denumire serviciu', property: 'name', width: 140 },
        { label: 'Durata', property: 'duration_minutes', width: 80 },
        { label: 'Pret standard', property: 'price', width: 80 },
        { label: 'Status', property: 'is_active', width: 80 }
      ],
      // Mapăm datele primite din pgAdmin în rânduri text
      rows: list.map((app) => {
        // const start = new Date(app.start_time);
        // const formattedDate = start.toLocaleDateString('ro-RO') + ' ' + 
        //                       start.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

        return [
          `${app.name}`,
          `${app.duration_minutes} min`,
          `${app.price} RON`,
          app.is_active ? 'Activ' : 'Inactiv'
        ];
      })
    };

    // 6. Desenăm tabelul în document cu opțiuni de design
    await doc.table(table, {
      addPage: false,
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
      prepareRow: (row, index, column, rect, rowNumber) => {
        doc.font('Helvetica').fontSize(9);
        // Alternăm culorile rândurilor (zebra striping) la fel ca în PrimeNG
        if (rowNumber !== undefined && Number(rowNumber) % 2 === 0) {
          doc.fillColor('#f8fafc');
        }
      }
    });

  // =========================================================================
    // NUMĂRAREA PAGINILOR (O adăugăm la final, după ce tabelul a generat totul)
    // =========================================================================
    const range = doc.bufferedPageRange(); // Returnează { start: 0, count: X }
    console.log('|| range || ==', range);
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i); // Ne mutăm virtual pe pagina i
      
      const footerY = doc.page.height - 40;
      doc.save();
      doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text(
        `Pagina ${i + 1} din ${range.count}`, 
        doc.page.width - 100, 
        footerY, 
        { align: 'right', width: 70 }
      );
      doc.restore();
    }

    doc.end();
  } catch (error) {
    console.error('Eroare la generarea PDF:', error);
    res.status(500).json({ error: 'Eroare internă de server la generarea fișierului PDF.' });
  }
});



// const SORT_LABELS: Record<string, string> = {
//   customer_first_name: 'Client',
//   customer_phone: 'Telefon',
//   barber_first_name: 'Frizer',
//   service_name: 'Serviciu',
//   service_price: 'Pret',
//   start_time: 'Data',
//   appointment_customer_rating: 'Rating client',
//   status: 'Status',
// };


// router.get('/admin-dashboard-pdf', authenticateToken, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
//   try {


//     const { barberId, status, startDate, endDate,  customerName, serviceId, searchQuery, sortField, sortOrder  } = req.query;

//     // 1. Pregătim parametrii pentru funcția SQL (la fel ca la lista simplă)
//     const p_barber_id = barberId ? parseInt(String(barberId), 10) : null;
//     const p_status = status ? String(status) : null;
//     const p_start_date = formatToSqlDate(startDate);
//     const p_end_date = formatToSqlDate(endDate);    
//     const p_customer_name = customerName ? String(customerName) : null;
//     const p_service_id = serviceId ? parseInt(String(serviceId), 10) : null;
//     const p_search_query = searchQuery ? String(searchQuery) : null;
//     const p_sort_field = sortField ? String(sortField) : null;
//     const p_sort_order = sortOrder ? String(sortOrder) : null;
    
//     // Pentru export, vrem TOATE înregistrările filtrate, nu doar o pagină.
//     // Setăm o limită foarte mare și offset 0.
//     const p_limit = 100000; 
//     const p_offset = 0;

//     // 2. Apelăm funcția din pgAdmin
//     const dbResponse = await prisma.$queryRaw<QUERY_RAW_ADMIN_APPOINTMENTS_LIST_RESULT[]>`
//       SELECT public.get_admin_appointments_json(
//         ${p_barber_id}, 
//         ${p_status}, 
//         ${p_start_date}, 
//         ${p_end_date}, 
//         ${p_limit}, 
//         ${p_offset}, 
//         ${p_customer_name}, 
//         ${p_service_id},
//         ${p_search_query},
//         ${p_sort_field},
//         ${p_sort_order}
//       ) AS result
//     `;
    
//     // console.log("==|| /api/admin-dashboard-pdf || == dbResponse == ", dbResponse);
//     // console.log("==|| /api/admin-dashboard-pdf || == dbResponse[0]?.result == ", dbResponse[0]?.result)


//     // Extragem obiectul { data: [...], total: X }
//     const appointmentsData = dbResponse[0]?.result || { data: [], total: 0 };

//     // console.log("== || /api/export-pdf/admin-dashboard-pdf || == result[0]?.response ==", dbResponse[0]?.result)

//     const list = appointmentsData.data || [];

//     // Calea absolută către imaginea ta de logo PNG
//     const logoPath = path.join(__dirname, '../../assets/logo-saloon.png');

//     // console.log("==|| logoPath ||==", logoPath)

//     // 3. Configurație document PDF (Format A4, orientare Landscape pentru a avea loc toate coloanele)
//     const doc = new PDFDocument({ 
//      // margin: 30, 
//       margins: { top: 30, bottom: 60, left: 30, right: 30 }, 
//       size: 'A4', 
//       layout: 'landscape' ,
//       bufferPages: true 
//     });

//     // Setăm header-ele HTTP pentru descărcare fișier
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', 'attachment; filename=raport-programari.pdf');

//     // Conectăm fluxul PDF direct la răspunsul Express
//     doc.pipe(res);

//     const generateHeaderFooter = () => {
//       // Salvează starea curentă a stilului (pentru a nu strica fontul tabelului)
//       doc.save();

//       // --- HEADER ---
//       try {
//         // Adăugăm imaginea PNG în colțul din stânga sus (X: 30, Y: 15, lățime: 50px)
//         doc.image(logoPath, 30, 15, { width: 50 });
//       } catch (imgError) {
//         // Dacă imaginea lipsește la cale, punem un text ca să nu crape serverul
//         doc.fontSize(10).fillColor('#64748b').text('[LOGO SALON]', 30, 30);
//       }

//       // Adăugăm textul din Header în dreapta logoului
//       doc.font('Helvetica-Bold').fontSize(16).fillColor('#1e293b').text('BARBER SHOP MANAGEMENT', 95, 25);
//       doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(`Raport administrativ generat la: ${new Date().toLocaleString('ro-RO')}`, 95, 45);

//       // Desenăm o linie elegantă de separare sub header (X_start: 30, Y: 70, X_end: 792 - 30)
//       doc.moveTo(30, 70).lineTo(doc.page.width - 30, 70).lineWidth(1).strokeColor('#e2e8f0').stroke();

//       // --- FOOTER ---
//       const footerY = doc.page.height - 40; // Poziția pe verticală a subsolului

//       // Linie de separare deasupra footer-ului
//       doc.moveTo(30, footerY - 5).lineTo(doc.page.width - 30, footerY - 5).lineWidth(0.5).strokeColor('#e2e8f0').stroke();

//       // Text în stânga footer-ului
//       doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text('Document confidential - Uz intern', 30, footerY);

//       // Restaurăm starea anterioară a stilului documentului
//       doc.restore();

//       // Mutăm cursorul sub linia de header, ca tabelul să nu scrie peste el
//       //doc.y = 500;
//     };


//     // =========================================================================
//     // DECLANȘATOARE DE PAGINI (Evenimente PDFKit)
//     // =========================================================================
    
//     // Generăm header/footer manual pentru PRIMA pagină (deoarece ea se creează instant)
//     generateHeaderFooter();

//     // Pentru paginile următoare (2, 3, etc.) create automat de tabel, ascultăm evenimentul pageAdded
//     doc.on('pageAdded', () => {
//       generateHeaderFooter();
//     });

//     // =========================================================================
//     // CONSTRUIREA TEXTULUI PENTRU FILTRE APLICATE
//     // =========================================================================
//     let filtreText = '';

//     // Adăugăm Client (dacă există în listă, luăm numele complet din prima înregistrare găsită ca să fie frumos)
//     if (customerName) {
//       filtreText += `Client: ${String(customerName)} | `;
//     }
    
//     // startDate, endDate,
//     if(startDate && endDate){
//       filtreText += `Interval: ${String(startDate)} - ${String(endDate)} | `;
//     }else if(startDate && !endDate){
//       filtreText += `Toate programările incepand cu data: ${String(startDate)} | `;
//     }else if(!startDate && endDate){
//       filtreText += `Toate programările pana la data: ${String(endDate)} | `;
//     }
//     // Adăugăm Frizer
//     if (barberId && list.length > 0) {
//       // Extragem numele frizerului direct din prima înregistrare pentru a afișa text, nu ID
//       filtreText += `Frizer: ${list[0].barber_first_name} ${list[0].barber_last_name} | `;
//     } 

//     // Adăugăm Serviciu
//     if (serviceId && list.length > 0) {
//       filtreText += `Serviciu: ${list[0].service_name}`;
//     } 

//     if (searchQuery) {
//       filtreText += `Cautare: ${String(searchQuery)} | `;
//     }

//     if (sortField) {
//       const label = SORT_LABELS[String(sortField)] ?? String(sortField);
//       const direction = Number(sortOrder) === -1 ? 'DESC' : 'ASC';
//       filtreText += `Sortare: ${label} (${direction}) | `;
//     }


//     // Eliminăm eventualul caracter '|' rămas la final (opțional)
//     if (filtreText.endsWith(' | ')) {
//       filtreText = filtreText.slice(0, -3);
//     }

//     // =========================================================================
//     // DESENARE TEXT FILTRE PE PDF
//     // =========================================================================
//     // Linia de header se termină la Y: 70. Începem să scriem textul la Y: 80
//     doc.y = 80; 

//     doc.save();
//     doc.font('Helvetica-Bold').fontSize(10).fillColor('#1e293b')
//       .text('Filtre aplicate: ', 30, doc.y, { continued: true }); // continued: true lasă cursorul pe același rând

//     doc.font('Helvetica-Oblique').fontSize(10).fillColor('#475569')
//       .text(filtreText);
//     doc.restore();

//     // =========================================================================
//     // POZIȚIONARE CURSOR PENTRU TABEL
//     // =========================================================================
//     // Lăsăm un spațiu liber de 15 puncte sub textul de filtre înainte de a desena tabelul
//     doc.y = doc.y + 15; 

//       // doc.y = 90; 
//     // 5. Construim structura tabelului pentru pdfkit-table
//     const table = {
//       headers: [
//         { label: 'Data', property: 'dateTime', width: 120 },
//         { label: 'Client', property: 'customer', width: 140 },
//         { label: 'Telefon', property: 'phone', width: 90 },
//         { label: 'Frizer', property: 'barber', width: 120 },
//         { label: 'Serviciu', property: 'service', width: 130 },
//         { label: 'Pret', property: 'price', width: 60 },
//         { label: 'Status', property: 'status', width: 80 }
//       ],
//       // Mapăm datele primite din pgAdmin în rânduri text
//       rows: list.map((app) => {
//         const start = new Date(app.start_time);
//         const formattedDate = start.toLocaleDateString('ro-RO') + ' ' + 
//                               start.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

//         return [
//           formattedDate,
//           `${app.customer_first_name} ${app.customer_last_name}`,
//           app.customer_phone || '-',
//           `${app.barber_first_name} ${app.barber_last_name}`,
//           app.service_name,
//           `${app.service_price} RON`,
//           app.status.toUpperCase()
//         ];
//       })
//     };

//    // 6. Desenăm tabelul în document cu opțiuni de design
//     await doc.table(table, {
//       //addPage: false,
//       prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
//       prepareRow: (row, index, column, rect, rowNumber) => {
//         doc.font('Helvetica').fontSize(9);
//         // Alternăm culorile rândurilor (zebra striping) la fel ca în PrimeNG
//         if (rowNumber !== undefined && Number(rowNumber) % 2 === 0) {
//           doc.fillColor('#f8fafc');
//         }
//       }
//     });



//   // =========================================================================
//     // NUMĂRAREA PAGINILOR (O adăugăm la final, după ce tabelul a generat totul)
//     // =========================================================================
//     const range = doc.bufferedPageRange(); // Returnează { start: 0, count: X }
    
//     for (let i = range.start; i < range.start + range.count; i++) {
//       doc.switchToPage(i); // Ne mutăm virtual pe pagina i
      
//       const footerY = doc.page.height - 40;
//       doc.save();
//       doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text(
//         `Pagina ${i + 1} din ${range.count}`, 
//         doc.page.width - 100, 
//         footerY, 
//         { align: 'right', width: 70 }
//       );
//       doc.restore();
//     }

//     doc.flushPages();
//     doc.end();


//   } catch (error) {
//     console.error('Eroare la generarea PDF:', error);
//     res.status(500).json({ error: 'Eroare internă de server la generarea fișierului PDF.' });
//   }
// }); 




const SORT_LABELS: Record<string, string> = {
  customer_first_name: 'Client',
  customer_phone: 'Telefon',
  barber_first_name: 'Frizer',
  service_name: 'Serviciu',
  service_price: 'Pret',
  start_time: 'Data',
  appointment_customer_rating: 'Rating client',
  status: 'Status',
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmată',
  completed: 'Finalizată',
  cancelled: 'Anulată',
};

router.get('/admin-dashboard-pdf', authenticateToken, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { barberId, status, startDate, endDate, customerName, serviceId, searchQuery, sortField, sortOrder } = req.query;

    const p_barber_id = barberId ? parseInt(String(barberId), 10) : null;
    const p_status = status ? String(status) : null;
    const p_start_date = formatToSqlDate(startDate);
    const p_end_date = formatToSqlDate(endDate);
    const p_customer_name = customerName ? String(customerName) : null;
    const p_service_id = serviceId ? parseInt(String(serviceId), 10) : null;
    const p_search_query = searchQuery ? String(searchQuery) : null;
    const p_sort_field = sortField ? String(sortField) : null;
    const p_sort_order = sortOrder ? parseInt(String(sortOrder), 10) : null;

    const p_limit = 100000;
    const p_offset = 0;

    const dbResponse = await prisma.$queryRaw<QUERY_RAW_ADMIN_APPOINTMENTS_LIST_RESULT[]>`
      SELECT public.get_admin_appointments_json(
        ${p_barber_id}, 
        ${p_status}, 
        ${p_start_date}, 
        ${p_end_date}, 
        ${p_limit}, 
        ${p_offset}, 
        ${p_customer_name}, 
        ${p_service_id},
        ${p_search_query},
        ${p_sort_field},
        ${p_sort_order}
      ) AS result
    `;

    const appointmentsData = dbResponse[0]?.result || { data: [], total: 0 };
    const list = appointmentsData.data || [];

    const logoPath = path.join(__dirname, '../../assets/logo-saloon.png');

    const doc = new PDFDocument({
      margins: { top: 85, bottom: 60, left: 30, right: 30 },
      size: 'A4',
      layout: 'landscape',
      bufferPages: true
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=raport-programari.pdf');

    doc.pipe(res);

    /**
     * Scrie text în zona footer-ului fără ca PDFKit să adauge o pagină nouă.
     * Textul de sub `height - margins.bottom` declanșează altfel paginare automată.
     */
    const writeInFooterArea = (callback: () => void) => {
      const originalBottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      callback();
      doc.page.margins.bottom = originalBottom;
    };

    let drawingHeader = false;

    const generateHeaderFooter = () => {
      if (drawingHeader) return;
      drawingHeader = true;

      doc.save();

      // --- HEADER ---
      try {
        doc.image(logoPath, 30, 15, { width: 50 });
      } catch (imgError) {
        doc.fontSize(10).fillColor('#64748b')
           .text('[LOGO SALON]', 30, 30, { lineBreak: false });
      }

      doc.font('Helvetica-Bold').fontSize(16).fillColor('#1e293b')
         .text('BARBER SHOP MANAGEMENT', 95, 25, { lineBreak: false });

      doc.font('Helvetica').fontSize(9).fillColor('#64748b')
         .text(`Raport administrativ generat la: ${new Date().toLocaleString('ro-RO')}`, 95, 45, { lineBreak: false });

      doc.moveTo(30, 70).lineTo(doc.page.width - 30, 70)
         .lineWidth(1).strokeColor('#e2e8f0').stroke();

      // --- FOOTER ---
      const footerY = doc.page.height - 40;

      doc.moveTo(30, footerY - 5).lineTo(doc.page.width - 30, footerY - 5)
         .lineWidth(0.5).strokeColor('#e2e8f0').stroke();

      writeInFooterArea(() => {
        doc.font('Helvetica').fontSize(8).fillColor('#94a3b8')
           .text('Document confidential - Uz intern', 30, footerY, { lineBreak: false });
      });

      doc.restore();

      drawingHeader = false;
    };

    generateHeaderFooter();

    doc.on('pageAdded', () => {
      generateHeaderFooter();
    });

    // =========================================================================
    // TEXTUL PENTRU FILTRE APLICATE
    // =========================================================================
    let filtreText = '';

    if (customerName) {
      filtreText += `Client: ${String(customerName)} | `;
    }

    if (startDate && endDate) {
      filtreText += `Interval: ${String(startDate)} - ${String(endDate)} | `;
    } else if (startDate && !endDate) {
      filtreText += `Toate programările incepand cu data: ${String(startDate)} | `;
    } else if (!startDate && endDate) {
      filtreText += `Toate programările pana la data: ${String(endDate)} | `;
    }

    if (barberId && list.length > 0) {
      filtreText += `Frizer: ${list[0].barber_first_name} ${list[0].barber_last_name} | `;
    }

    if (serviceId && list.length > 0) {
      filtreText += `Serviciu: ${list[0].service_name} | `;
    }

    if (status) {
      filtreText += `Status: ${STATUS_LABELS[String(status)] ?? String(status)} | `;
    }

    if (searchQuery) {
      filtreText += `Cautare: ${String(searchQuery)} | `;
    }

    if (sortField) {
      const label = SORT_LABELS[String(sortField)] ?? String(sortField);
      const direction = Number(sortOrder) === -1 ? 'DESC' : 'ASC';
      filtreText += `Sortare: ${label} (${direction}) | `;
    }

    if (filtreText.endsWith(' | ')) {
      filtreText = filtreText.slice(0, -3);
    }

    // =========================================================================
    // DESENARE TEXT FILTRE
    // =========================================================================
    if (filtreText) {
      doc.y = 80;

      doc.save();
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#1e293b')
         .text('Filtre aplicate: ', 30, doc.y, { continued: true });
      doc.font('Helvetica-Oblique').fontSize(10).fillColor('#475569')
         .text(filtreText);
      doc.restore();

      doc.y = doc.y + 15;
    } else {
      doc.y = 85;
    }

    // `continued: true` lasă cursorul orizontal la finalul textului
    doc.x = doc.page.margins.left;

    // =========================================================================
    // TABELUL
    // =========================================================================
    const table = {
      headers: [
        { label: 'Data', property: 'dateTime', width: 110 },
        { label: 'Client', property: 'customer', width: 125 },
        { label: 'Telefon', property: 'phone', width: 85 },
        { label: 'Frizer', property: 'barber', width: 115 },
        { label: 'Serviciu', property: 'service', width: 160 },
        { label: 'Pret', property: 'price', width: 60 },
        { label: 'Status', property: 'status', width: 95 }
      ],
      rows: list.map((app) => {
        const start = new Date(app.start_time);
        const formattedDate = start.toLocaleDateString('ro-RO') + ' ' +
                              start.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

        return [
          formattedDate,
          `${app.customer_first_name} ${app.customer_last_name}`,
          app.customer_phone || '-',
          `${app.barber_first_name} ${app.barber_last_name}`,
          app.service_name,
          `${app.service_price} RON`,
          app.status.toUpperCase()
        ];
      })
    };

    await doc.table(table, {
      prepareHeader: () => {
        if (doc.y < 85) {
          doc.y = 85;
        }
        doc.font('Helvetica-Bold').fontSize(10);
      },
      prepareRow: (row, index, column, rect, rowNumber) => {
        doc.font('Helvetica').fontSize(9);
        if (rowNumber !== undefined && Number(rowNumber) % 2 === 0) {
          doc.fillColor('#f8fafc');
        }
      }
    });

    // =========================================================================
    // NUMEROTAREA PAGINILOR
    // =========================================================================
    const range = doc.bufferedPageRange();

    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      const footerY = doc.page.height - 40;

      doc.save();
      writeInFooterArea(() => {
        doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text(
          `Pagina ${i + 1} din ${range.count}`,
          doc.page.width - 100,
          footerY,
          { align: 'right', width: 70, lineBreak: false }
        );
      });
      doc.restore();
    }

    doc.flushPages();
    doc.end();

  } catch (error) {
    console.error('Eroare la generarea PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Eroare internă de server la generarea fișierului PDF.' });
    }
  }
});

router.get('/customer-dashboard-pdf', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {

    if (req.user?.role !== 'customer') {
      res.status(403).json({success: false, message: 'Acces interzis. Necesită drepturi de administrator.' });
      return;
    }

    // console.log('== || /api/export-pdf/customer-dashboard-pdf || == req.user', req.user);

    const { serviceId, maxPrice, maxDuration, barberId,  startDate, endDate, searchQuery } = req.query;
    const p_customer_id = req.user?.userId;


    // 1. Pregătim parametrii pentru funcția SQL (la fel ca la lista simplă)
    const p_barber_id = barberId ? parseInt(String(barberId), 10) : null;
    const p_service_id = serviceId ? parseInt(String(serviceId), 10) : null;
    const p_max_service_price = maxPrice ? parseInt(String(maxPrice), 10) : null;
    const p_max_service_duration = maxDuration ? parseInt(String(maxDuration), 10) : null;
    const p_start_date = formatToSqlDate(startDate);
    const p_end_date = formatToSqlDate(endDate);
    const p_search_query = searchQuery ? String(searchQuery) : null;
    
    // Pentru export, vrem TOATE înregistrările filtrate, nu doar o pagină.
    // Setăm o limită foarte mare și offset 0.
    const p_limit = 100000; 
    const p_offset = 0;

    // 2. Apelăm funcția din pgAdmin
    const dbResponse = await prisma.$queryRaw<QUERY_RAW_CUSTOMER_APPOINTMENTS_LIST_RESPONSE[]>`
      SELECT public.get_customer_appointments_history_json(
        ${p_customer_id},
        ${p_service_id},
        ${p_max_service_price},
        ${p_max_service_duration},
        ${p_barber_id},
        ${p_start_date},
        ${p_end_date},
        ${p_limit},
        ${p_offset},
        ${p_search_query}
      ) AS result
    `;

    // console.log("==|| /api/customer-dashboard-pdf || == dbResponse == ", dbResponse);
    // console.log("==|| /api/customer-dashboard-pdf || == dbResponse[0]?.result == ", dbResponse[0]?.result)


    // Extragem obiectul { data: [...], total: X }
    const appointmentsData = dbResponse[0]?.result || { data: [], total: 0 };
    const list = appointmentsData.data || [];

    // Calea absolută către imaginea ta de logo PNG
    const logoPath = path.join(__dirname, '../../assets/logo-saloon.png');

    // 3. Configurație document PDF (Format A4, orientare Landscape pentru a avea loc toate coloanele)
    const doc = new PDFDocument({ 
      margin: 30, 
      margins: { top: 30, bottom: 60, left: 30, right: 30 }, 
      size: 'A4', 
      layout: 'landscape' 
    });

    // Setăm header-ele HTTP pentru descărcare fișier
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=raport-programari-client.pdf');

    // Conectăm fluxul PDF direct la răspunsul Express
    doc.pipe(res);

    const generateHeaderFooter = () => {
      // Salvează starea curentă a stilului (pentru a nu strica fontul tabelului)
      doc.save();

      // --- HEADER ---
      try {
        // Adăugăm imaginea PNG în colțul din stânga sus (X: 30, Y: 15, lățime: 50px)
        doc.image(logoPath, 30, 15, { width: 50 });
      } catch (imgError) {
        // Dacă imaginea lipsește la cale, punem un text ca să nu crape serverul
        doc.fontSize(10).fillColor('#64748b').text('[LOGO SALON]', 30, 30);
      }

      // Adăugăm textul din Header în dreapta logoului
      doc.font('Helvetica-Bold').fontSize(16).fillColor('#1e293b').text('PROGRAMARI CLIENT MANAGEMENT', 95, 25);
      doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(`Raport istoric programari client generat la: ${new Date().toLocaleString('ro-RO')}`, 95, 45);

      // Desenăm o linie elegantă de separare sub header (X_start: 30, Y: 70, X_end: 792 - 30)
      doc.moveTo(30, 70).lineTo(doc.page.width - 30, 70).lineWidth(1).strokeColor('#e2e8f0').stroke();

      // --- FOOTER ---
      const footerY = doc.page.height - 40; // Poziția pe verticală a subsolului

      // Linie de separare deasupra footer-ului
      doc.moveTo(30, footerY - 5).lineTo(doc.page.width - 30, footerY - 5).lineWidth(0.5).strokeColor('#e2e8f0').stroke();

      // Text în stânga footer-ului
      // doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text('Document confidential - Uz intern', 30, footerY);

      // Restaurăm starea anterioară a stilului documentului
      doc.restore();
    };


    // =========================================================================
    // DECLANȘATOARE DE PAGINI (Evenimente PDFKit)
    // =========================================================================
    
    // Generăm header/footer manual pentru PRIMA pagină (deoarece ea se creează instant)
    generateHeaderFooter();

    // Pentru paginile următoare (2, 3, etc.) create automat de tabel, ascultăm evenimentul pageAdded
    doc.on('pageAdded', () => {
      generateHeaderFooter();
    });

    // =========================================================================
    // CONSTRUIREA TEXTULUI PENTRU FILTRE APLICATE
    // =========================================================================
    let filtreText = '';

    // startDate, endDate,
    if(startDate && endDate){
      filtreText += `Toate programarile din intervalul: ${String(startDate)} - ${String(endDate)} | `;
    }else if(startDate && !endDate){
      filtreText += `Toate programarile incepand cu data de: ${String(startDate)} | `;
    }else if(!startDate && endDate){
      filtreText += `Toate programarile pana la data de: ${String(endDate)} | `;
    }
    // Adăugăm Frizer
    if (p_barber_id && list.length > 0) {
      // Extragem numele frizerului direct din prima înregistrare pentru a afișa text, nu ID
      filtreText += `Frizer: ${list[0].barber_name} | `;
    } 

    // Adăugăm Serviciu
    if (p_service_id && list.length > 0) {
      filtreText += `Serviciu: ${list[0].service_name}`;
    } 

    if (p_max_service_price && list.length > 0) {
      filtreText += `Pret maxim: ${p_max_service_price} RON`;
    }
    
    if (p_max_service_duration && list.length > 0) {
      filtreText += `Pret maxim: ${p_max_service_duration} RON`;
    } 

    if (searchQuery) {
      filtreText += `Cautare: ${String(searchQuery)} | `;
    }



    // Eliminăm eventualul caracter '|' rămas la final (opțional)
    if (filtreText.endsWith(' | ')) {
      filtreText = filtreText.slice(0, -3);
    }

    // =========================================================================
    // DESENARE TEXT FILTRE PE PDF
    // =========================================================================
    // Linia de header se termină la Y: 70. Începem să scriem textul la Y: 80
    doc.y = 80; 

    doc.save();
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#1e293b')
      .text('Filtre aplicate: ', 30, doc.y, { continued: true }); // continued: true lasă cursorul pe același rând

    doc.font('Helvetica-Oblique').fontSize(10).fillColor('#475569')
      .text(filtreText);
    doc.restore();

    // =========================================================================
    // POZIȚIONARE CURSOR PENTRU TABEL
    // =========================================================================
    // Lăsăm un spațiu liber de 15 puncte sub textul de filtre înainte de a desena tabelul
    doc.y = doc.y + 15; 

      // doc.y = 90; 
    // 5. Construim structura tabelului pentru pdfkit-table
    const table = {
      headers: [
        { label: 'Serviciu', property: 'service_name', width: 120 },
        { label: 'Durata', property: 'service_duration', width: 90 },

        { label: 'Frizer', property: 'barber_name', width: 140 },
        { label: 'Pret', property: 'service_price', width: 120 },
        { label: 'Data/ora', property: 'start_time', width: 130 },
        { label: 'Status', property: 'status', width: 60 },
      ],
      // Mapăm datele primite din pgAdmin în rânduri text
      rows: list.map((app) => {
        const start = new Date(app.start_time);
        const formattedDate = start.toLocaleDateString('ro-RO') + ' ' + 
                              start.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

        return [
          app.service_name,
          `${app.service_duration} min`,
          app.barber_name,
          `${app.service_price} RON`,  
          formattedDate,  
          app.status.toUpperCase()
          
        ];
      })
    };

    // 6. Desenăm tabelul în document cu opțiuni de design
    await doc.table(table, {
      addPage: false,
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
      prepareRow: (row, index, column, rect, rowNumber) => {
        doc.font('Helvetica').fontSize(9);
        // Alternăm culorile rândurilor (zebra striping) la fel ca în PrimeNG
        if (rowNumber !== undefined && Number(rowNumber) % 2 === 0) {
          doc.fillColor('#f8fafc');
        }
      }
    });

  // =========================================================================
    // NUMĂRAREA PAGINILOR (O adăugăm la final, după ce tabelul a generat totul)
    // =========================================================================
    const range = doc.bufferedPageRange(); // Returnează { start: 0, count: X }
    
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i); // Ne mutăm virtual pe pagina i
      
      const footerY = doc.page.height - 40;
      doc.save();
      doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text(
        `Pagina ${i + 1} din ${range.count}`, 
        doc.page.width - 100, 
        footerY, 
        { align: 'right', width: 70 }
      );
      doc.restore();
    }

    doc.end();
  } catch (error) {
    console.error('Eroare la generarea PDF:', error);
    res.status(500).json({ error: 'Eroare internă de server la generarea fișierului PDF.' });
  }
});



router.get('/barber-dashboard-pdf', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {

    //  console.log("==|| get-barber-appointments-list ||== req.user ==", req.user)

    if (req.user?.role !== 'barber') {
      res.status(403).json({success: false, message: 'Acces interzis. Necesită drepturi de administrator.' });
      return;
    }

    // console.log('== || /api/export-pdf/customer-dashboard-pdf || == req.user', req.user);

    const { serviceId, maxPrice, maxDuration, barberId,  startDate, endDate, searchQuery } = req.query;
    const p_barber_id = req.user?.userId;


    // 1. Pregătim parametrii pentru funcția SQL (la fel ca la lista simplă)
    const p_service_id = serviceId ? parseInt(String(serviceId), 10) : null;
    const p_max_service_price = maxPrice ? parseInt(String(maxPrice), 10) : null;
    const p_max_service_duration = maxDuration ? parseInt(String(maxDuration), 10) : null;
    const p_start_date = formatToSqlDate(startDate);
    const p_end_date = formatToSqlDate(endDate);
    const p_search_query = searchQuery ? String(searchQuery) : null;
    
    // Pentru export, vrem TOATE înregistrările filtrate, nu doar o pagină.
    // Setăm o limită foarte mare și offset 0.
    const p_limit = 100000; 
    const p_offset = 0;

    // 2. Apelăm funcția din pgAdmin
    const dbResponse = await prisma.$queryRaw<QUERY_RAW_BARBER_APPOINTMENTS_LIST_RESPONSE[]>`
      SELECT public.get_barber_appointments_history_json(
        ${p_barber_id},
        ${p_service_id},
        ${p_max_service_price},
        ${p_max_service_duration},
        ${null},
        ${p_start_date},
        ${p_end_date},
        ${p_limit},
        ${p_offset},
        ${p_search_query}
      ) AS result
    `;

    // ${null},//customer_id

    // console.log("==|| /api/customer-dashboard-pdf || == dbResponse == ", dbResponse);
    // console.log("==|| /api/customer-dashboard-pdf || == dbResponse[0]?.result == ", dbResponse[0]?.result)


    // Extragem obiectul { data: [...], total: X }
    const appointmentsData = dbResponse[0]?.result || { data: [], total: 0 };
    const list = appointmentsData.data || [];

    // Calea absolută către imaginea ta de logo PNG
    const logoPath = path.join(__dirname, '../../assets/logo-saloon.png');

    // 3. Configurație document PDF (Format A4, orientare Landscape pentru a avea loc toate coloanele)
    const doc = new PDFDocument({ 
      margin: 30, 
      margins: { top: 30, bottom: 60, left: 30, right: 30 }, 
      size: 'A4', 
      layout: 'landscape' 
    });

    // Setăm header-ele HTTP pentru descărcare fișier
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=raport-programari-client.pdf');

    // Conectăm fluxul PDF direct la răspunsul Express
    doc.pipe(res);

    const generateHeaderFooter = () => {
      // Salvează starea curentă a stilului (pentru a nu strica fontul tabelului)
      doc.save();

      // --- HEADER ---
      try {
        // Adăugăm imaginea PNG în colțul din stânga sus (X: 30, Y: 15, lățime: 50px)
        doc.image(logoPath, 30, 15, { width: 50 });
      } catch (imgError) {
        // Dacă imaginea lipsește la cale, punem un text ca să nu crape serverul
        doc.fontSize(10).fillColor('#64748b').text('[LOGO SALON]', 30, 30);
      }

      // Adăugăm textul din Header în dreapta logoului
      doc.font('Helvetica-Bold').fontSize(16).fillColor('#1e293b').text('MANAGEMENT PROGRAMARI FRIZER', 95, 25);
      doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(`Raport management programari frizer generat la: ${new Date().toLocaleString('ro-RO')}`, 95, 45);

      // Desenăm o linie elegantă de separare sub header (X_start: 30, Y: 70, X_end: 792 - 30)
      doc.moveTo(30, 70).lineTo(doc.page.width - 30, 70).lineWidth(1).strokeColor('#e2e8f0').stroke();

      // --- FOOTER ---
      const footerY = doc.page.height - 40; // Poziția pe verticală a subsolului

      // Linie de separare deasupra footer-ului
      doc.moveTo(30, footerY - 5).lineTo(doc.page.width - 30, footerY - 5).lineWidth(0.5).strokeColor('#e2e8f0').stroke();

      // Text în stânga footer-ului
      // doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text('Document confidential - Uz intern', 30, footerY);

      // Restaurăm starea anterioară a stilului documentului
      doc.restore();
    };


    // =========================================================================
    // DECLANȘATOARE DE PAGINI (Evenimente PDFKit)
    // =========================================================================
    
    // Generăm header/footer manual pentru PRIMA pagină (deoarece ea se creează instant)
    generateHeaderFooter();

    // Pentru paginile următoare (2, 3, etc.) create automat de tabel, ascultăm evenimentul pageAdded
    doc.on('pageAdded', () => {
      generateHeaderFooter();
    });

    // =========================================================================
    // CONSTRUIREA TEXTULUI PENTRU FILTRE APLICATE
    // =========================================================================
    let filtreText = '';

    // startDate, endDate,
    if(startDate && endDate){
      filtreText += `Toate programarile din intervalul: ${String(startDate)} - ${String(endDate)} | `;
    }else if(startDate && !endDate){
      filtreText += `Toate programarile incepand cu data de: ${String(startDate)} | `;
    }else if(!startDate && endDate){
      filtreText += `Toate programarile pana la data de: ${String(endDate)} | `;
    }
    // Adăugăm Frizer
    // if (p_barber_id && list.length > 0) {
    //   // Extragem numele frizerului direct din prima înregistrare pentru a afișa text, nu ID
    //   filtreText += `Frizer: ${list[0].barber_name} | `;
    // } 

    // Adăugăm Serviciu
    if (p_service_id && list.length > 0) {
      filtreText += `Serviciu: ${list[0].service_name}`;
    } 

    if (p_max_service_price && list.length > 0) {
      filtreText += `Pret maxim: ${p_max_service_price} RON`;
    }
    
    if (p_max_service_duration && list.length > 0) {
      filtreText += `Pret maxim: ${p_max_service_duration} RON`;
    } 

    if (searchQuery) {
      filtreText += `Cautare: ${String(searchQuery)} | `;
    }



    // Eliminăm eventualul caracter '|' rămas la final (opțional)
    if (filtreText.endsWith(' | ')) {
      filtreText = filtreText.slice(0, -3);
    }

    // =========================================================================
    // DESENARE TEXT FILTRE PE PDF
    // =========================================================================
    // Linia de header se termină la Y: 70. Începem să scriem textul la Y: 80
    doc.y = 80; 

    doc.save();
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#1e293b')
      .text('Filtre aplicate: ', 30, doc.y, { continued: true }); // continued: true lasă cursorul pe același rând

    doc.font('Helvetica-Oblique').fontSize(10).fillColor('#475569')
      .text(filtreText);
    doc.restore();

    // =========================================================================
    // POZIȚIONARE CURSOR PENTRU TABEL
    // =========================================================================
    // Lăsăm un spațiu liber de 15 puncte sub textul de filtre înainte de a desena tabelul
    doc.y = doc.y + 15; 

      // doc.y = 90; 
    // 5. Construim structura tabelului pentru pdfkit-table
    const table = {
      headers: [
        { label: 'Serviciu', property: 'service_name', width: 120 },
        { label: 'Durata', property: 'service_duration', width: 90 },

        { label: 'Client', property: 'customer_name', width: 140 },
        { label: 'Pret', property: 'service_price', width: 120 },
        { label: 'Data/ora', property: 'start_time', width: 130 },
        { label: 'Status', property: 'status', width: 60 },
      ],
      // Mapăm datele primite din pgAdmin în rânduri text
      rows: list.map((app) => {
        const start = new Date(app.start_time);
        const formattedDate = start.toLocaleDateString('ro-RO') + ' ' + 
                              start.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

        return [
          app.service_name,
          `${app.service_duration} min`,
          app.customer_name,
          `${app.service_price} RON`,  
          formattedDate,  
          app.status.toUpperCase()
          
        ];
      })
    };

    // 6. Desenăm tabelul în document cu opțiuni de design
    await doc.table(table, {
      addPage: false,
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
      prepareRow: (row, index, column, rect, rowNumber) => {
        doc.font('Helvetica').fontSize(9);
        // Alternăm culorile rândurilor (zebra striping) la fel ca în PrimeNG
        if (rowNumber !== undefined && Number(rowNumber) % 2 === 0) {
          doc.fillColor('#f8fafc');
        }
      }
    });

  // =========================================================================
    // NUMĂRAREA PAGINILOR (O adăugăm la final, după ce tabelul a generat totul)
    // =========================================================================
    const range = doc.bufferedPageRange(); // Returnează { start: 0, count: X }
    
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i); // Ne mutăm virtual pe pagina i
      
      const footerY = doc.page.height - 40;
      doc.save();
      doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text(
        `Pagina ${i + 1} din ${range.count}`, 
        doc.page.width - 100, 
        footerY, 
        { align: 'right', width: 70 }
      );
      doc.restore();
    }

    doc.end();
  } catch (error) {
    console.error('Eroare la generarea PDF:', error);
    res.status(500).json({ error: 'Eroare internă de server la generarea fișierului PDF.' });
  }
});





export default router;