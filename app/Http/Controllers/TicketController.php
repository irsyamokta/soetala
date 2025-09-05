<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\ValidationHelper;
use App\Models\Ticket;
use App\Models\TicketCategory;
use Illuminate\Support\Facades\DB;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function index()
    {
        $tickets = Ticket::with('categories')->get();

        return Inertia::render('Admin/Ticket', compact('tickets'));
    }

    public function show($id)
    {
        $ticket = Ticket::with('categories')->findOrFail($id);

        return Inertia::render('Admin/Ticket/Show', compact('ticket'));
    }

    public function store(Request $request)
    {
        $validator = ValidationHelper::ticket($request->all(), false);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $validated = $validator->validated();

        try {
            DB::beginTransaction();

            if ($request->hasFile('thumbnail')) {
                $uploaded = Cloudinary::uploadApi()->upload(
                    $request->file('thumbnail')->getRealPath(),
                    ['folder' => 'images/tickets']
                );

                $validated['thumbnail']  = $uploaded['secure_url'];
                $validated['public_id']  = $uploaded['public_id'];
            }

            $ticket = Ticket::create($validated);

            if ($request->has('categories')) {
                foreach ($request->categories as $cat) {
                    TicketCategory::create([
                        'ticket_id'      => $ticket->id,
                        'category_name'  => $cat['category_name'] ?? '',
                        'description'    => $cat['description'],
                        'price'          => $cat['price'] ?? 0,
                    ]);
                }
            }

            DB::commit();

            return redirect()
                ->route('dashboard.ticket')
                ->with('success', 'Tiket berhasil dibuat.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal membuat tiket: ' . $e->getMessage())->withInput();
        }
    }

    public function update(Request $request, $id)
    {
        $ticket = Ticket::findOrFail($id);

        $validator = ValidationHelper::ticket($request->all(), true);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $validated = $validator->validated();

        try {
            DB::beginTransaction();

            if ($request->hasFile('thumbnail')) {
                if ($ticket->public_id) {
                    Cloudinary::uploadApi()->destroy($ticket->public_id);
                }

                $uploaded = Cloudinary::uploadApi()->upload(
                    $request->file('thumbnail')->getRealPath(),
                    ['folder' => 'images/tickets']
                );

                $validated['thumbnail']  = $uploaded['secure_url'];
                $validated['public_id']  = $uploaded['public_id'];
            } else {
                $validated['thumbnail'] = $ticket->thumbnail;
                $validated['public_id'] = $ticket->public_id;
            }

            $ticket->update($validated);

            $ticket->categories()->delete();
            if ($request->has('categories')) {
                foreach ($request->categories as $cat) {
                    TicketCategory::create([
                        'ticket_id'      => $ticket->id,
                        'category_name'  => $cat['category_name'] ?? '',
                        'description'    => $cat['description'],
                        'price'          => $cat['price'] ?? 0,
                    ]);
                }
            }

            DB::commit();

            return redirect()
                ->route('dashboard.ticket')
                ->with('success', 'Tiket berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal memperbarui tiket: ' . $e->getMessage())->withInput();
        }
    }

    public function destroy($id)
    {
        $ticket = Ticket::findOrFail($id);

        try {
            DB::beginTransaction();

            if ($ticket->public_id) {
                Cloudinary::uploadApi()->destroy($ticket->public_id);
            }

            $ticket->delete();

            DB::commit();

            return redirect()
                ->route('dashboard.ticket')
                ->with('success', 'Tiket berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menghapus tiket: ' . $e->getMessage());
        }
    }
}
