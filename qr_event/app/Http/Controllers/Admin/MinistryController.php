<?php

namespace App\Http\Controllers\Admin;

use App\Models\Ministry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Inertia\Response;

class MinistryController extends Controller
{
    /**
     * Display a listing of the ministries.
     */
    public function index(): Response
    {
        $ministries = Ministry::all();

        return Inertia::render('admin/ministries/index', [
            'ministries' => $ministries,
        ]);
    }

    /**
     * Show the form for creating a new ministry.
     */
    public function create(): Response
    {
        return Inertia::render('admin/ministries/create');
    }

    /**
     * Store a newly created ministry in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,gif,webp|max:2048',
            'banner' => 'nullable|image|mimes:jpeg,png,gif,webp|max:2048',
        ]);

        $data = ['name' => $validated['name']];

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('ministries/logos', 'public');
        }

        if ($request->hasFile('banner')) {
            $data['banner'] = $request->file('banner')->store('ministries/banners', 'public');
        }

        Ministry::create($data);

        return redirect()->route('admin.ministries.index')
            ->with('success', 'Ministry created successfully.');
    }

    /**
     * Display the specified ministry.
     */
    public function show(Ministry $ministry): Response
    {
        return Inertia::render('admin/ministries/show', [
            'ministry' => $ministry,
        ]);
    }

    /**
     * Show the form for editing the specified ministry.
     */
    public function edit(Ministry $ministry): Response
    {
        return Inertia::render('admin/ministries/edit', [
            'ministry' => $ministry,
        ]);
    }

    /**
     * Update the specified ministry in storage.
     */
    public function update(Request $request, Ministry $ministry): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,gif,webp|max:2048',
            'banner' => 'nullable|image|mimes:jpeg,png,gif,webp|max:2048',
        ]);

        $data = ['name' => $validated['name']];

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('ministries/logos', 'public');
        }

        if ($request->hasFile('banner')) {
            $data['banner'] = $request->file('banner')->store('ministries/banners', 'public');
        }

        $ministry->update($data);

        return redirect()->route('admin.ministries.index')
            ->with('success', 'Ministry updated successfully.');
    }

    /**
     * Remove the specified ministry from storage.
     */
    public function destroy(Ministry $ministry): RedirectResponse
    {
        $ministry->delete();

        return redirect()->route('admin.ministries.index')
            ->with('success', 'Ministry deleted successfully.');
    }
}
