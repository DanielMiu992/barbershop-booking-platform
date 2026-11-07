import { TableLazyLoadEvent } from 'primeng/table';
import { Table } from 'primeng/table';

export interface ResolvedSort {
  sortField: string | undefined;
  sortOrder: number | undefined;
}

export class RemovableSortTracker {

    private lastSortField: string | null = null;
    private lastSortOrder: number = 0;

        /**
     * Extrage sortField/sortOrder din event si trateaza al 3-lea click
     * consecutiv pe aceeasi coloana ca eliminare a sortarii.
     * `table` e optional; daca e furnizat, resincronizeaza si iconita din header.
     */


    resolve(event: TableLazyLoadEvent, table?: Table | null): ResolvedSort {
        let sortField: string | undefined = ((Array.isArray(event.sortField) ? event.sortField[0] : event.sortField) ?? undefined)?.trim() || undefined;       
       
        let sortOrder: number | undefined = event.sortOrder ?? undefined;
        

        const isThirdClick =
            sortField != null &&
            sortField === this.lastSortField &&
            this.lastSortOrder === -1 &&
            sortOrder === 1;

        if (isThirdClick) {
            sortField = undefined;
            sortOrder = undefined;

            if (table) {
            table.sortField = null;
            table.sortOrder = 1;
            table.tableService.onSort(null);
            }
        }

        this.lastSortField = sortField ?? null;
        this.lastSortOrder = sortOrder ?? 0;

        return { sortField, sortOrder };
    }  

    /** Reseteaza starea (util cand se schimba filtrele si tabelul reporneste). */
    reset(): void {
        this.lastSortField = null;
        this.lastSortOrder = 0;
    }

}
