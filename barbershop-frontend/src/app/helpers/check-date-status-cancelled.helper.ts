export function  isAppointmentInPast(startTime: string): boolean {
    if (!startTime) return false;
    
    // Convertește string-ul "2026-07-30T17:00:00" într-un obiect Date local
    const appointmentDate = new Date(startTime);
    const currentDate = new Date();
    
    // Returnează true dacă ora programării este în trecut față de acum
    return appointmentDate.getTime() < currentDate.getTime();
}
