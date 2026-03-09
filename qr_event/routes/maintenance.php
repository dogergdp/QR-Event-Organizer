<?php

use Illuminate\Support\Facades\Route;

Route::get('/maintenance', function () {
    return view('maintenance');
})->name('maintenance');
