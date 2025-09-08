<?php

namespace App\Exports;

use App\Models\TicketOrder;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class VisitorsExport implements FromCollection, WithHeadings
{
    protected $date;

    public function __construct($date)
    {
        $this->date = $date;
    }

    public function collection()
    {
        try {
            $parsedDate = Carbon::parse($this->date)->setTimezone('Asia/Jakarta')->startOfDay();

            $collection = TicketOrder::whereDate('used_at', $parsedDate)
                ->with('category')
                ->get();

            return $collection->map(function ($ticket) {
                return [
                    'Nama' => $ticket->buyer_name,
                    'Kategori Tiket' => $ticket->category->category_name ?? '-',
                    'Jumlah' => $ticket->quantity,
                    'Status' => $ticket->used_at ? 'Checkin' : 'Belum Checkin',
                    'Tanggal' => $ticket->used_at
                        ? Carbon::parse($ticket->used_at)->setTimezone('Asia/Jakarta')->format('d/m/Y H:i')
                        : '-',
                ];
            });
        } catch (\Exception $e) {
            \Log::error('Error in VisitorsExport: ' . $e->getMessage());
            return collect([]);
        }
    }

    public function headings(): array
    {
        return ['Nama', 'Kategori Tiket', 'Jumlah', 'Status', 'Tanggal'];
    }
}
