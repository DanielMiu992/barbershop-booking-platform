// Adaugă export la începutul funcției
export function formatToSqlDate(dateStr: any): string | null {
  if (!dateStr) return null;
  const str = String(dateStr).trim();
  
  // Dacă data conține caractere '/' (format european DD/MM/YYYY)
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`; // Returnează YYYY-MM-DD
    }
  }
  
  // Dacă este deja în format corect sau alt format, o returnăm ca atare
  return str;
}